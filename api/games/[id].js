// Vercel serverless function: GET /api/games/:id
// Returns a safe, allowlisted subset of one game's details from RAWG.

import { fetchRawg } from '../lib/rawg-client.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const rawId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
  const id = String(rawId ?? '');

  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
    res.status(400).json({ error: 'A valid numeric game ID is required.', code: 'INVALID_GAME_ID' });
    return;
  }

  try {
    const game = await fetchRawg(`/api/games/${id}`);

    res.status(200).json({
      id: game.id,
      name: game.name,
      description_raw: typeof game.description_raw === 'string' ? game.description_raw : '',
      description: typeof game.description === 'string' ? game.description : '',
      background_image: game.background_image || game.background_image_additional || null,
      released: typeof game.released === 'string' ? game.released : null,
      rating: typeof game.rating === 'number' ? game.rating : null,
      ratings_count: typeof game.ratings_count === 'number' ? game.ratings_count : null,
      metacritic: typeof game.metacritic === 'number' ? game.metacritic : null,
      genres: Array.isArray(game.genres) ? game.genres.map((item) => ({ id: item.id, name: item.name })) : [],
      platforms: Array.isArray(game.platforms) ? game.platforms.map((item) => ({
        platform: {
          id: item?.platform?.id,
          name: item?.platform?.name
        }
      })) : [],
      developers: Array.isArray(game.developers) ? game.developers.map((item) => ({ id: item.id, name: item.name })) : [],
      publishers: Array.isArray(game.publishers) ? game.publishers.map((item) => ({ id: item.id, name: item.name })) : [],
      esrb_rating: game.esrb_rating ? { id: game.esrb_rating.id, name: game.esrb_rating.name } : null,
      website: typeof game.website === 'string' ? game.website : '',
      playtime: typeof game.playtime === 'number' ? game.playtime : null
    });
  } catch (err) {
    res.status(err.status || 502).json({
      error: err.message || 'Failed to fetch game details from the catalog.',
      code: err.code || 'UPSTREAM_ERROR'
    });
  }
}
