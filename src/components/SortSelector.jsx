import { SORT_OPTIONS } from '../services/gameApi';

const COMPACT_SORT_LABELS = {
  '': 'Relevance',
  '-rating': 'Rating ↓',
  rating: 'Rating ↑',
  '-released': 'Newest',
  released: 'Oldest',
  name: 'Name A–Z',
  '-name': 'Name Z–A'
};

const SortSelector = ({ value, onChange }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      justifySelf: 'start',
      width: 'fit-content',
      maxWidth: '100%'
    }}>
      <label
        htmlFor="sort-select"
        style={{
          fontSize: '0.825rem',
          color: 'var(--text)',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}
      >
        Sort:
      </label>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
        <select
          id="sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            width: 'max-content',
            maxWidth: '100%',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
            borderRadius: '8px',
            padding: '8px 28px 8px 10px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {COMPACT_SORT_LABELS[opt.value] || opt.label}
            </option>
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
            right: '9px',
            pointerEvents: 'none',
            color: 'var(--text)',
            flexShrink: 0
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
};

export default SortSelector;
