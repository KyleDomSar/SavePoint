import { useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import GameCard from '../components/GameCard';
import { GamepadIcon, TrophyIcon, WishlistIcon, ClockIcon, StarIcon } from '../components/Icons';
import { useCollection } from '../contexts/useCollection';

const DashboardView = () => {
  const { items, storageError, importCollection } = useCollection();
  const backupInputRef = useRef(null);
  const [backupMessage, setBackupMessage] = useState(null);

  const handleExportBackup = () => {
    const backup = {
      format: 'savepoint-collection-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      games: items
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `savepoint-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    setBackupMessage({
      type: 'success',
      text: `Backup exported with ${items.length} ${items.length === 1 ? 'game' : 'games'}.`
    });
  };

  const handleImportBackup = async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    try {
      if (file.size > 5 * 1024 * 1024) {
        setBackupMessage({ type: 'error', text: 'This backup is larger than 5 MB and was not imported.' });
        return;
      }

      const backup = JSON.parse(await file.text());
      if (
        !backup ||
        typeof backup !== 'object' ||
        backup.format !== 'savepoint-collection-backup' ||
        backup.version !== 1 ||
        !Array.isArray(backup.games)
      ) {
        setBackupMessage({
          type: 'error',
          text: 'This file is not a supported SavePoint backup. Your collection was not changed.'
        });
        return;
      }

      const result = importCollection(backup.games);
      if (!result.success) {
        setBackupMessage({ type: 'error', text: result.message });
        return;
      }

      setBackupMessage({
        type: 'success',
        text: result.count === 0
          ? 'The backup is valid but empty. Your current collection was kept.'
          : `Backup merged: ${result.added} added, ${result.updated} updated. Games not in the backup were kept.`
      });
    } catch {
      setBackupMessage({
        type: 'error',
        text: 'Could not read this backup file. Make sure it is valid JSON. Your collection was not changed.'
      });
    } finally {
      event.currentTarget.value = '';
    }
  };

  const libraryGames = items.filter((game) => game.status !== 'wishlist');
  const librarySize = libraryGames.length;
  const wishlistCount = items.filter((game) => game.status === 'wishlist').length;
  const completedCount = libraryGames.filter((game) => game.status === 'completed').length;
  const playingGames = libraryGames.filter((game) => game.status === 'playing');
  const ratedGames = libraryGames.filter((game) => Number.isInteger(game.personalRating) && game.personalRating >= 1 && game.personalRating <= 5);
  const averagePersonalRating = ratedGames.length
    ? `${(ratedGames.reduce((total, game) => total + game.personalRating, 0) / ratedGames.length).toFixed(1)} / 5`
    : 'Not rated';
  const totalPersonalPlaytime = libraryGames.reduce((total, game) => {
    const hours = Number(game.playtimePlayed);
    return total + (Number.isFinite(hours) && hours > 0 ? hours : 0);
  }, 0);
  const displayedPlaytime = `${Number(totalPersonalPlaytime.toFixed(1))}h`;
  const completionRate = librarySize > 0
    ? `${((completedCount / librarySize) * 100).toFixed(1)}%`
    : '0.0%';

  const stats = [
    { title: 'Library Size', value: String(librarySize), icon: <GamepadIcon />, description: 'Games saved to your library' },
    { title: 'Wishlist Count', value: String(wishlistCount), icon: <WishlistIcon />, description: 'Games you want to play' },
    { title: 'Completion Rate', value: completionRate, icon: <TrophyIcon />, description: `${completedCount} games completed` },
    { title: 'Currently Playing', value: String(playingGames.length), icon: <ClockIcon />, description: 'Marked as in progress' },
    { title: 'Total Playtime', value: displayedPlaytime, icon: <ClockIcon />, description: 'Hours you logged yourself' },
    { title: 'Average Personal Rating', value: averagePersonalRating, icon: <StarIcon />, description: `${ratedGames.length} games personally rated` }
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={handleExportBackup}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Export backup
              </button>
              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Import backup
              </button>
              <input
                ref={backupInputRef}
                type="file"
                accept=".json,application/json"
                aria-label="Choose a SavePoint JSON backup"
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
            </div>
            {backupMessage && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: backupMessage.type === 'error' ? 'rgba(245, 158, 11, 0.08)' : 'var(--accent-bg)',
                  border: `1px solid ${backupMessage.type === 'error' ? 'rgba(245, 158, 11, 0.45)' : 'var(--accent-border)'}`,
                  color: 'var(--text-h)',
                  fontSize: '0.8rem',
                  lineHeight: 1.5
                }}
              >
                {backupMessage.text}
              </div>
            )}
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
