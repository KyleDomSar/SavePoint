import PageHeader from '../components/PageHeader';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';
import { useCollection } from '../contexts/CollectionContext';

const WishlistView = () => {
  const { items, updateGameStatus, removeGame, storageError } = useCollection();
  const wishlistGames = items
    .filter((game) => game.status === 'wishlist')
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <PageHeader
        title="Wishlist"
        description="Keep track of games you want to play and move them to your library when you're ready."
      />

      {storageError && (
        <div role="alert" style={{
          padding: '14px 16px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          borderRadius: '10px',
          color: 'var(--text-h)',
          fontSize: '0.875rem',
          lineHeight: 1.5
        }}>
          {storageError}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>
          Tracked Games ({wishlistGames.length})
        </h2>
        <span style={{ color: 'var(--text)', fontSize: '0.8rem' }}>
          {wishlistGames.length === 1 ? '1 game saved' : `${wishlistGames.length} games saved`}
        </span>
      </div>

      {wishlistGames.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {wishlistGames.map((game) => (
            <GameCard
              key={game.id}
              {...game}
              actionButton={
                <button
                  type="button"
                  onClick={() => updateGameStatus(game.id, 'backlog')}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text-h)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: 'var(--glow)'
                  }}
                >
                  Move to Library
                </button>
              }
              secondaryAction={
                <button
                  type="button"
                  onClick={() => removeGame(game.id)}
                  aria-label={`Remove ${game.title} from wishlist`}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your wishlist is empty"
          description="Open Discover to find games you want to play later, then add them to your Wishlist."
        />
      )}
    </div>
  );
};

export default WishlistView;
