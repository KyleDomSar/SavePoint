import { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader from '../components/PageHeader';
import GameCard from '../components/GameCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import SortSelector from '../components/SortSelector';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { fetchGames } from '../services/gameApi';
import { useCollection } from '../contexts/CollectionContext';

const PAGE_SIZE = 20;

const baseButtonStyle = {
  flex: 1,
  minWidth: 0,
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '0.75rem',
  fontWeight: '700',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'opacity 0.2s ease, border-color 0.2s ease'
};

const DiscoverView = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ genres: '', platforms: '' });
  const [ordering, setOrdering] = useState('');
  const [page, setPage] = useState(1);

  const { collection, addGame, updateGameStatus, removeGame } = useCollection();
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const loadGames = useCallback(async (isRetry = false) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    if (!isRetry) setError(null);

    try {
      const data = await fetchGames({
        search,
        genres: filters.genres,
        platforms: filters.platforms,
        ordering,
        page,
        pageSize: PAGE_SIZE,
        signal: controller.signal
      });

      if (currentRequestId !== requestIdRef.current) return;

      setGames(data.results);
      setTotalCount(data.count);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError' || currentRequestId !== requestIdRef.current) return;
      setError(err.message || 'An unexpected error occurred while fetching games.');
    } finally {
      if (currentRequestId === requestIdRef.current) setIsLoading(false);
    }
  }, [search, filters, ordering, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGames();
    return () => abortControllerRef.current?.abort();
  }, [loadGames]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setOrdering(value);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <PageHeader
        title="Discover Games"
        description="Search the live game catalog and add titles to your personal collection."
      />

      <div style={{
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(180px, auto)',
          gap: '20px',
          alignItems: 'center'
        }}>
          <SearchBar value={search} onChange={handleSearchChange} />
          <SortSelector value={ordering} onChange={handleSortChange} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <FilterBar activeFilters={filters} onFiltersChange={handleFiltersChange} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>
          {search ? `Results for "${search}"` : 'Trending Releases'}
        </h2>
        {totalCount > 0 && !isLoading && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {totalCount.toLocaleString()} Games Found
          </span>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => loadGames(true)} />
      ) : isLoading ? (
        <LoadingSkeleton count={8} />
      ) : games.length === 0 ? (
        <EmptyState
          title={search ? 'No matches found' : 'The catalog is empty'}
          description={search ? `We couldn't find any games matching "${search}". Try checking your spelling or using fewer filters.` : 'Check back later for new releases.'}
        />
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {games.map((game) => {
              const saved = collection[String(game.id)];
              const savedStatus = saved?.status;
              const actionButton = !saved ? (
                <button
                  type="button"
                  onClick={() => addGame(game, 'backlog')}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text-h)',
                    border: 'none',
                    boxShadow: 'var(--glow)'
                  }}
                >
                  + Library
                </button>
              ) : savedStatus === 'wishlist' ? (
                <button
                  type="button"
                  onClick={() => updateGameStatus(game.id, 'backlog')}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text-h)',
                    border: 'none',
                    boxShadow: 'var(--glow)'
                  }}
                >
                  Move to Library
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    cursor: 'default',
                    opacity: 0.8
                  }}
                >
                  In Library
                </button>
              );

              const secondaryAction = !saved ? (
                <button
                  type="button"
                  onClick={() => addGame(game, 'wishlist')}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-h)'
                  }}
                >
                  Wishlist
                </button>
              ) : savedStatus === 'wishlist' ? (
                <button
                  type="button"
                  onClick={() => removeGame(game.id)}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateGameStatus(game.id, 'wishlist')}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-h)'
                  }}
                >
                  Move to Wishlist
                </button>
              );

              return (
                <GameCard
                  key={game.id}
                  {...game}
                  status={savedStatus}
                  actionButton={actionButton}
                  secondaryAction={secondaryAction}
                />
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            hasNext={page < totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <footer style={{
        marginTop: '32px',
        padding: '24px 0',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text)',
        fontSize: '0.85rem'
      }}>
        Game data provided by <a href="https://rawg.io/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: '600' }}>RAWG.io</a>
      </footer>
    </div>
  );
};

export default DiscoverView;
