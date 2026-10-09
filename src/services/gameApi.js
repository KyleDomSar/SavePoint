// SavePoint game catalog service layer.
//
// This module is the ONLY place in the UI that talks to the catalog backend.
// It calls the application's own relative /api/... endpoints (served by the
// Vercel serverless proxy) and never constructs RAWG URLs or handles API
// authentication directly. The API key stays on the server.

const API_BASE = '/api';

// Default page size used by the catalog listing.
const DEFAULT_PAGE_SIZE = 20;

// Supported sort options for the Discover view.
// `ordering` values map to the RAWG /api/games `ordering` parameter.
export const SORT_OPTIONS = [
  { label: 'Relevance', value: '' },
  { label: 'Rating: High → Low', value: '-rating' },
  { label: 'Rating: Low → High', value: 'rating' },
  { label: 'Newest First', value: '-released' },
  { label: 'Oldest First', value: 'released' },
  { label: 'Name: A → Z', value: 'name' },
  { label: 'Name: Z → A', value: '-name' }
];

// Normalize a RAWG game record into the shape used by GameCard.
// We never invent metadata: missing fields are left undefined/empty.
export function normalizeGame(raw = {}) {
  if (!raw || typeof raw !== 'object') return null;

  // Platforms: RAWG returns an array of { platform: { name } }.
  let platform = undefined;
  if (Array.isArray(raw.platforms) && raw.platforms.length > 0) {
    const names = raw.platforms
      .map((p) => p?.platform?.name)
      .filter(Boolean);
    if (names.length > 0) {
      platform = names.join(', ');
    }
  } else if (raw.platform && typeof raw.platform === 'string') {
    platform = raw.platform;
  }

  // Rating: RAWG returns a number or null. Round to a whole number.
  let rating = 0;
  if (typeof raw.rating === 'number' && Number.isFinite(raw.rating)) {
    rating = Math.max(0, Math.min(5, Math.round(raw.rating)));
  }

  // Release date: RAWG returns a string like "2023-05-19" or "2023".
  let releaseDate = undefined;
  if (typeof raw.released === 'string' && raw.released.trim() !== '') {
    releaseDate = raw.released.slice(0, 4);
  } else if (typeof raw.first_release_date === 'string' && raw.first_release_date.trim() !== '') {
    releaseDate = raw.first_release_date.slice(0, 4);
  }

  return {
    id: raw.id,
    name: raw.name,
    title: raw.name,
    coverUrl: raw.background_image || raw.background_image_original || undefined,
    platform,
    rating,
    releaseDate,
    metacritic: raw.metacritic,
    genres: Array.isArray(raw.genres) ? raw.genres : undefined,
    platforms: raw.platforms
  };
}

async function requestJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    const body = await safeJson(response);
    const err = new Error(body?.error || `Request failed with status ${response.status}`);
    err.code = body?.code || 'REQUEST_FAILED';
    err.status = response.status;
    throw err;
  }
  return response.json();
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch a paginated list of games. Supports search, genre/platform filters,
// ordering, and pagination. `signal` may be used to cancel in-flight requests.
export async function fetchGames({
  search = '',
  genres = '',
  platforms = '',
  ordering = '',
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  signal
} = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  if (search && search.trim().length >= 2) {
    params.set('search', search.trim());
  }
  if (genres) params.set('genres', String(genres));
  if (platforms) params.set('platforms', String(platforms));
  if (ordering) params.set('ordering', String(ordering));

  const url = `${API_BASE}/games?${params.toString()}`;
  const data = await requestJson(url, signal);

  const results = Array.isArray(data.results) ? data.results.map(normalizeGame).filter(Boolean) : [];
  return {
    results,
    count: typeof data.count === 'number' ? data.count : results.length
  };
}

// Fetch the available genre list from the catalog.
export async function fetchGenres(signal) {
  const data = await requestJson(`${API_BASE}/genres`, signal);
  return Array.isArray(data.results) ? data.results : [];
}

// Fetch the available platform list from the catalog.
export async function fetchPlatforms(signal) {
  const data = await requestJson(`${API_BASE}/platforms`, signal);
  return Array.isArray(data.results) ? data.results : [];
}

// Fetch a single game by ID.
export async function fetchGame(id, signal) {
  const url = `${API_BASE}/games/${encodeURIComponent(id)}`;
  const data = await requestJson(url, signal);
  return normalizeGame(data);
}