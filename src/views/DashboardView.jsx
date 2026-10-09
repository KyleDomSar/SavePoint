import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import GameCard from '../components/GameCard';
import { GamepadIcon, TrophyIcon, WishlistIcon, ClockIcon } from '../components/Icons';
import { useCollection } from '../contexts/useCollection';

const DashboardView = () => {
  const { items, storageError } = useCollection();

  const libraryGames = items.filter((game) => game.status !== 'wishlist');
  const librarySize = libraryGames.length;
  const wishlistCount = items.filter((game) => game.status === 'wishlist').length;
  const completedCount = libraryGames.filter((game) => game.status === 'completed').length;
  const playingGames = libraryGames.filter((game) => game.status === 'playing');
  const completionRate = librarySize > 0
    ? `${((completedCount / librarySize) * 100).toFixed(1)}%`
    : '0.0%';

  const stats = [
    { title: 'Library Size', value: String(librarySize), icon: <GamepadIcon />, description: 'Games saved to your library' },
    { title: 'Wishlist Count', value: String(wishlistCount), icon: <WishlistIcon />, description: 'Games you want to play' },
    { title: 'Completion Rate', value: completionRate, icon: <TrophyIcon />, description: `${completedCount} games completed` },
    { title: 'Currently Playing', value: String(playingGames.length), icon: <ClockIcon />, description: 'Marked as in progress' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <PageHeader
        title="Dashboard"
        description="Your personal video game library analytics and collection overview."
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '24px',
        marginTop: '12px',
        width: '100%'
      }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>Currently Playing</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              From your library
            </span>
          </div>

          {playingGames.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {playingGames.map((game) => <GameCard key={game.id} {...game} />)}
            </div>
          ) : (
            <div style={{
              padding: '40px 24px',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'var(--text)',
              fontSize: '0.875rem',
              lineHeight: 1.6
            }}>
              No games are marked as Playing yet. Change a game's status in My Library and it will appear here.
            </div>
          )}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>Collection & Storage</h2>
          <div style={{
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: 'var(--shadow)',
            height: '100%'
          }}>
            <div>
              <div style={{ color: 'var(--text-h)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '5px' }}>
                {storageError ? 'Storage needs attention' : 'Saved in this browser'}
              </div>
              <p style={{ color: 'var(--text)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                {storageError || 'Your collection is stored locally in this browser. It does not automatically sync across devices or browsers.'}
              </p>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ color: 'var(--text-h)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '5px' }}>
                Live game catalog
              </div>
              <p style={{ color: 'var(--text)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                Discover uses RAWG game data through SavePoint's server-side API proxy. Your personal collection stays separate from the catalog.
              </p>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ color: 'var(--text-h)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '5px' }}>
                Total tracked
              </div>
              <p style={{ color: 'var(--text)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                {items.length} {items.length === 1 ? 'game' : 'games'} across your library and wishlist.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardView;
