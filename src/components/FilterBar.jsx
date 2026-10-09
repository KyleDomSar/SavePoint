import { useState, useEffect } from 'react';
import { fetchGenres, fetchPlatforms } from '../services/gameApi';

// Genre and platform filter pills backed by RAWG genre/platform IDs.
// The pill list is fetched once on mount from the catalog service.

const FilterBar = ({ activeFilters, onFiltersChange }) => {
  const [genreList, setGenreList] = useState([]);
  const [platformList, setPlatformList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      try {
        const [genresData, platformsData] = await Promise.all([
          fetchGenres(),
          fetchPlatforms()
        ]);
        if (!cancelled) {
          setGenreList(genresData);
          setPlatformList(platformsData);
        }
      } catch {
        // If filter metadata fails to load, the pills simply won't render.
        // The catalog listing itself is unaffected.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFilters();
    return () => { cancelled = true; };
  }, []);

  const parseSelectedIds = (value) =>
    (typeof value === 'string' ? value.split(',').filter(Boolean) : []).map(Number);

  const toggleGenre = (id) => {
    const next = new Set(parseSelectedIds(activeFilters.genres));
    if (next.has(Number(id))) next.delete(Number(id));
    else next.add(Number(id));
    onFiltersChange({
      ...activeFilters,
      genres: Array.from(next).join(',')
    });
  };

  const togglePlatform = (id) => {
    const next = new Set(parseSelectedIds(activeFilters.platforms));
    if (next.has(Number(id))) next.delete(Number(id));
    else next.add(Number(id));
    onFiltersChange({
      ...activeFilters,
      platforms: Array.from(next).join(',')
    });
  };

  const clearFilters = () => {
    onFiltersChange({ genres: '', platforms: '' });
  };

  const hasFilters = (activeFilters.genres || activeFilters.platforms);

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.825rem', color: 'var(--text)' }}>Loading filters...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Genre filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.825rem', color: 'var(--text)', fontWeight: '600', marginRight: '4px' }}>Genres:</span>
        {genreList.map((genre) => {
          const isActive = parseSelectedIds(activeFilters.genres).includes(Number(genre.id));
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              style={{
                backgroundColor: isActive ? 'var(--accent-bg)' : 'var(--bg)',
                border: isActive ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--text)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      {/* Platform filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.825rem', color: 'var(--text)', fontWeight: '600', marginRight: '4px' }}>Platforms:</span>
        {platformList.map((platform) => {
          const isActive = parseSelectedIds(activeFilters.platforms).includes(Number(platform.id));
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              style={{
                backgroundColor: isActive ? 'var(--accent-bg)' : 'var(--bg)',
                border: isActive ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--text)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {platform.name}
            </button>
          );
        })}
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              backgroundColor: 'transparent',
              border: '1px dashed var(--border)',
              color: 'var(--text)',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;