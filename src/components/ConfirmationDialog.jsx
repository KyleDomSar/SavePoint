import { useEffect, useRef } from 'react';

const ConfirmationDialog = ({
  game,
  collectionName = 'collection',
  onCancel,
  onConfirm
}) => {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!game) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [game, onCancel]);

  if (!game) return null;

  return (
    <div
      className="confirmation-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(5px)'
      }}
    >
      <section
        className="confirmation-dialog-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="remove-game-title"
        aria-describedby="remove-game-description"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          color: '#fbbf24'
        }}>
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="m8 6 1 14h6l1-14" />
            <path d="M10 6V4h4v2" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 id="remove-game-title" style={{
            color: 'var(--text-h)',
            fontSize: '1.2rem',
            lineHeight: 1.3,
            margin: 0
          }}>
            Remove this game?
          </h2>
          <p id="remove-game-description" style={{
            margin: 0,
            color: 'var(--text)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            overflowWrap: 'anywhere'
          }}>
            Remove <strong style={{ color: 'var(--text-h)' }}>{game.title}</strong> from your {collectionName}? This also removes its saved personal progress and notes from this browser.
          </p>
        </div>

        <div className="confirmation-dialog-actions" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: '10px',
          marginTop: '4px'
        }}>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: 'var(--bg)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              backgroundColor: '#b91c1c',
              color: '#fff',
              border: '1px solid #dc2626',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Remove game
          </button>
        </div>
      </section>
    </div>
  );
};

export default ConfirmationDialog;
