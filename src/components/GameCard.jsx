import { useState } from 'react';
import { StarIcon, ClockIcon } from './Icons';
import GameDetailsModal from './GameDetailsModal';
import GameProgressModal from './GameProgressModal';

const formatCompletedDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const GameCard = ({
  id,
  title,
  platform,
  coverUrl,
  status,
  completedAt,
  playtime,
  rating,
  releaseDate,
  actionButton,
  secondaryAction,
  personalPlaytime,
  personalRating,
  personalNotes,
  onSaveProgress
}) => {
  const [imageError, setImageError] = useState(!coverUrl);
  const [showDetails, setShowDetails] = useState(false);
  const [showProgressEditor, setShowProgressEditor] = useState(false);

  const getStatusStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'playing':
        return {
          bg: 'var(--accent)',
          border: 'var(--accent-hover)',
          color: 'var(--text-white)',
          text: 'Playing'
        };
      case 'backlog':
        return {
          bg: 'rgba(31, 41, 55, 0.96)',
          border: 'rgba(156, 163, 175, 0.8)',
          color: '#f9fafb',
          text: 'Backlog'
        };
      case 'completed':
        return {
          bg: 'rgba(6, 78, 59, 0.96)',
          border: 'rgba(52, 211, 153, 0.85)',
          color: '#d1fae5',
          text: 'Completed'
        };
      case 'wishlist':
        return {
          bg: 'rgba(131, 24, 67, 0.96)',
          border: 'rgba(244, 114, 182, 0.85)',
          color: '#fce7f3',
          text: 'Wishlist'
        };
      default:
        return {
          bg: 'rgba(33, 35, 44, 0.8)',
          border: 'rgba(59, 62, 79, 1)',
          color: 'var(--text)',
          text: s || 'Tracked'
        };
    }
  };

  const statusStyle = getStatusStyle(status);
  const completedDateLabel = status === 'completed' ? formatCompletedDate(completedAt) : null;

  return (
    <>
    <div
      className="game-card"
      style={{
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: 'var(--shadow)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--accent-border)';
        e.currentTarget.style.boxShadow = 'var(--glow), var(--shadow)';
        const img = e.currentTarget.querySelector('.game-card-img');
        if (img) img.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        const img = e.currentTarget.querySelector('.game-card-img');
        if (img) img.style.transform = 'scale(1)';
      }}
    >
      {/* Cover Artwork Container */}
      <div style={{
        position: 'relative',
        paddingTop: '135%', // 3:4 aspect ratio for game covers
        backgroundColor: '#1b1d26',
        overflow: 'hidden'
      }}>
        {!imageError ? (
          <img
            className="game-card-img"
            src={coverUrl}
            alt={`${title} Cover`}
            onError={() => setImageError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            background: 'linear-gradient(135deg, #1b1d26 0%, #0a0b0d 100%)',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="var(--accent)" style={{ width: '48px', height: '48px', marginBottom: '8px', opacity: 0.6 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-h)',
              lineHeight: '1.2',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {title}
            </span>
          </div>
        )}

        {/* Status Badge */}
        {status && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
            color: statusStyle.color,
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            letterSpacing: '0.02em',
            zIndex: 2,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
          }}>
            {statusStyle.text}
          </div>
        )}

        {/* Platform tag (bottom left) */}
        {platform && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(10, 11, 13, 0.85)',
            border: '1px solid var(--border)',
            color: 'var(--text-h)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '700',
            letterSpacing: '0.04em',
            zIndex: 2,
            textTransform: 'uppercase'
          }}>
            {platform}
          </div>
        )}
      </div>

      {/* Info Area */}
      <div style={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '10px',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: '600',
            color: 'var(--text-h)',
            lineHeight: '1.3',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }} title={title}>
            {title}
          </h3>
          {releaseDate && (
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text)',
              fontWeight: '400'
            }}>
              {releaseDate}
            </span>
          )}
          {completedDateLabel && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              maxWidth: '100%',
              padding: '3px 7px',
              borderRadius: '5px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              color: '#34d399',
              fontSize: '0.7rem',
              lineHeight: 1.4
            }}>
              Completed {completedDateLabel}
            </span>
          )}
          {id !== undefined && id !== null && (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              aria-label={`View details for ${title}`}
              style={{
                alignSelf: 'flex-start',
                background: 'transparent',
                border: 'none',
                padding: '3px 0',
                color: 'var(--accent)',
                fontSize: '0.75rem',
                fontWeight: '700',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              View details <span aria-hidden="true">→</span>
            </button>
          )}
          {onSaveProgress && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '6px',
              marginTop: '4px'
            }}>
              <span style={{ color: 'var(--text)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                Your stats: {typeof personalPlaytime === 'number' ? `${personalPlaytime}h` : 'No hours logged'}
                {' · '}
                {typeof personalRating === 'number' ? `${personalRating}/5 stars` : 'Not rated'}
                {personalNotes?.trim() ? ' · Notes saved' : ''}
              </span>
              <button
                type="button"
                onClick={() => setShowProgressEditor(true)}
                style={{
                  backgroundColor: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--text-h)',
                  borderRadius: '7px',
                  padding: '7px 10px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Edit Progress
              </button>
            </div>
          )}
        </div>

        {/* Ratings / Playtime + Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderTop: '1px solid var(--border)',
          paddingTop: '12px',
          marginTop: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text)',
              fontSize: '0.75rem'
            }}>
              {playtime !== undefined && playtime !== null ? (
                <>
                  <ClockIcon className="w-3.5 h-3.5 text-accent" />
                  <span>{playtime}h</span>
                </>
              ) : (
                <span style={{ opacity: 0.5 }}>Catalog Title</span>
              )}
            </div>

            <div
              style={{ display: 'flex', gap: '2px' }}
              role="img"
              aria-label={`Rating: ${rating || 0} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className="w-3.5 h-3.5"
                  filled={star <= (rating || 0)}
                  style={{ color: star <= (rating || 0) ? 'var(--accent)' : 'var(--border-focus)' }}
                />
              ))}
            </div>
          </div>

          {/* Optional Action Buttons for Phase 3 */}
          {(actionButton || secondaryAction) && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              {actionButton}
              {secondaryAction}
            </div>
          )}
        </div>
      </div>
    </div>
    {showDetails && id !== undefined && id !== null && (
      <GameDetailsModal
        game={{ id, title, coverUrl, platform, rating, releaseDate }}
        onClose={() => setShowDetails(false)}
      />
    )}
    {showProgressEditor && onSaveProgress && (
      <GameProgressModal
        key={id}
        game={{ id, title, playtimePlayed: personalPlaytime, personalRating, personalNotes }}
        onClose={() => setShowProgressEditor(false)}
        onSave={onSaveProgress}
      />
    )}
    </>
  );
};

export default GameCard;
