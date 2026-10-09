import { useEffect, useState } from 'react';
import { StarIcon } from './Icons';

const panelStyle = {
  width: 'min(520px, 100%)',
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: 'var(--panel-bg)',
  border: '1px solid var(--border-focus)',
  borderRadius: '14px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.65)',
  color: 'var(--text)',
  padding: '22px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '7px',
  color: 'var(--text-h)',
  fontSize: '0.85rem',
  fontWeight: '650'
};

const fieldStyle = {
  width: '100%',
  backgroundColor: 'var(--bg)',
  color: 'var(--text-h)',
  border: '1px solid var(--border-focus)',
  borderRadius: '8px',
  padding: '10px 12px',
  font: 'inherit',
  fontSize: '0.9rem'
};

const GameProgressModal = ({ game, onClose, onSave }) => {
  const [playtimePlayed, setPlaytimePlayed] = useState(
    game.playtimePlayed === null || game.playtimePlayed === undefined ? '' : String(game.playtimePlayed)
  );
  const [personalRating, setPersonalRating] = useState(
    game.personalRating === null || game.personalRating === undefined ? '' : String(game.personalRating)
  );
  const [personalNotes, setPersonalNotes] = useState(game.personalNotes || '');
  const [error, setError] = useState('');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const hours = playtimePlayed.trim() === '' ? null : Number(playtimePlayed);
    if (hours !== null && (!Number.isFinite(hours) || hours < 0 || hours > 100000)) {
      setError('Enter a valid number of hours between 0 and 100,000.');
      return;
    }

    const rating = personalRating === '' ? null : Number(personalRating);
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      setError('Choose a personal rating from 1 to 5 stars, or clear it.');
      return;
    }

    onSave({
      playtimePlayed: hours,
      personalRating: rating,
      personalNotes: personalNotes.slice(0, 2000)
    });
    onClose();
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(3, 4, 8, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`progress-title-${game.id}`}
        onClick={(event) => event.stopPropagation()}
        style={panelStyle}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 5px', color: 'var(--accent)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
              Personal game progress
            </p>
            <h2 id={`progress-title-${game.id}`} style={{ color: 'var(--text-h)', fontSize: '1.25rem', lineHeight: 1.3, overflowWrap: 'anywhere' }}>
              {game.title}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close progress editor" style={{
            flexShrink: 0,
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            color: 'var(--text-h)',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor={`playtime-${game.id}`} style={labelStyle}>Your playtime (hours)</label>
            <input
              id={`playtime-${game.id}`}
              type="number"
              min="0"
              max="100000"
              step="0.5"
              inputMode="decimal"
              placeholder="e.g. 12.5"
              value={playtimePlayed}
              onChange={(event) => setPlaytimePlayed(event.target.value)}
              style={fieldStyle}
            />
            <p style={{ margin: '6px 0 0', color: 'var(--text)', fontSize: '0.75rem' }}>
              Enter your own hours played. This is separate from RAWG's average playtime.
            </p>
          </div>

          <div>
            <span style={labelStyle}>Your rating</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPersonalRating(String(star))}
                  aria-label={`Rate ${star} out of 5 stars`}
                  aria-pressed={Number(personalRating) === star}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    padding: 0,
                    borderRadius: '8px',
                    border: `1px solid ${Number(personalRating) === star ? 'var(--accent)' : 'var(--border)'}`,
                    backgroundColor: Number(personalRating) === star ? 'var(--accent-bg)' : 'var(--bg)',
                    color: star <= Number(personalRating) ? 'var(--accent)' : 'var(--border-focus)',
                    cursor: 'pointer'
                  }}
                >
                  <StarIcon className="w-5 h-5" filled={star <= Number(personalRating)} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPersonalRating('')}
                disabled={personalRating === ''}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  color: personalRating === '' ? 'var(--text)' : 'var(--text-h)',
                  borderRadius: '7px',
                  padding: '7px 10px',
                  cursor: personalRating === '' ? 'default' : 'pointer',
                  opacity: personalRating === '' ? 0.55 : 1
                }}
              >
                Clear
              </button>
            </div>
            <p style={{ margin: '6px 0 0', color: 'var(--text)', fontSize: '0.75rem' }}>
              {personalRating === '' ? 'Not rated yet' : `${personalRating} out of 5 stars`}
            </p>
          </div>

          <div>
            <label htmlFor={`notes-${game.id}`} style={labelStyle}>Personal notes</label>
            <textarea
              id={`notes-${game.id}`}
              rows={4}
              maxLength={2000}
              placeholder="Your thoughts, goals, build ideas, or reminders…"
              value={personalNotes}
              onChange={(event) => setPersonalNotes(event.target.value)}
              style={{ ...fieldStyle, resize: 'vertical', minHeight: '105px' }}
            />
            <p style={{ margin: '5px 0 0', textAlign: 'right', color: 'var(--text)', fontSize: '0.72rem' }}>
              {personalNotes.length}/2000
            </p>
          </div>

          {error && <p role="alert" style={{ margin: 0, color: '#fbbf24', fontSize: '0.82rem' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} style={{
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-h)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" style={{
              border: '1px solid var(--accent)',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'var(--glow)'
            }}>
              Save Progress
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default GameProgressModal;
