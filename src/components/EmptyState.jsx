import { GamepadIcon } from './Icons';

// Empty state shown when a search returns no matching games.
const EmptyState = ({ title = 'No games found', description }) => {
  return (
    <div className="empty-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '64px 24px',
      backgroundColor: 'var(--panel-bg)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      textAlign: 'center',
      width: '100%'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent-bg)',
        border: '1px solid var(--accent-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent)'
      }}>
        <GamepadIcon className="w-8 h-8" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-h)', margin: 0 }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', margin: 0, maxWidth: '420px' }}>
          {description || 'Try a different search term or clear your filters to see more games.'}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;