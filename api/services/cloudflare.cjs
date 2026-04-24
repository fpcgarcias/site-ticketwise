/**
 * Cliente mínimo para Custom Hostnames (SSL for SaaS) — Cloudflare API v4.
 * @see https://developers.cloudflare.com/api/resources/custom_hostnames/methods/create/
 */

const CF_API = 'https://api.cloudflare.com/client/v4';

function getToken() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  return token ? token.trim() : '';
}

function getGlobalApiAuth() {
  const email = process.env.CLOUDFLARE_AUTH_EMAIL;
  const key = process.env.CLOUDFLARE_GLOBAL_API_KEY;
  if (!email || !key) {
    return null;
  }
  return {
    email: email.trim(),
    key: key.trim()
  };
}

function getAuthHeaders() {
  const token = getToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`
    };
  }

  const globalAuth = getGlobalApiAuth();
  if (globalAuth?.email && globalAuth?.key) {
    return {
      'X-Auth-Email': globalAuth.email,
      'X-Auth-Key': globalAuth.key
    };
  }

  throw new CloudflareConfigError(
    'Configure CLOUDFLARE_API_TOKEN ou (CLOUDFLARE_AUTH_EMAIL + CLOUDFLARE_GLOBAL_API_KEY)'
  );
}

function getZoneId() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!zoneId) {
    throw new CloudflareConfigError('CLOUDFLARE_ZONE_ID não configurado');
  }
  return zoneId;
}

class CloudflareConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CloudflareConfigError';
  }
}

class CloudflareApiError extends Error {
  constructor(status, errors, messages) {
    super(messages?.[0] || errors?.[0]?.message || `Cloudflare API error ${status}`);
    this.name = 'CloudflareApiError';
    this.status = status;
    this.errors = errors;
    this.messages = messages;
  }
}

async function cfRequest(method, path, body) {
  const authHeaders = getAuthHeaders();
  const url = `${CF_API}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json'
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const json = await res.json().catch(() => ({}));

  if (!json.success) {
    throw new CloudflareApiError(
      res.status,
      json.errors || [],
      json.messages || []
    );
  }

  return json.result;
}

/**
 * @param {{ hostname: string, sslMethod?: 'http' | 'txt' }} opts
 */
async function createCustomHostname({ hostname, sslMethod = 'http' }) {
  const zoneId = getZoneId();
  return cfRequest('POST', `/zones/${zoneId}/custom_hostnames`, {
    hostname: hostname.toLowerCase().trim(),
    ssl: {
      method: sslMethod,
      type: 'dv'
    }
  });
}

async function getCustomHostname(hostnameId) {
  const zoneId = getZoneId();
  return cfRequest('GET', `/zones/${zoneId}/custom_hostnames/${hostnameId}`);
}

/**
 * Lista custom hostnames; opcionalmente filtra por hostname exato.
 * @param {{ hostname?: string, page?: number }} opts
 */
async function listCustomHostnames({ hostname, page = 1 } = {}) {
  const zoneId = getZoneId();
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', '50');
  if (hostname) {
    params.set('hostname', hostname.toLowerCase().trim());
  }
  const path = `/zones/${zoneId}/custom_hostnames?${params.toString()}`;
  const authHeaders = getAuthHeaders();
  const url = `${CF_API}${path}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders
  });
  const json = await res.json().catch(() => ({}));
  if (!json.success) {
    throw new CloudflareApiError(
      res.status,
      json.errors || [],
      json.messages || []
    );
  }
  return {
    hostnames: json.result || [],
    result_info: json.result_info || {}
  };
}

/**
 * Reinicia DCV alterando método SSL (ex.: http → txt).
 * @param {string} hostnameId
 * @param {{ method: 'http' | 'txt' }} opts
 */
async function patchCustomHostnameSsl(hostnameId, { method }) {
  const zoneId = getZoneId();
  return cfRequest('PATCH', `/zones/${zoneId}/custom_hostnames/${hostnameId}`, {
    ssl: {
      method,
      type: 'dv'
    }
  });
}

async function deleteCustomHostname(hostnameId) {
  const zoneId = getZoneId();
  return cfRequest('DELETE', `/zones/${zoneId}/custom_hostnames/${hostnameId}`);
}

/**
 * Extrai campos persistíveis a partir do objeto `result` da API.
 */
function mapCustomHostnameResult(result) {
  if (!result) return null;
  const ssl = result.ssl || {};
  return {
    cloudflare_hostname_id: result.id,
    hostname: (result.hostname || '').toLowerCase().trim(),
    status: result.status || 'pending',
    ssl_status: ssl.status || 'pending_validation',
    ssl_method: ssl.method || 'http',
    ownership_verification: result.ownership_verification || ssl.ownership_verification || null,
    validation_records: ssl.validation_records || null,
    verification_errors: ssl.validation_errors || result.verification_errors || null
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  createCustomHostname,
  getCustomHostname,
  listCustomHostnames,
  patchCustomHostnameSsl,
  deleteCustomHostname,
  mapCustomHostnameResult,
  sleep,
  CloudflareApiError,
  CloudflareConfigError
};
