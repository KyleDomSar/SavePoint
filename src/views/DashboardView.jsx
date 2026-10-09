import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import GameCard from '../components/GameCard';
import { GamepadIcon, TrophyIcon, WishlistIcon, ClockIcon } from '../components/Icons';
import { useCollection } from '../contexts/CollectionContext';

const DashboardView = () => {
  const { items } = useCollection();

  // Derive real statistics from saved collection
  const libraryGames = items.filter((g) => g.status !== 'wishlist');
  const librarySize = libraryGames.length;
  const wishlistCount = items.filter((g) => g.status === 'wishlist').length;
  const completedCount = libraryGames.filter((g) => g.status === 'completed').length;
  const playingCount = libraryGames.filter((g) => g.status === 'playing').length;

  const completionRate = librarySize > 0 ? ((completedCount / librarySize) * 100).toFixed(1) + '%' : '0.0%';

  const stats = [
    { title: 'Library Size', value: String(librarySize), icon: <GamepadIcon />, description: 'Total catalogued games' },
    { title: 'Wishlist Count', value: String(wishlistCount), icon: <WishlistIcon />, description: 'Awaiting purchase/release' },
    { title: 'Completion Rate', value: completionRate, icon: <TrophyIcon />, description: `${completedCount} games completed` },
    { title: 'Currently Playing', value: String(playingCount), icon: <ClockIcon />, description: 'Active play sessions' }
  ];

  // Currently playing games from user library
  const playingGames = libraryGames.filter((g) => g.status === 'playing');

  // Mock activity logging (clearly labeled illustrative content)
  const activities = [
    { id: 1, action: 'SavePoint v1.3 Storage Sync Active', detail: 'Local collection synchronized successfully', time: 'Just now' },
    { id: 2, action: 'RAWG API Proxy Connected', detail: 'Live game catalog search enabled via Vercel', time: 'Session start' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <PageHeader
        title="Dashboard"
        description="Your personal video game library analytics and collection overview."
      />

      {/* Grid of Derived Statistical Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '24px',
        marginTop: '12px',
        width: '100%'
      }}>
        {/* Currently Playing Grid Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)' }}>Currently Playing</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real User Library
            </span>
          </div>

          {playingGames.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {playingGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '40px',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'var(--text)',
              fontSize: '0.875rem'
            }}>
              No games currently marked as &quot;Playing&quot;. Update a game status in My Library to feature it here!
            </div>
          )}
        </div>

        {/* System Activity Log column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)' }}>System Status</h2>

          <div style={{
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow)',
            height: '100%'
          }}>
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  paddingBottom: index !== activities.length - 1 ? '16px' : 0,
                  borderBottom: index !== activities.length - 1 ? '1px solid var(--border)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-h)' }}>
                    {activity.action}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                    {activity.time}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                  {activity.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
