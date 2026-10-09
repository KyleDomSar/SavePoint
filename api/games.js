// Vercel serverless function: GET /api/games
// Proxies validated requests to the official RAWG /api/games endpoint.
// The API key is read from the server-side RAWG_API_KEY environment variable
// and never reaches the browser.

import { fetchRawg, sanitizeOrdering, sanitizeIdList, clampPage, clampPageSize } from './lib/rawg-client.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const { search, page, page_size, genres, platforms, ordering, dates } = req.query;

  const params = {
    page: clampPage(page),
    page_size: clampPageSize(page_size)
  };

  if (search && String(search).trim().length >= 2) {
    params.search = String(search).trim();
  }

  const genreList = sanitizeIdList(genres);
  if (genreList) params.genres = genreList;

  const platformList = sanitizeIdList(platforms);
  if (platformList) params.platforms = platformList;

  const orderingValue = sanitizeOrdering(ordering);
  if (orderingValue) params.ordering = orderingValue;

  if (dates && String(dates).trim()) {
    params.dates = String(dates).trim();
  }

  try {
    const data = await fetchRawg('/api/games', params);

    // Explicitly allowlist only the fields needed by the frontend to prevent leakage.
    // Pagination URLs from RAWG include the API key, so we must not pass them back.
    const results = (Array.isArray(data.results) ? data.results : []).map(game => ({
      id: game.id,
      name: game.name,
      background_image: game.background_image || game.background_image_original,
      platforms: game.platforms,
      rating: game.rating,
      released: game.released,
      metacritic: game.metacritic,
      genres: game.genres
    }));

    res.status(200).json({
      count: data.count ?? null,
      results
    });
  } catch (err) {
    const status = err.status || 502;
    res.status(status).json({
      error: err.message || 'Failed to fetch games from the catalog.',
      code: err.code || 'UPSTREAM_ERROR'
    });
  }
}