const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'rating', label: 'Personal rating' },
  { value: 'playtime', label: 'Most playtime' }
];

const CollectionToolbar = ({
  allGames = [],
  searchTerm,
  platformFilter = '',
  onPlatformFilterChange,
  genreFilter = '',
  onGenreFilterChange,
  onClearFilters,
  onSearchTermChange,
  sortBy,
  onSortByChange,
  resultCount,
  totalCount,
  itemLabel = 'games'
}) => {
  const hasSearch = searchTerm.trim().length > 0;
  const hasFilters = hasSearch || Boolean(platformFilter || genreFilter);
  const getPlatformName = (game) => {
    const platform = game?.platform;
    if (Array.isArray(platform)) {
      return platform.map((item) => typeof item === 'string' ? item : item?.name || '').filter(Boolean).join(', ');
    }
    if (typeof platform === 'string') return platform.trim();
    return typeof platform?.name === 'string' ? platform.name.trim() : '';
  };
  const getGenreNames = (game) => {
    if (!Array.isArray(game?.genres)) return [];
    return game.genres
      .map((genre) => typeof genre === 'string' ? genre : genre?.name || '')
      .filter(Boolean);
  };
  const platforms = [...new Set(allGames.map(getPlatformName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const genres = [...new Set(allGames.flatMap(getGenreNames))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '14px',
      backgroundColor: 'var(--panel-bg)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      width: '100%'
    }}>
      <div style={{ flex: '1 1 240px', minWidth: 0, position: 'relative' }}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text)',
            pointerEvents: 'none'
          }}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Search by title, platform, or genre..."
          aria-label="Search your collection"
          style={{
            width: '100%',
            minWidth: 0,
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
            borderRadius: '8px',
            padding: '10px 12px 10px 38px',
            fontSize: '0.875rem',
            outline: 'none'
          }}
          onFocus={(event) => { event.currentTarget.style.borderColor = 'var(--accent-border)'; }}
          onBlur={(event) => { event.currentTarget.style.borderColor = 'var(--border)'; }}
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0
      }}>
        {platforms.length > 1 && (
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', minWidth: 0, maxWidth: '170px' }}>
            <select
              value={platformFilter}
              onChange={(event) => onPlatformFilterChange?.(event.target.value)}
              aria-label="Filter by platform"
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                width: '100%',
                minWidth: 0,
                maxWidth: '170px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
                borderRadius: '8px',
                padding: '10px 30px 10px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="">All platforms</option>
              {platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
            </select>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ position: 'absolute', right: '9px', color: 'var(--text)', pointerEvents: 'none' }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        )}
        {genres.length > 1 && (
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', minWidth: 0, maxWidth: '170px' }}>
            <select
              value={genreFilter}
              onChange={(event) => onGenreFilterChange?.(event.target.value)}
              aria-label="Filter by genre"
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                width: '100%',
                minWidth: 0,
                maxWidth: '170px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
                borderRadius: '8px',
                padding: '10px 30px 10px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="">All genres</option>
              {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
            </select>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ position: 'absolute', right: '9px', color: 'var(--text)', pointerEvents: 'none' }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        )}
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              borderRadius: '8px',
              padding: '9px 10px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <label htmlFor="collection-sort" style={{
          color: 'var(--text)',
          fontSize: '0.8rem',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}>
          Sort
        </label>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <select
            id="collection-sort"
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value)}
            aria-label="Sort collection"
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-h)',
              borderRadius: '8px',
              padding: '10px 32px 10px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              maxWidth: '180px'
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '10px',
              color: 'var(--text)',
              pointerEvents: 'none'
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <div style={{
        width: '100%',
        color: 'var(--text)',
        fontSize: '0.775rem',
        lineHeight: 1.4
      }} aria-live="polite">
        {hasFilters
          ? `Showing ${resultCount} of ${totalCount} ${itemLabel}`
          : `${totalCount} ${itemLabel} saved`}
      </div>
    </div>
  );
};

export default CollectionToolbar;
