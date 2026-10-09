const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'rating', label: 'Personal rating' },
  { value: 'playtime', label: 'Most playtime' }
];

const CollectionToolbar = ({
  searchTerm,
  onSearchTermChange,
  sortBy,
  onSortByChange,
  resultCount,
  totalCount,
  itemLabel = 'games'
}) => {
  const hasSearch = searchTerm.trim().length > 0;

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
        {hasSearch
          ? `Showing ${resultCount} of ${totalCount} ${itemLabel}`
          : `${totalCount} ${itemLabel} saved`}
      </div>
    </div>
  );
};

export default CollectionToolbar;
