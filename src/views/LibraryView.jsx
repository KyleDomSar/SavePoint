import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';
import CollectionToolbar from '../components/CollectionToolbar';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useCollection } from '../contexts/useCollection';

const SECTIONS = [
  { title: 'Currently Playing', status: 'playing', emptyTitle: 'Nothing in progress', emptyDescription: 'Add a game to your library and set its status to Playing.' },
  { title: 'Gaming Backlog', status: 'backlog', emptyTitle: 'Your backlog is clear', emptyDescription: 'Discover games you want to play and save them to your library.' },
  { title: 'Completed Collection', status: 'completed', emptyTitle: 'No completed games yet', emptyDescription: 'When you finish a game, change its status to Completed here.' }
];

const selectStyle = {
  width: '100%',
  minWidth: 0,
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--text-h)',
  borderRadius: '6px',
  padding: '8px 28px 8px 10px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  outline: 'none'
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


const getPlatformName = (game) => {
  const platform = game?.platform;
  if (Array.isArray(platform)) {
    return platform.map((item) => typeof item === 'string' ? item : item?.name || '').filter(Boolean).join(', ');
  }
  if (typeof platform === 'string') return platform.trim();
  return typeof platform?.name === 'string' ? platform.name.trim() : '';
};

const getGenreNames = (game) => {
  if (!Array.isArray(game?.genres)) return [];
  return game.genres
    .map((genre) => typeof genre === 'string' ? genre : genre?.name || '')
    .filter(Boolean);
};

const LibraryView = () => {
  const { items, updateGameStatus, updateGameProgress, removeGame, storageError } = useCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [platformFilter, setPlatformFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [gameToRemove, setGameToRemove] = useState(null);
  const allLibraryGames = items.filter((game) => game.status !== 'wishlist');
  const query = searchTerm.trim().toLocaleLowerCase();
  const hasActiveFilters = Boolean(query || platformFilter || genreFilter);

  const libraryGames = allLibraryGames
    .filter((game) => {
      const searchableText = [game.title, getPlatformName(game), getGenreNames(game).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      const matchesSearch = searchableText.includes(query);
      const matchesPlatform = !platformFilter
        || getPlatformName(game).toLocaleLowerCase() === platformFilter.toLocaleLowerCase();
      const matchesGenre = !genreFilter
        || getGenreNames(game).some((genre) => genre.toLocaleLowerCase() === genreFilter.toLocaleLowerCase());
      return matchesSearch && matchesPlatform && matchesGenre;
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
    <div className="collection-view library-view" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
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
        allGames={allLibraryGames}
        searchTerm={searchTerm}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
        genreFilter={genreFilter}
        onGenreFilterChange={setGenreFilter}
        onClearFilters={() => {
          setSearchTerm('');
          setPlatformFilter('');
          setGenreFilter('');
        }}
        onSearchTermChange={setSearchTerm}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        resultCount={libraryGames.length}
        totalCount={allLibraryGames.length}
        itemLabel="games"
      />

      {hasActiveFilters && allLibraryGames.length > 0 && libraryGames.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <EmptyState
            title="No matching games"
            description="No games match your current search and filters. Try changing a filter or clear them to see your full library."
          />
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setPlatformFilter(''); setGenreFilter(''); }}
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
            Clear filters
          </button>
        </div>
      ) : SECTIONS.map((section) => {
        const sectionTotal = allLibraryGames.filter((game) => game.status === section.status);
        const games = libraryGames.filter((game) => game.status === section.status);

        return (
          <section key={section.status} className="library-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
            <div className="collection-section-heading" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
              <div className="game-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '16px'
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
                      <div style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        flex: '0 1 auto',
                        width: 'max-content',
                        maxWidth: 'calc(100% - 68px)',
                        minWidth: 0
                      }}>
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
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            right: '9px',
                            color: 'var(--text)',
                            pointerEvents: 'none'
                          }}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    }
                    secondaryAction={
                      <button
                        type="button"
                        onClick={() => setGameToRemove(game)}
                        style={removeButtonStyle}
                        aria-label={`Remove ${game.title} from library`}
                      >
                        Remove
                      </button>
                    }
                  />
                ))}
              </div>
            ) : hasActiveFilters && sectionTotal.length > 0 ? (
              <p style={{
                margin: 0,
                padding: '18px',
                border: '1px dashed var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                fontSize: '0.85rem'
              }}>
                No games in this section match your current filters.
              </p>
            ) : (
              <EmptyState title={section.emptyTitle} description={section.emptyDescription} />
            )}
          </section>
        );
      })}

      <ConfirmationDialog
        game={gameToRemove}
        collectionName="library"
        onCancel={() => setGameToRemove(null)}
        onConfirm={() => {
          if (gameToRemove) removeGame(gameToRemove.id);
          setGameToRemove(null);
        }}
      />
    </div>
  );
};

export default LibraryView;
