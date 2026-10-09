import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';
import CollectionToolbar from '../components/CollectionToolbar';
import { useCollection } from '../contexts/useCollection';

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
  const { items, updateGameStatus, updateGameProgress, removeGame, storageError } = useCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const allLibraryGames = items.filter((game) => game.status !== 'wishlist');
  const query = searchTerm.trim().toLocaleLowerCase();

  const libraryGames = allLibraryGames
    .filter((game) => {
      const genreText = Array.isArray(game.genres)
        ? game.genres.map((genre) => typeof genre === 'string' ? genre : genre?.name || '').join(' ')
        : '';
      const searchableText = [game.title, game.platform, genreText]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      return searchableText.includes(query);
    })
    .sort((a, b) => {
      const addedDifference = (Number(b.addedAt) || 0) - (Number(a.addedAt) || 0);
      if (sortBy === 'title') {
        return String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' });
      }
      if (sortBy === 'rating') {
        return ((Number(b.personalRating) || 0) - (Number(a.personalRating) || 0)) || addedDifference;
      }
      if (sortBy === 'playtime') {
        return ((Number(b.playtimePlayed) || 0) - (Number(a.playtimePlayed) || 0)) || addedDifference;
      }
      return addedDifference;
    });

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

      <CollectionToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        resultCount={libraryGames.length}
        totalCount={allLibraryGames.length}
        itemLabel="games"
      />

      {query && allLibraryGames.length > 0 && libraryGames.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <EmptyState
            title="No matching games"
            description={`No games in your library match "${searchTerm.trim()}". Try another title, platform, or genre.`}
          />
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            style={{
              backgroundColor: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              color: 'var(--text-h)',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Clear search
          </button>
        </div>
      ) : SECTIONS.map((section) => {
        const sectionTotal = allLibraryGames.filter((game) => game.status === section.status);
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
                    personalPlaytime={game.playtimePlayed}
                    personalRating={game.personalRating}
                    personalNotes={game.personalNotes}
                    onSaveProgress={(progress) => updateGameProgress(game.id, progress)}
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
            ) : query && sectionTotal.length > 0 ? (
              <p style={{
                margin: 0,
                padding: '18px',
                border: '1px dashed var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                fontSize: '0.85rem'
              }}>
                No games in this section match your search.
              </p>
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
