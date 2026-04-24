const { mapCustomHostnameResult } = require('./cloudflare.cjs');

/**
 * Atualiza linha no Neon com o estado retornado pela Cloudflare.
 * @param {import('@neondatabase/serverless').NeonQueryFunction} sql
 * @param {string} rowId - UUID da linha company_custom_hostnames
 * @param {object} cfResult - objeto `result` do GET/PATCH/POST
 */
async function updateDbFromCfResult(sql, rowId, cfResult) {
  const m = mapCustomHostnameResult(cfResult);
  if (!m) return null;

  const ownershipJson = m.ownership_verification != null
    ? JSON.stringify(m.ownership_verification)
    : null;
  const validationJson =
    m.validation_records != null ? JSON.stringify(m.validation_records) : null;
  const errorsJson =
    m.verification_errors != null ? JSON.stringify(m.verification_errors) : null;

  const isFullyActive = m.status === 'active' && m.ssl_status === 'active';

  await sql`
    UPDATE company_custom_hostnames
    SET
      cloudflare_hostname_id = ${m.cloudflare_hostname_id},
      hostname = ${m.hostname},
      status = ${m.status},
      ssl_status = ${m.ssl_status},
      ssl_method = ${m.ssl_method},
      ownership_verification = ${ownershipJson},
      validation_records = ${validationJson},
      verification_errors = ${errorsJson},
      last_checked_at = NOW(),
      updated_at = NOW()
    WHERE id = ${rowId}
  `;

  if (isFullyActive) {
    await sql`
      UPDATE company_custom_hostnames
      SET activated_at = COALESCE(activated_at, NOW())
      WHERE id = ${rowId} AND activated_at IS NULL
    `;
  }

  return m;
}

module.exports = {
  updateDbFromCfResult
};
