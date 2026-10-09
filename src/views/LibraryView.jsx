import PageHeader from '../components/PageHeader';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';
import { useCollection } from '../contexts/CollectionContext';

const SECTIONS = [
  { title: 'Currently Playing', status: 'playing', emptyTitle: 'Nothing in progress', emptyDescription: 'Add a game to your library and set its status to Playing.' },
  { title: 'Gaming Backlog', status: 'backlog', emptyTitle: 'Your backlog is clear', emptyDescription: 'Discover games you want to play and save them to your library.' },
  { title: 'Completed Collection', status: 'completed', emptyTitle: 'No completed games yet', emptyDescription: 'When you finish a game, change its status to Completed here.' }
];

const selectStyle = {
  flex: 1,
  minWidth: 0,
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--text-h)',
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer'
};

const removeButtonStyle = {
  backgroundColor: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer'
};

const LibraryView = () => {
  const { items, updateGameStatus, removeGame, storageError } = useCollection();
  const libraryGames = items
    .filter((game) => game.status !== 'wishlist')
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <PageHeader
        title="My Library"
        description="Manage your collection and update each game's status as you play."
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

      {SECTIONS.map((section) => {
        const games = libraryGames.filter((game) => game.status === section.status);

        return (
          <section key={section.status} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>{section.title}</h2>
              <span style={{
                backgroundColor: 'var(--border)',
                color: 'var(--text)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '700'
              }}>
                {games.length}
              </span>
            </div>

            {games.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '24px'
              }}>
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    {...game}
                    actionButton={
                      <select
                        aria-label={`Change status for ${game.title}`}
                        value={game.status}
                        onChange={(event) => updateGameStatus(game.id, event.target.value)}
                        style={selectStyle}
                      >
                        <option value="playing">Playing</option>
                        <option value="backlog">Backlog</option>
                        <option value="completed">Completed</option>
                      </select>
                    }
                    secondaryAction={
                      <button
                        type="button"
                        onClick={() => removeGame(game.id)}
                        style={removeButtonStyle}
                        aria-label={`Remove ${game.title} from library`}
                      >
                        Remove
                      </button>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState title={section.emptyTitle} description={section.emptyDescription} />
            )}
          </section>
        );
      })}
    </div>
  );
};

export default LibraryView;
