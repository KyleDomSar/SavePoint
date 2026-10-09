import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';
import CollectionToolbar from '../components/CollectionToolbar';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useCollection } from '../contexts/useCollection';


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

const WishlistView = () => {
  const { items, updateGameStatus, removeGame, storageError } = useCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [platformFilter, setPlatformFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [gameToRemove, setGameToRemove] = useState(null);
  const allWishlistGames = items.filter((game) => game.status === 'wishlist');
  const query = searchTerm.trim().toLocaleLowerCase();
  const hasActiveFilters = Boolean(query || platformFilter || genreFilter);

  const wishlistGames = allWishlistGames
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

      <CollectionToolbar
        allGames={allWishlistGames}
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
        resultCount={wishlistGames.length}
        totalCount={allWishlistGames.length}
        itemLabel="games"
      />

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
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px'
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
                  onClick={() => setGameToRemove(game)}
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
      ) : hasActiveFilters && allWishlistGames.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <EmptyState
            title="No matching games"
            description="No games match your current search and filters. Try changing a filter or clear them to see your full wishlist."
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
      ) : (
        <EmptyState
          title="Your wishlist is empty"
          description="Open Discover to find games you want to play later, then add them to your Wishlist."
        />
      )}

      <ConfirmationDialog
        game={gameToRemove}
        collectionName="wishlist"
        onCancel={() => setGameToRemove(null)}
        onConfirm={() => {
          if (gameToRemove) removeGame(gameToRemove.id);
          setGameToRemove(null);
        }}
      />
    </div>
  );
};

export default WishlistView;
