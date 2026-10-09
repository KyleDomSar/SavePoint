import { useState, useRef, useEffect } from 'react';
import { DiscoverIcon, CloseIcon } from './Icons';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

const SearchBar = ({ value, onChange, placeholder = 'Search for games...' }) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef(null);
  const lastEmittedRef = useRef(value);

  // Sync external changes using an effect
  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      setLocalValue(value);
      lastEmittedRef.current = value;
    }
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const nextVal = e.target.value;
    setLocalValue(nextVal);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const trimmed = nextVal.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      if (lastEmittedRef.current !== '') {
        lastEmittedRef.current = '';
        onChange('');
      }
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (lastEmittedRef.current !== trimmed) {
        lastEmittedRef.current = trimmed;
        onChange(trimmed);
      }
    }, DEBOUNCE_MS);
  };

  const handleClear = () => {
    setLocalValue('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (lastEmittedRef.current !== '') {
      lastEmittedRef.current = '';
      onChange('');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center'
      }}>
        <DiscoverIcon className="w-5 h-5" />
      </div>
      <input
        type="text"
        role="searchbox"
        aria-label="Search games"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        style={{
          width: '100%',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px 40px 12px 42px',
          color: 'var(--text-h)',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-border)';
          e.currentTarget.style.boxShadow = 'var(--glow)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {localValue && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-h)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;