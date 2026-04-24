const express = require('express');
const { sql } = require('../config/database.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');
const {
  createCustomHostname,
  getCustomHostname,
  listCustomHostnames,
  patchCustomHostnameSsl,
  deleteCustomHostname,
  mapCustomHostnameResult,
  sleep,
  CloudflareApiError,
  CloudflareConfigError
} = require('../services/cloudflare.cjs');
const { updateDbFromCfResult } = require('../services/custom-hostname-sync.cjs');

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const router = express.Router();

const CNAME_TARGET =
  process.env.CUSTOM_HOSTNAME_CNAME_TARGET || 'app.ticketwise.com.br';

function parseJsonb(val) {
  if (val == null) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

function normalizeFqdn(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
}

function isValidHostname(hostname) {
  if (!hostname || hostname.length > 253) return false;
  const labels = hostname.split('.');
  if (labels.length < 2) return false;
  const labelRe = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  for (const label of labels) {
    if (!label.length || label.length > 63) return false;
    if (!labelRe.test(label)) return false;
  }
  return true;
}

async function assertUserHasVisibleSubscription(userId) {
  const rows = await sql`
    SELECT 1
    FROM stripe_subscriptions ss
    JOIN stripe_customers c ON c.stripe_customer_id = ss.stripe_customer_id
    WHERE ss.user_id = ${userId}
      AND (
        ss.status = 'active'
        OR ss.status = 'trialing'
        OR ss.status = 'past_due'
        OR ss.status = 'unpaid'
        OR ss.status = 'incomplete'
      )
    LIMIT 1
  `;
  return rows.length > 0;
}

function mapRowToDto(row) {
  if (!row) return null;
  return {
    id: row.id,
    company_id: row.company_id,
    hostname: row.hostname,
    cloudflare_hostname_id: row.cloudflare_hostname_id,
    status: row.status,
    ssl_status: row.ssl_status,
    ssl_method: row.ssl_method,
    ownership_verification: parseJsonb(row.ownership_verification),
    validation_records: parseJsonb(row.validation_records),
    verification_errors: parseJsonb(row.verification_errors),
    is_primary: row.is_primary,
    last_checked_at: row.last_checked_at,
    activated_at: row.activated_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function loadPrimaryForCompany(companyId) {
  const rows = await sql`
    SELECT *
    FROM company_custom_hostnames
    WHERE company_id = ${companyId}
      AND is_primary = TRUE
      AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return rows[0] || null;
}

async function loadRowByIdForCompany(rowId, companyId) {
  const rows = await sql`
    SELECT *
    FROM company_custom_hostnames
    WHERE id = ${rowId}
      AND company_id = ${companyId}
      AND deleted_at IS NULL
    LIMIT 1
  `;
  return rows[0] || null;
}

async function saveCloudflareHostnameForCompany(companyId, cfResult) {
  const m = mapCustomHostnameResult(cfResult);
  const ownershipJson = m.ownership_verification
    ? JSON.stringify(m.ownership_verification)
    : null;
  const validationJson = m.validation_records ? JSON.stringify(m.validation_records) : null;
  const errorsJson = m.verification_errors ? JSON.stringify(m.verification_errors) : null;

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
    RETURNING *
  `;

  return inserted[0];
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Usuário sem empresa vinculada'
      });
    }

    const hasSub = await assertUserHasVisibleSubscription(req.user.id);
    if (!hasSub) {
      return res.status(403).json({
        success: false,
        error: 'Assinatura necessária para gerenciar domínio personalizado'
      });
    }

    const row = await loadPrimaryForCompany(companyId);
    return res.json({
      success: true,
      data: {
        primary: mapRowToDto(row),
        cname_target: CNAME_TARGET,
        docs_url:
          'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/issue-and-validate/validate-certificates/txt/'
      }
    });
  } catch (err) {
    console.error('[custom-hostname] GET:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro ao carregar hostname personalizado'
    });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Usuário sem empresa vinculada'
      });
    }

    const hasSub = await assertUserHasVisibleSubscription(req.user.id);
    if (!hasSub) {
      return res.status(403).json({
        success: false,
        error: 'Assinatura necessária para cadastrar domínio personalizado'
      });
    }

    const hostname = normalizeFqdn(req.body?.hostname);
    if (!isValidHostname(hostname)) {
      return res.status(400).json({
        success: false,
        error: 'Informe um hostname válido (ex.: suporte.suaempresa.com.br)'
      });
    }

    const existingPrimary = await loadPrimaryForCompany(companyId);
    if (existingPrimary) {
      return res.status(409).json({
        success: false,
        error: 'Já existe um hostname configurado. Remova-o antes de cadastrar outro.'
      });
    }

    const dupOther = await sql`
      SELECT id FROM company_custom_hostnames
      WHERE LOWER(hostname) = ${hostname}
        AND company_id <> ${companyId}
        AND deleted_at IS NULL
      LIMIT 1
    `;
    if (dupOther.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Este hostname já está em uso por outra conta'
      });
    }

    try {
      const { hostnames } = await listCustomHostnames({ hostname });
      const existingCf = (hostnames || []).find(
        (h) => (h.hostname || '').toLowerCase() === hostname
      );
      if (existingCf) {
        const linked = await sql`
          SELECT id, company_id FROM company_custom_hostnames
          WHERE cloudflare_hostname_id = ${existingCf.id}
            AND deleted_at IS NULL
          LIMIT 1
        `;

        if (linked.length > 0 && linked[0].company_id !== companyId) {
          return res.status(409).json({
            success: false,
            error: 'Este hostname já está vinculado a outra conta no Ticket Wise.'
          });
        }

        // Fluxo de "domínio já existe": sincroniza e vincula ao cliente atual.
        if (linked.length === 0) {
          let latestExisting = existingCf;
          try {
            latestExisting = await getCustomHostname(existingCf.id);
          } catch (syncErr) {
            console.warn('[custom-hostname] GET após detectar existente falhou:', syncErr?.message || syncErr);
          }

          const saved = await saveCloudflareHostnameForCompany(companyId, latestExisting);
          return res.status(200).json({
            success: true,
            message: 'Hostname existente encontrado na Cloudflare e vinculado com sucesso.',
            data: {
              primary: mapRowToDto(saved),
              cname_target: CNAME_TARGET
            }
          });
        } else {
          const row = await loadPrimaryForCompany(companyId);
          if (row) {
            return res.status(200).json({
              success: true,
              message: 'Hostname já estava vinculado a esta conta.',
              data: {
                primary: mapRowToDto(row),
                cname_target: CNAME_TARGET
              }
            });
          }
        }
      }
    } catch (e) {
      if (e instanceof CloudflareConfigError) {
        return res.status(503).json({
          success: false,
          error: 'Integração Cloudflare não configurada no servidor'
        });
      }
      console.warn('[custom-hostname] list CF antes de create:', e?.message || e);
    }

    let cfResult;
    try {
      cfResult = await createCustomHostname({ hostname, sslMethod: 'http' });
    } catch (e) {
      if (e instanceof CloudflareConfigError) {
        return res.status(503).json({
          success: false,
          error: 'Integração Cloudflare não configurada no servidor'
        });
      }
      if (e instanceof CloudflareApiError) {
        return res.status(502).json({
          success: false,
          error: e.message,
          details: e.errors
        });
      }
      throw e;
    }

    await sleep(2000);

    let latest = cfResult;
    try {
      latest = await getCustomHostname(cfResult.id);
    } catch (e) {
      console.warn('[custom-hostname] GET após create falhou, usando resultado do POST:', e?.message);
    }

    const inserted = await saveCloudflareHostnameForCompany(companyId, latest);

    return res.status(201).json({
      success: true,
      data: {
        primary: mapRowToDto(inserted[0]),
        cname_target: CNAME_TARGET
      }
    });
  } catch (err) {
    console.error('[custom-hostname] POST:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar hostname personalizado'
    });
  }
});

router.post('/:id/refresh', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Sem empresa vinculada' });
    }

    const hasSub = await assertUserHasVisibleSubscription(req.user.id);
    if (!hasSub) {
      return res.status(403).json({ success: false, error: 'Assinatura necessária' });
    }

    const row = await loadRowByIdForCompany(req.params.id, companyId);
    if (!row || !row.cloudflare_hostname_id) {
      return res.status(404).json({ success: false, error: 'Registro não encontrado' });
    }

    const cfResult = await getCustomHostname(row.cloudflare_hostname_id);
    await updateDbFromCfResult(sql, row.id, cfResult);

    const updated = await loadRowByIdForCompany(row.id, companyId);
    return res.json({
      success: true,
      data: { primary: mapRowToDto(updated), cname_target: CNAME_TARGET }
    });
  } catch (e) {
    if (e instanceof CloudflareConfigError) {
      return res.status(503).json({ success: false, error: e.message });
    }
    if (e instanceof CloudflareApiError) {
      return res.status(502).json({ success: false, error: e.message, details: e.errors });
    }
    console.error('[custom-hostname] refresh:', e);
    return res.status(500).json({ success: false, error: 'Erro ao atualizar status' });
  }
});

router.post('/:id/switch-to-txt', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Sem empresa vinculada' });
    }

    const hasSub = await assertUserHasVisibleSubscription(req.user.id);
    if (!hasSub) {
      return res.status(403).json({ success: false, error: 'Assinatura necessária' });
    }

    const row = await loadRowByIdForCompany(req.params.id, companyId);
    if (!row || !row.cloudflare_hostname_id) {
      return res.status(404).json({ success: false, error: 'Registro não encontrado' });
    }

    const cfResult = await patchCustomHostnameSsl(row.cloudflare_hostname_id, {
      method: 'txt'
    });
    await updateDbFromCfResult(sql, row.id, cfResult);

    const updated = await loadRowByIdForCompany(row.id, companyId);
    return res.json({
      success: true,
      data: { primary: mapRowToDto(updated), cname_target: CNAME_TARGET }
    });
  } catch (e) {
    if (e instanceof CloudflareConfigError) {
      return res.status(503).json({ success: false, error: e.message });
    }
    if (e instanceof CloudflareApiError) {
      return res.status(502).json({ success: false, error: e.message, details: e.errors });
    }
    console.error('[custom-hostname] switch-to-txt:', e);
    return res.status(500).json({ success: false, error: 'Erro ao alterar método de validação' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Sem empresa vinculada' });
    }

    const hasSub = await assertUserHasVisibleSubscription(req.user.id);
    if (!hasSub) {
      return res.status(403).json({ success: false, error: 'Assinatura necessária' });
    }

    const row = await loadRowByIdForCompany(req.params.id, companyId);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Registro não encontrado' });
    }

    if (row.cloudflare_hostname_id) {
      try {
        await deleteCustomHostname(row.cloudflare_hostname_id);
      } catch (e) {
        if (e instanceof CloudflareApiError && e.status !== 404) {
          return res.status(502).json({ success: false, error: e.message, details: e.errors });
        }
        console.warn('[custom-hostname] delete CF (ignorado se 404):', e?.message || e);
      }
    }

    await sql`
      UPDATE company_custom_hostnames
      SET deleted_at = NOW(), is_primary = FALSE, updated_at = NOW()
      WHERE id = ${row.id}
    `;

    return res.json({ success: true, message: 'Hostname removido' });
  } catch (e) {
    console.error('[custom-hostname] DELETE:', e);
    return res.status(500).json({ success: false, error: 'Erro ao remover hostname' });
  }
});

module.exports = router;
