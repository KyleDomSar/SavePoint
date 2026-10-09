// Vercel serverless function: GET /api/genres
// Proxies validated requests to the official RAWG /api/genres endpoint.

import { fetchRawg } from './lib/rawg-client.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  try {
    const data = await fetchRawg('/api/genres');
    const results = (Array.isArray(data.results) ? data.results : []).map(genre => ({
      id: genre.id,
      name: genre.name
    }));

    res.status(200).json({
      count: data.count ?? null,
      results
    });
  } catch (err) {
    const status = err.status || 502;
    res.status(status).json({
      error: err.message || 'Failed to fetch genres from the catalog.',
      code: err.code || 'UPSTREAM_ERROR'
    });
  }
}