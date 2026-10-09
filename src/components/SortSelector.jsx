import { SORT_OPTIONS } from '../services/gameApi';

const SortSelector = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label htmlFor="sort-select" style={{ fontSize: '0.825rem', color: 'var(--text)', fontWeight: '600' }}>
        Sort:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          color: 'var(--text-h)',
          borderRadius: '8px',
          padding: '8px 12px',
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
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortSelector;