const { sql } = require('../config/database.cjs');
const {
  getCustomHostname,
  mapCustomHostnameResult,
  CloudflareConfigError,
  CloudflareApiError
} = require('./cloudflare.cjs');
const { updateDbFromCfResult } = require('./custom-hostname-sync.cjs');
const { sendTransactionalEmail } = require('./mailer.cjs');

let intervalHandle = null;
let isTicking = false;

function getPollIntervalMs() {
  const raw = Number(process.env.CUSTOM_HOSTNAME_POLL_INTERVAL_MS);
  return Number.isFinite(raw) && raw >= 30_000 ? raw : 180_000;
}

function getMaxAgeHours() {
  const raw = Number(process.env.CUSTOM_HOSTNAME_POLL_MAX_AGE_HOURS);
  return Number.isFinite(raw) && raw > 0 ? raw : 72;
}

async function pickRecipientEmail(companyId) {
  const rows = await sql`
    SELECT email FROM users
    WHERE company_id = ${companyId} AND deleted_at IS NULL
    ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, created_at ASC
    LIMIT 1
  `;
  return rows[0]?.email || null;
}

async function sendActiveEmail({ to, hostname }) {
  const subject = 'Ticket Wise — domínio personalizado ativo';
  const html = `
    <div style="font-family: sans-serif; max-width: 560px;">
      <h2 style="color:#4c1d95;">Domínio ativo</h2>
      <p>O hostname <strong>${hostname}</strong> foi validado e está ativo na Cloudflare.</p>
      <p>Você já pode acessar o sistema pelo seu endereço personalizado (após o DNS propagar, se ainda estiver ajustando registros).</p>
      <p style="color:#6b7280;font-size:14px;">Equipe Ticket Wise</p>
    </div>
  `;
  return sendTransactionalEmail({ to, subject, html });
}

async function sendTimeoutEmail({ to, hostname, row }) {
  const ownership = row.ownership_verification;
  const records = row.validation_records;
  const ownBlock =
    ownership && typeof ownership === 'object'
      ? `<p><strong>TXT (propriedade):</strong> ${ownership.name || ''} → ${ownership.value || ''}</p>`
      : '';
  const txtBlock = Array.isArray(records)
    ? records
        .filter((r) => r.txt_name && r.txt_value)
        .map(
          (r) =>
            `<p><strong>TXT (certificado):</strong> ${r.txt_name} → ${r.txt_value}</p>`
        )
        .join('')
    : '';

  const subject = 'Ticket Wise — validação DNS do domínio personalizado';
  const html = `
    <div style="font-family: sans-serif; max-width: 560px;">
      <h2 style="color:#b45309;">Validação em atraso</h2>
      <p>O certificado do hostname <strong>${hostname}</strong> entrou em <strong>timeout de validação</strong>.</p>
      <p>Confira os registros abaixo no DNS do seu provedor ou use o botão "Trocar para TXT" no painel do Ticket Wise.</p>
      ${ownBlock}
      ${txtBlock}
      <p style="color:#6b7280;font-size:14px;">Equipe Ticket Wise</p>
    </div>
  `;
  return sendTransactionalEmail({ to, subject, html });
}

async function tickOnce() {
  if (isTicking) return;
  isTicking = true;
  try {
    if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
      return;
    }

    const maxHours = getMaxAgeHours();
    const rows = await sql`
      SELECT *
      FROM company_custom_hostnames
      WHERE deleted_at IS NULL
        AND cloudflare_hostname_id IS NOT NULL
        AND NOT (status = 'active' AND ssl_status = 'active')
        AND created_at > NOW() - (${maxHours} * INTERVAL '1 hour')
    `;

    for (const row of rows) {
      const beforeSsl = row.ssl_status;
      const beforeActiveEmail = row.email_notified_active_at;
      const beforeTimeoutEmail = row.email_notified_timeout_at;

      let cfResult;
      try {
        cfResult = await getCustomHostname(row.cloudflare_hostname_id);
      } catch (e) {
        if (e instanceof CloudflareConfigError || e instanceof CloudflareApiError) {
          console.warn('[custom-hostname-poller] GET CF:', e.message);
        } else {
          console.warn('[custom-hostname-poller] GET CF:', e);
        }
        continue;
      }

      await updateDbFromCfResult(sql, row.id, cfResult);
      const m = mapCustomHostnameResult(cfResult);

      const fullyActive = m.status === 'active' && m.ssl_status === 'active';
      const timedOut = m.ssl_status === 'validation_timed_out';
      const becameTimedOut =
        beforeSsl !== 'validation_timed_out' && timedOut;

      if (fullyActive && !beforeActiveEmail) {
        const to = await pickRecipientEmail(row.company_id);
        if (to) {
          await sendActiveEmail({ to, hostname: m.hostname });
        }
        await sql`
          UPDATE company_custom_hostnames
          SET email_notified_active_at = NOW()
          WHERE id = ${row.id} AND email_notified_active_at IS NULL
        `;
      }

      if (becameTimedOut && !beforeTimeoutEmail) {
        const to = await pickRecipientEmail(row.company_id);
        const refreshed = await sql`
          SELECT ownership_verification, validation_records
          FROM company_custom_hostnames WHERE id = ${row.id}
        `;
        const r = refreshed[0] || row;
        const parse = (v) => {
          if (v == null) return null;
          if (typeof v === 'object') return v;
          try {
            return JSON.parse(v);
          } catch {
            return null;
          }
        };
        if (to) {
          await sendTimeoutEmail({
            to,
            hostname: m.hostname,
            row: {
              ownership_verification: parse(r.ownership_verification),
              validation_records: parse(r.validation_records)
            }
          });
        }
        await sql`
          UPDATE company_custom_hostnames
          SET email_notified_timeout_at = NOW()
          WHERE id = ${row.id} AND email_notified_timeout_at IS NULL
        `;
      }

    }
  } finally {
    isTicking = false;
  }
}

function startCustomHostnamePoller() {
  if (intervalHandle) return;

  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
    console.warn(
      '[custom-hostname-poller] Desabilitado: defina CLOUDFLARE_API_TOKEN e CLOUDFLARE_ZONE_ID'
    );
    return;
  }

  const ms = getPollIntervalMs();
  intervalHandle = setInterval(() => {
    tickOnce().catch((e) =>
      console.error('[custom-hostname-poller] tick:', e)
    );
  }, ms);

  setTimeout(() => {
    tickOnce().catch((e) =>
      console.error('[custom-hostname-poller] initial tick:', e)
    );
  }, 15_000);

  console.log(
    `[custom-hostname-poller] Ativo (intervalo ${ms}ms, max age ${getMaxAgeHours()}h)`
  );
}

module.exports = {
  startCustomHostnamePoller,
  tickOnce
};
