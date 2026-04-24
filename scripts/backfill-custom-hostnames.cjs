/**
 * Importa um hostname já existente na Cloudflare para o Neon (ex.: Oficina Muda).
 *
 * Uso (na raiz do projeto, com DATABASE_URL e tokens no .env):
 *   node scripts/backfill-custom-hostnames.cjs --hostname=suporte.oficinamuda.com.br --company-id=<UUID>
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { neon } = require('@neondatabase/serverless');
const {
  listCustomHostnames,
  getCustomHostname,
  mapCustomHostnameResult
} = require('../api/services/cloudflare.cjs');

function parseArgs() {
  const out = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function normalizeFqdn(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
}

async function main() {
  const args = parseArgs();
  const hostname = normalizeFqdn(args.hostname);
  const companyId = (args['company-id'] || args.company_id || '').trim();

  if (!hostname || !companyId) {
    console.error(
      'Uso: node scripts/backfill-custom-hostnames.cjs --hostname=suporte.cliente.com.br --company-id=<UUID>'
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não definido');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  const company = await sql`
    SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1
  `;
  if (company.length === 0) {
    console.error('Empresa não encontrada:', companyId);
    process.exit(1);
  }

  const existingPrimary = await sql`
    SELECT id FROM company_custom_hostnames
    WHERE company_id = ${companyId} AND is_primary = TRUE AND deleted_at IS NULL
    LIMIT 1
  `;
  if (existingPrimary.length > 0) {
    console.error(
      'Esta empresa já possui hostname primário. Remova no painel ou marque deleted_at antes de importar.'
    );
    process.exit(1);
  }

  const { hostnames } = await listCustomHostnames({ hostname });
  const match = (hostnames || []).find(
    (h) => normalizeFqdn(h.hostname) === hostname
  );
  if (!match || !match.id) {
    console.error('Hostname não encontrado na Cloudflare:', hostname);
    process.exit(1);
  }

  const cfResult = await getCustomHostname(match.id);
  const m = mapCustomHostnameResult(cfResult);

  const ownershipJson = m.ownership_verification != null
    ? JSON.stringify(m.ownership_verification)
    : null;
  const validationJson =
    m.validation_records != null ? JSON.stringify(m.validation_records) : null;
  const errorsJson =
    m.verification_errors != null ? JSON.stringify(m.verification_errors) : null;

  const inserted = await sql`
    INSERT INTO company_custom_hostnames (
      company_id,
      hostname,
      cloudflare_hostname_id,
      status,
      ssl_status,
      ssl_method,
      ownership_verification,
      validation_records,
      verification_errors,
      is_primary,
      last_checked_at
    ) VALUES (
      ${companyId},
      ${m.hostname},
      ${m.cloudflare_hostname_id},
      ${m.status},
      ${m.ssl_status},
      ${m.ssl_method},
      ${ownershipJson},
      ${validationJson},
      ${errorsJson},
      TRUE,
      NOW()
    )
    RETURNING id, hostname, status, ssl_status
  `;

  if (m.status === 'active' && m.ssl_status === 'active') {
    await sql`
      UPDATE company_custom_hostnames
      SET activated_at = COALESCE(activated_at, NOW())
      WHERE id = ${inserted[0].id}
    `;
  }

  console.log('Importado com sucesso:', inserted[0]);
  console.log('Empresa:', company[0].name);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
