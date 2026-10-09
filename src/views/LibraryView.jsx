import PageHeader from '../components/PageHeader';
import GameCard from '../components/GameCard';

const LibraryView = () => {
  const libraryData = [
    { title: 'Bloodborne', platform: 'PS4', coverUrl: 'https://images.unsplash.com/photo-1592155931584-901ac15763e3?auto=format&fit=crop&w=400&q=80', status: 'Completed', playtime: 86, rating: 5, releaseDate: '2015' },
    { title: 'Sekiro: Shadows Die Twice', platform: 'Steam', coverUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&q=80', status: 'Completed', playtime: 54, rating: 5, releaseDate: '2019' },
    { title: 'The Witcher 3: Wild Hunt', platform: 'Steam', coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80', status: 'Backlog', playtime: 4, rating: 5, releaseDate: '2015' },
    { title: 'Marvel\'s Spider-Man 2', platform: 'PS5', coverUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=400&q=80', status: 'Completed', playtime: 28, rating: 4, releaseDate: '2023' },
    { title: 'Armored Core VI: Fires of Rubicon', platform: 'Steam', coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80', status: 'Backlog', playtime: 0, rating: 0, releaseDate: '2023' },
    { title: 'Resident Evil 4 Remake', platform: 'Steam', coverUrl: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=400&q=80', status: 'Backlog', playtime: 0, rating: 0, releaseDate: '2023' },
  ];

  const sections = [
    { title: 'Currently Playing', status: 'Playing' },
    { title: 'Gaming Backlog', status: 'Backlog' },
    { title: 'Completed Collection', status: 'Completed' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <PageHeader
        title="My Library"
        description="Organize and manage your personal video game collection across all platforms."
      />

      {sections.map((section, idx) => {
        const games = libraryData.filter(g =>
          section.status === 'Playing'
            ? g.status.toLowerCase() === 'playing'
            : g.status.toLowerCase() === section.status.toLowerCase()
        );

        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)' }}>{section.title}</h2>
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
                {games.map((game, i) => (
                  <GameCard key={i} {...game} />
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
                No games currently in this section.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LibraryView;
