import { useId, useState } from 'react';
import { THEMES } from '../themes.js';

const ThemeSelector = ({ theme, onThemeChange, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const activeTheme = THEMES.find((option) => option.id === theme) || THEMES[0];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={compact ? `Appearance: ${activeTheme.name}` : undefined}
        aria-expanded={isOpen}
        aria-controls={panelId}
        title={compact ? `Appearance: ${activeTheme.name}` : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: compact ? 'center' : 'flex-start',
          gap: '10px',
          width: compact ? '40px' : '100%',
          minHeight: '42px',
          margin: compact ? '0 auto' : 0,
          padding: compact ? '0' : '8px 10px',
          border: '1px solid var(--border)',
          borderRadius: '9px',
          backgroundColor: isOpen ? 'var(--panel-hover)' : 'transparent',
          color: 'var(--text)',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background-color 0.2s ease, border-color 0.2s ease'
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.borderColor = 'var(--border-focus)';
          event.currentTarget.style.backgroundColor = 'var(--panel-hover)';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.borderColor = 'var(--border)';
          event.currentTarget.style.backgroundColor = isOpen ? 'var(--panel-hover)' : 'transparent';
        }}
      >
        <svg
          aria-hidden="true"
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 1.25-3.1 1.8 1.8 0 0 1 1.25-3.1H17a4 4 0 0 0 4-4c0-4.3-4-7.8-9-7.8Z" />
          <path d="M7.5 10h.01M10 6.8h.01M15 7.3h.01M17.2 10.5h.01" />
        </svg>
        {!compact && (
          <span style={{ display: 'flex', flex: 1, minWidth: 0, flexDirection: 'column', gap: '1px' }}>
            <span style={{ color: 'var(--text-h)', fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.25 }}>
              Appearance
            </span>
            <span style={{ color: 'var(--text)', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeTheme.name}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="group"
          aria-label="Choose a color theme"
          style={{
            position: 'absolute',
            left: compact ? 'calc(100% + 10px)' : 0,
            bottom: compact ? 0 : 'calc(100% + 8px)',
            width: compact ? '236px' : '100%',
            minWidth: compact ? '236px' : undefined,
            padding: '12px',
            border: '1px solid var(--border-focus)',
            borderRadius: '12px',
            backgroundColor: 'var(--panel-bg)',
            boxShadow: 'var(--shadow), var(--glow)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ padding: '2px 2px 5px' }}>
            <div style={{ color: 'var(--text-h)', fontSize: '0.84rem', fontWeight: 700 }}>
              Color theme
            </div>
            <div style={{ color: 'var(--text)', fontSize: '0.72rem', marginTop: '2px' }}>
              Changes apply across SavePoint
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
            gap: '6px'
          }}>
            {THEMES.map((option) => {
              const selected = option.id === activeTheme.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onThemeChange(option.id);
                    setIsOpen(false);
                  }}
                  aria-pressed={selected}
                  title={option.description}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: 0,
                    minHeight: '36px',
                    padding: '7px 8px',
                    border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    backgroundColor: selected ? 'var(--accent-bg)' : 'var(--bg)',
                    color: selected ? 'var(--text-h)' : 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.76rem',
                    fontWeight: selected ? 700 : 500
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: '13px',
                      height: '13px',
                      flexShrink: 0,
                      borderRadius: '50%',
                      backgroundColor: option.swatch,
                      border: '2px solid var(--panel-bg)',
                      outline: `1px solid ${option.swatch}`
                    }}
                  />
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {option.name}
                  </span>
                  {selected && (
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="var(--accent-hover)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="m4 10 4 4 8-8" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
