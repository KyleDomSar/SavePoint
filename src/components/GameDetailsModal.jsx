import { useEffect, useState } from 'react';
import { fetchGame } from '../services/gameApi';

const panelStyle = {
  width: 'min(760px, 100%)',
  maxHeight: 'min(90vh, 900px)',
  overflowY: 'auto',
  backgroundColor: 'var(--panel-bg)',
  border: '1px solid var(--border-focus)',
  borderRadius: '16px',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.65)',
  color: 'var(--text)',
  position: 'relative'
};

const labelStyle = {
  color: 'var(--text)',
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: '700',
  marginBottom: '4px'
};

const valueStyle = {
  color: 'var(--text-h)',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  overflowWrap: 'anywhere'
};

function formatDate(value) {
  if (!value) return 'Not listed';
  if (value.length === 4) return value;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getSafeWebsite(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function DetailPills({ title, values }) {
  const uniqueValues = [...new Set((values || []).filter(Boolean))];
  if (!uniqueValues.length) return null;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h3 style={labelStyle}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {uniqueValues.map((value) => (
          <span
            key={value}
            style={{
              border: '1px solid var(--border-focus)',
              borderRadius: '999px',
              padding: '5px 10px',
              color: 'var(--text-h)',
              backgroundColor: 'rgba(255,255,255,0.035)',
              fontSize: '0.78rem',
              maxWidth: '100%',
              overflowWrap: 'anywhere'
            }}
          >
            {value}
          </span>
        ))}
      </div>
    </section>
  );
}

const GameDetailsModal = ({ game, onClose }) => {
  const [details, setDetails] = useState(game);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchGame(game.id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && data) {
          setDetails((previous) => ({ ...previous, ...data }));
          setError('');
        }
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError' && !controller.signal.aborted) {
          setError(requestError.message || 'Could not load the full game details.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [game.id, retryCount]);

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

  const genres = Array.isArray(details.genres)
    ? details.genres.map((item) => typeof item === 'string' ? item : item?.name).filter(Boolean)
    : [];
  const platforms = Array.isArray(details.platforms)
    ? details.platforms.map((item) => item?.platform?.name || item?.name).filter(Boolean)
    : [];
  const officialWebsite = getSafeWebsite(details.website);
  const numericRating = typeof details.rawgRating === 'number'
    ? details.rawgRating
    : typeof details.rating === 'number'
      ? details.rating
      : null;
  const metacritic = Number.isFinite(details.metacritic) ? details.metacritic : null;
  const releaseDate = formatDate(details.released || details.releaseDate);

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(3, 4, 8, 0.82)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`game-details-title-${game.id}`}
        onClick={(event) => event.stopPropagation()}
        style={panelStyle}
      >
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px 22px',
          backgroundColor: 'var(--panel-bg)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ ...labelStyle, color: 'var(--accent)', marginTop: 0 }}>Game details</p>
            <h2
              id={`game-details-title-${game.id}`}
              style={{ color: 'var(--text-h)', fontSize: '1.35rem', lineHeight: 1.25, overflowWrap: 'anywhere' }}
            >
              {details.title || details.name || game.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close game details"
            autoFocus
            style={{
              flexShrink: 0,
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text-h)',
              fontSize: '1.25rem',
              lineHeight: 1,
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </header>

        {details.coverUrl ? (
          <div style={{ height: '210px', backgroundColor: 'var(--bg)', overflow: 'hidden' }}>
            <img
              src={details.coverUrl}
              alt={`${details.title || game.title} artwork`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 28%' }}
            />
          </div>
        ) : (
          <div style={{
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, var(--accent-bg), var(--bg))',
            color: 'var(--text-h)',
            fontSize: '1.25rem',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            {details.title || game.title}
          </div>
        )}

        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {isLoading && (
            <p role="status" style={{ margin: 0, color: 'var(--text)', fontSize: '0.85rem' }}>
              Loading additional details…
            </p>
          )}

          {error && (
            <div role="alert" style={{
              padding: '12px 14px',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ flex: '1 1 220px', fontSize: '0.83rem', lineHeight: 1.5 }}>{error}</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsLoading(true);
                  setRetryCount((count) => count + 1);
                }}
                style={{
                  border: '1px solid var(--border-focus)',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: 'var(--text-h)',
                  backgroundColor: 'var(--bg)',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))',
            gap: '10px'
          }}>
            <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
              <div style={labelStyle}>RAWG Rating</div>
              <div style={{ ...valueStyle, fontSize: '1.05rem', fontWeight: '700' }}>
                {numericRating === null ? 'Not rated' : `${numericRating.toFixed(2)} / 5`}
              </div>
              {typeof details.ratingsCount === 'number' && (
                <div style={{ color: 'var(--text)', fontSize: '0.73rem', marginTop: '3px' }}>
                  {details.ratingsCount.toLocaleString()} ratings
                </div>
              )}
            </div>
            <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
              <div style={labelStyle}>Metacritic</div>
              <div style={{ ...valueStyle, fontSize: '1.05rem', fontWeight: '700' }}>
                {metacritic === null ? 'Not rated' : `${metacritic} / 100`}
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
              <div style={labelStyle}>Release date</div>
              <div style={valueStyle}>{releaseDate}</div>
            </div>
            {details.esrbRating && (
              <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                <div style={labelStyle}>ESRB</div>
                <div style={valueStyle}>{details.esrbRating}</div>
              </div>
            )}
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={labelStyle}>About this game</h3>
            <p style={{ margin: 0, ...valueStyle, whiteSpace: 'pre-line' }}>
              {details.description || (isLoading ? 'Fetching the game description…' : 'No description is available for this title.')}
            </p>
          </section>

          <DetailPills title="Genres" values={genres} />
          <DetailPills title="Platforms" values={platforms} />
          <DetailPills title="Developers" values={details.developers} />
          <DetailPills title="Publishers" values={details.publishers} />

          {typeof details.playtime === 'number' && details.playtime > 0 && (
            <section>
              <h3 style={labelStyle}>Average playtime</h3>
              <p style={{ ...valueStyle, margin: 0 }}>{details.playtime} hours</p>
            </section>
          )}

          {officialWebsite && (
            <div>
              <a
                href={officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--text-h)',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}
              >
                Official website <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '14px',
            color: 'var(--text)',
            fontSize: '0.74rem'
          }}>
            Game data provided by <a href="https://rawg.io/" target="_blank" rel="noopener noreferrer">RAWG.io</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GameDetailsModal;
