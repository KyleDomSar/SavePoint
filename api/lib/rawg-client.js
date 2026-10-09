/* global process */
// Shared RAWG upstream client for Vercel serverless functions.
// This module never runs in the browser. It handles authentication,
// parameter validation, and safe error translation.

const RAWG_BASE = 'https://api.rawg.io';

// Maximum page size supported by the RAWG API.
const MAX_PAGE_SIZE = 40;
const MIN_PAGE_SIZE = 1;
const DEFAULT_PAGE_SIZE = 20;

// Whitelist of ordering values accepted by the RAWG /api/games endpoint.
const ALLOWED_ORDERING = new Set([
  '',
  '-metacritic',
  'metacritic',
  '-released',
  'released',
  '-name',
  'name',
  '-rating',
  'rating',
  '-added',
  'added',
  '-created',
  'created',
  '-updated',
  'updated'
]);

export function getApiKey() {
  const key = process.env.RAWG_API_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return null;
  }
  return key.trim();
}

export function clampPage(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

export function clampPageSize(value, fallback = DEFAULT_PAGE_SIZE) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.floor(n)));
}

// Build a fully-qualified RAWG URL from a path and a params object.
// Undefined/null/empty values are dropped. Pagination is bounded.
export function buildRawgUrl(path, params = {}) {
  const url = new URL(`${RAWG_BASE}${path}`);

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (k === 'page') {
      url.searchParams.set(k, String(clampPage(v)));
    } else if (k === 'page_size') {
      url.searchParams.set(k, String(clampPageSize(v)));
    } else {
      url.searchParams.set(k, String(v));
    }
  }

  return url;
}

// Translate upstream errors into safe, client-friendly shapes.
// We never forward RAWG's raw error body to the browser.
export function classifyUpstreamError(status) {
  if (status === 429) {
    return {
      status: 429,
      code: 'RATE_LIMITED',
      message: 'The game catalog is rate limited right now. Please wait a moment and try again.'
    };
  }
  if (status === 401 || status === 403) {
    return {
      status: 502,
      code: 'UNAUTHORIZED',
      message: 'The configured RAWG API key is missing or invalid.'
    };
  }
  if (status >= 500) {
    return {
      status: 502,
      code: 'UPSTREAM_ERROR',
      message: 'The game catalog is temporarily unavailable. Please try again later.'
    };
  }
  return {
    status: 502,
    code: 'UPSTREAM_ERROR',
    message: 'The game catalog returned an unexpected response.'
  };
}

export async function fetchRawg(path, params = {}) {
  const key = getApiKey();
  if (!key) {
    const err = new Error('RAWG_API_KEY is not configured on the server.');
    err.code = 'CONFIG_ERROR';
    err.status = 503;
    throw err;
  }

  const url = buildRawgUrl(path, { ...params, key });

  let resp;
  try {
    resp = await fetch(url.toString(), {
      headers: { Accept: 'application/json' }
    });
  } catch (networkErr) {
    const err = new Error('Unable to reach the RAWG API.');
    err.code = 'UPSTREAM_UNAVAILABLE';
    err.status = 502;
    err.cause = networkErr?.message;
    throw err;
  }

  if (resp.status === 429 || resp.status >= 500 || resp.status === 401 || resp.status === 403) {
    const classified = classifyUpstreamError(resp.status);
    const err = new Error(classified.message);
    err.code = classified.code;
    err.status = classified.status;
    throw err;
  }

  if (resp.status < 200 || resp.status >= 300) {
    const classified = classifyUpstreamError(resp.status);
    const err = new Error(classified.message);
    err.code = classified.code;
    err.status = classified.status;
    throw err;
  }

  let data;
  try {
    data = await resp.json();
  } catch {
    const err = new Error('The game catalog returned an invalid response.');
    err.code = 'INVALID_RESPONSE';
    err.status = 502;
    throw err;
  }

  return data;
}

// Validate and normalize an ordering parameter against the whitelist.
export function sanitizeOrdering(value) {
  if (value === undefined || value === null || value === '') return '';
  const s = String(value).trim();
  return ALLOWED_ORDERING.has(s) ? s : '';
}

// Validate a comma-separated ID list of genres/platforms.
// RAWG accepts numeric IDs; we keep only digits and commas.
export function sanitizeIdList(value) {
  if (value === undefined || value === null || value === '') return '';
  const s = String(value).trim();
  if (!/^\d+(,\d+)*$/.test(s)) return '';
  return s;
}