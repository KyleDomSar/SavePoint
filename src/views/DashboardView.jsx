import { useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';
import { GamepadIcon, TrophyIcon, WishlistIcon, ClockIcon, StarIcon } from '../components/Icons';
import { useCollection } from '../contexts/useCollection';

const COMPLETION_MILESTONES = [
  { count: 1, title: 'First Clear', description: 'Complete your first game.' },
  { count: 3, title: 'Getting Started', description: 'Complete 3 games.' },
  { count: 5, title: 'Rising Completionist', description: 'Complete 5 games.' },
  { count: 10, title: 'Seasoned Player', description: 'Complete 10 games.' },
  { count: 25, title: 'Completion Expert', description: 'Complete 25 games.' },
  { count: 50, title: 'Completion Legend', description: 'Complete 50 games.' }
];

const DashboardView = () => {
  const { items, storageError, importCollection, updateGameStatus, updateGameProgress } = useCollection();
  const [pickedBacklogId, setPickedBacklogId] = useState(null);
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
    const input = event.currentTarget;
    const file = input.files?.[0];
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
      input.value = '';
    }
  };

  const libraryGames = items.filter((game) => game.status !== 'wishlist');
  const librarySize = libraryGames.length;
  const wishlistCount = items.filter((game) => game.status === 'wishlist').length;
  const completedCount = libraryGames.filter((game) => game.status === 'completed').length;
  const unlockedMilestones = COMPLETION_MILESTONES.filter((milestone) => completedCount >= milestone.count).length;
  const nextMilestone = COMPLETION_MILESTONES.find((milestone) => completedCount < milestone.count) || null;
  const previousMilestoneCount = [...COMPLETION_MILESTONES]
    .reverse()
    .find((milestone) => completedCount >= milestone.count)?.count || 0;
  const milestoneProgress = nextMilestone
    ? Math.min(100, Math.max(0, ((completedCount - previousMilestoneCount) / (nextMilestone.count - previousMilestoneCount)) * 100))
    : 100;
  const playingGames = libraryGames.filter((game) => game.status === 'playing');
  const backlogGames = items
    .filter((game) => game.status === 'backlog')
    .sort((a, b) => (Number(b.addedAt) || 0) - (Number(a.addedAt) || 0));
  const pickedBacklogGame = backlogGames.find((game) => String(game.id) === String(pickedBacklogId)) || null;
  const recentGames = [...items]
    .sort((a, b) => (Number(b.addedAt) || 0) - (Number(a.addedAt) || 0))
    .slice(0, 4);
  const recentCompletedGames = libraryGames
    .filter((game) => game.status === 'completed')
    .sort((a, b) => {
      const completedAtDifference = (Date.parse(b.completedAt || '') || 0) - (Date.parse(a.completedAt || '') || 0);
      return completedAtDifference || (Number(b.addedAt) || 0) - (Number(a.addedAt) || 0);
    })
    .slice(0, 4);
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

  const statusBreakdown = [
    { status: 'playing', label: 'Playing', count: items.filter((game) => game.status === 'playing').length, color: '#2dd4bf' },
    { status: 'backlog', label: 'Backlog', count: items.filter((game) => game.status === 'backlog').length, color: '#9ca3af' },
    { status: 'completed', label: 'Completed', count: items.filter((game) => game.status === 'completed').length, color: '#10b981' },
    { status: 'wishlist', label: 'Wishlist', count: wishlistCount, color: '#ec4899' }
  ];
  const trackedGamesCount = items.length;
  const genreCounts = new Map();
  libraryGames.forEach((game) => {
    const seenGenres = new Set();
    (Array.isArray(game.genres) ? game.genres : []).forEach((genre) => {
      const name = (typeof genre === 'string' ? genre : genre?.name || '').trim();
      const key = name.toLocaleLowerCase();
      if (!name || seenGenres.has(key)) return;
      seenGenres.add(key);
      const existing = genreCounts.get(key);
      genreCounts.set(key, { name: existing?.name || name, count: (existing?.count || 0) + 1 });
    });
  });
  const topGenres = [...genreCounts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    .slice(0, 5);

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

      <section style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        padding: '20px',
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>Collection Insights</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
            A quick look at your collection status and most common genres.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '20px'
        }}>
          <div style={{
            minWidth: 0,
            padding: '16px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--text-h)', margin: 0 }}>Status Breakdown</h3>
              <span style={{ color: 'var(--text)', fontSize: '0.75rem' }}>{trackedGamesCount} tracked</span>
            </div>

            {trackedGamesCount > 0 ? (
              <>
                <div
                  role="img"
                  aria-label={statusBreakdown.map((entry) => `${entry.label}: ${entry.count}`).join(', ')}
                  style={{ display: 'flex', height: '10px', width: '100%', overflow: 'hidden', borderRadius: '999px', backgroundColor: 'var(--border)' }}
                >
                  {statusBreakdown.filter((entry) => entry.count > 0).map((entry) => (
                    <div
                      key={entry.status}
                      title={`${entry.label}: ${entry.count}`}
                      style={{ width: `${(entry.count / trackedGamesCount) * 100}%`, height: '100%', backgroundColor: entry.color, minWidth: entry.count > 0 ? '2px' : 0 }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {statusBreakdown.map((entry) => (
                    <div key={entry.status} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-h)', fontSize: '0.82rem' }}>
                          <span aria-hidden="true" style={{ width: '9px', height: '9px', borderRadius: '3px', flexShrink: 0, backgroundColor: entry.color }} />
                          {entry.label}
                        </span>
                        <span style={{ color: 'var(--text)', fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>
                          {entry.count} · {((entry.count / trackedGamesCount) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '5px', borderRadius: '999px', backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{ width: `${(entry.count / trackedGamesCount) * 100}%`, height: '100%', backgroundColor: entry.color, borderRadius: '999px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ margin: 0, padding: '18px 0', color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Add games to your collection to see their status breakdown here.
              </p>
            )}
          </div>

          <div style={{
            minWidth: 0,
            padding: '16px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--text-h)', margin: 0 }}>Top Genres</h3>
              <span style={{ color: 'var(--text)', fontSize: '0.75rem' }}>Your library</span>
            </div>

            {topGenres.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {topGenres.map((genre, index) => (
                  <div key={genre.name.toLocaleLowerCase()} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ color: 'var(--text-h)', fontSize: '0.82rem', minWidth: 0, overflowWrap: 'anywhere' }}>
                        {index + 1}. {genre.name}
                      </span>
                      <span style={{ flexShrink: 0, color: 'var(--text)', fontSize: '0.78rem', fontVariantNumeric: 'tabular-nums' }}>
                        {genre.count} {genre.count === 1 ? 'game' : 'games'}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '999px', backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(genre.count / (topGenres[0]?.count || 1)) * 100}%`,
                        height: '100%',
                        borderRadius: '999px',
                        backgroundColor: 'var(--accent)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, padding: '18px 0', color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Genre insights will show up when your saved library includes genre data.
              </p>
            )}
          </div>
        </div>
      </section>

      <section style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        padding: '20px',
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>Completion Achievements</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
              Milestones you unlock as you finish games in your collection.
            </p>
          </div>
          <span style={{
            flexShrink: 0,
            border: '1px solid var(--accent-border)',
            borderRadius: '999px',
            padding: '5px 10px',
            backgroundColor: 'var(--accent-bg)',
            color: 'var(--accent)',
            fontSize: '0.75rem',
            fontWeight: '700'
          }}>
            {unlockedMilestones} / {COMPLETION_MILESTONES.length} unlocked
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
          gap: '12px'
        }}>
          {COMPLETION_MILESTONES.map((milestone) => {
            const unlocked = completedCount >= milestone.count;
            return (
              <div
                key={milestone.count}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  minWidth: 0,
                  padding: '14px',
                  border: `1px solid ${unlocked ? 'var(--accent-border)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  backgroundColor: unlocked ? 'var(--accent-bg)' : 'var(--bg)',
                  opacity: unlocked ? 1 : 0.78
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  border: `1px solid ${unlocked ? 'var(--accent-border)' : 'var(--border)'}`,
                  backgroundColor: unlocked ? 'var(--panel-bg)' : 'transparent',
                  color: unlocked ? 'var(--accent)' : 'var(--text)'
                }} aria-hidden="true">
                  <TrophyIcon />
                </div>
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{
                    color: unlocked ? 'var(--text-h)' : 'var(--text)',
                    fontSize: '0.88rem',
                    lineHeight: 1.35,
                    overflowWrap: 'anywhere'
                  }}>
                    {milestone.title}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.75rem', lineHeight: 1.45 }}>
                    {milestone.description}
                  </p>
                  <span style={{
                    marginTop: '2px',
                    color: unlocked ? 'var(--accent)' : 'var(--text)',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>
                    {unlocked ? 'Unlocked' : `${milestone.count - completedCount} more to unlock`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {nextMilestone ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: 'var(--text-h)', fontSize: '0.8rem', fontWeight: '650' }}>
                Next: {nextMilestone.title}
              </span>
              <span style={{ color: 'var(--text)', fontSize: '0.75rem' }}>
                {completedCount} / {nextMilestone.count} completed
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`Progress toward ${nextMilestone.title}`}
              aria-valuemin={0}
              aria-valuemax={nextMilestone.count}
              aria-valuenow={Math.min(completedCount, nextMilestone.count)}
              style={{ height: '8px', overflow: 'hidden', borderRadius: '999px', backgroundColor: 'var(--border)' }}
            >
              <div style={{
                width: `${milestoneProgress}%`,
                height: '100%',
                borderRadius: '999px',
                backgroundColor: 'var(--accent)',
                transition: 'width 0.25s ease'
              }} />
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, color: 'var(--accent)', fontSize: '0.82rem', fontWeight: '700' }}>
            Every completion milestone is unlocked. Keep building your collection!
          </p>
        )}
      </section>

      <section style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        padding: '20px',
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>Backlog Roulette</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
              Can't decide what to play? Pick a random game from your backlog.
            </p>
          </div>
          <span style={{ color: 'var(--text)', fontSize: '0.8rem' }}>
            {backlogGames.length} {backlogGames.length === 1 ? 'game' : 'games'} in backlog
          </span>
        </div>

        {pickedBacklogGame ? (
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '14px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '10px'
          }}>
            <div style={{
              width: '96px',
              height: '128px',
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #29223c 0%, #0a0b0d 100%)'
            }}>
              {pickedBacklogGame.coverUrl && (
                <img
                  src={pickedBacklogGame.coverUrl}
                  alt={`${pickedBacklogGame.title} cover`}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                    if (event.currentTarget.nextElementSibling) {
                      event.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: pickedBacklogGame.coverUrl ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '8px',
                color: 'var(--text-h)',
                fontSize: '0.75rem',
                fontWeight: '700',
                overflowWrap: 'anywhere'
              }}>
                {pickedBacklogGame.title}
              </div>
            </div>

            <div style={{
              flex: '1 1 220px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{
                  alignSelf: 'flex-start',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '999px',
                  padding: '3px 8px',
                  color: 'var(--accent)',
                  backgroundColor: 'var(--accent-bg)',
                  fontSize: '0.7rem',
                  fontWeight: '700'
                }}>
                  Random pick
                </span>
                <h3 style={{
                  margin: 0,
                  color: 'var(--text-h)',
                  fontSize: '1.1rem',
                  lineHeight: 1.35,
                  overflowWrap: 'anywhere'
                }}>
                  {pickedBacklogGame.title}
                </h3>
                <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {[pickedBacklogGame.platform, pickedBacklogGame.releaseDate].filter(Boolean).join(' · ') || 'Ready when you are'}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    updateGameStatus(pickedBacklogGame.id, 'playing');
                    setPickedBacklogId(null);
                  }}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text-h)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: 'var(--glow)'
                  }}
                >
                  Mark as Playing
                </button>
                <button
                  type="button"
                  disabled={backlogGames.length < 2}
                  onClick={() => {
                    const otherGames = backlogGames.filter((game) => String(game.id) !== String(pickedBacklogGame.id));
                    const pool = otherGames.length > 0 ? otherGames : backlogGames;
                    const nextPick = pool[Math.floor(Math.random() * pool.length)];
                    if (nextPick) setPickedBacklogId(String(nextPick.id));
                  }}
                  style={{
                    backgroundColor: 'var(--panel-bg)',
                    color: backlogGames.length < 2 ? 'var(--text)' : 'var(--text-h)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: backlogGames.length < 2 ? 'not-allowed' : 'pointer',
                    opacity: backlogGames.length < 2 ? 0.55 : 1
                  }}
                >
                  Roll Again
                </button>
              </div>
            </div>
          </div>
        ) : backlogGames.length > 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '18px',
            backgroundColor: 'var(--bg)',
            border: '1px dashed var(--border)',
            borderRadius: '10px'
          }}>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Let SavePoint choose one of your {backlogGames.length} backlog {backlogGames.length === 1 ? 'game' : 'games'}.
            </p>
            <button
              type="button"
              onClick={() => {
                const pick = backlogGames[Math.floor(Math.random() * backlogGames.length)];
                if (pick) setPickedBacklogId(String(pick.id));
              }}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--text-h)',
                border: '1px solid var(--accent-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: 'var(--glow)'
              }}
            >
              Pick a game
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '18px',
            backgroundColor: 'var(--bg)',
            border: '1px dashed var(--border)',
            borderRadius: '10px'
          }}>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Your backlog is empty. Add games to your Library with Backlog status to use this picker.
            </p>
            <button
              type="button"
              onClick={() => { window.location.hash = 'discover'; }}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-h)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Discover games
            </button>
          </div>
        )}
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>Recently Added</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: 0 }}>
              Your latest saved games across Library and Wishlist.
            </p>
          </div>
          {recentGames.length > 0 && (
            <span style={{
              color: 'var(--text)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Latest {recentGames.length} {recentGames.length === 1 ? 'game' : 'games'}
            </span>
          )}
        </div>

        {recentGames.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
            width: '100%'
          }}>
            {recentGames.map((game) => (
              <GameCard
                key={game.id}
                {...game}
                actionButton={(
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = game.status === 'wishlist' ? 'wishlist' : 'library';
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text-h)',
                      border: '1px solid var(--border)',
                      borderRadius: '7px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {game.status === 'wishlist' ? 'Open Wishlist' : 'Open Library'}
                  </button>
                )}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No games saved yet"
            description="Games you add from Discover will appear here, so you can jump back to your collection quickly."
          />
        )}
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)', margin: 0 }}>Recently Completed</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: 0 }}>
              Your latest finished games, sorted by completion date.
            </p>
          </div>
          <span style={{
            color: 'var(--text)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {completedCount} {completedCount === 1 ? 'game completed' : 'games completed'}
          </span>
        </div>

        {recentCompletedGames.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
            width: '100%'
          }}>
            {recentCompletedGames.map((game) => (
              <GameCard
                key={game.id}
                {...game}
                actionButton={(
                  <button
                    type="button"
                    onClick={() => { window.location.hash = 'library'; }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text-h)',
                      border: '1px solid var(--border)',
                      borderRadius: '7px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Open Library
                  </button>
                )}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '18px',
            backgroundColor: 'var(--panel-bg)',
            border: '1px dashed var(--border)',
            borderRadius: '10px'
          }}>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Finished games will appear here when you mark them as Completed in My Library.
            </p>
            <button
              type="button"
              onClick={() => { window.location.hash = 'library'; }}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-h)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Open Library
            </button>
          </div>
        )}
      </section>

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
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {playingGames.map((game) => (
                <GameCard
                  key={game.id}
                  {...game}
                  personalPlaytime={game.playtimePlayed}
                  personalRating={game.personalRating}
                  personalNotes={game.personalNotes}
                  onSaveProgress={(progress) => updateGameProgress(game.id, progress)}
                />
              ))}
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
