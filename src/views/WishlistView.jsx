import PageHeader from '../components/PageHeader';
import GameCard from '../components/GameCard';

const WishlistView = () => {
  const wishlistData = [
    { title: 'Grand Theft Auto VI', platform: 'PS5', coverUrl: 'https://images.unsplash.com/photo-1627373100182-03c0e39f7548?auto=format&fit=crop&w=400&q=80', status: 'Wishlist', playtime: 0, rating: 0, releaseDate: '2025' },
    { title: 'Metroid Prime 4: Beyond', platform: 'Switch', coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80', status: 'Wishlist', playtime: 0, rating: 0, releaseDate: '2025' },
    { title: 'Monster Hunter Wilds', platform: 'Steam', coverUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=400&q=80', status: 'Wishlist', playtime: 0, rating: 0, releaseDate: '2025' },
    { title: 'Fable', platform: 'Xbox', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80', status: 'Wishlist', playtime: 0, rating: 0, releaseDate: '2025' },
    { title: 'DOOM: The Dark Ages', platform: 'Steam', coverUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80', status: 'Wishlist', playtime: 0, rating: 0, releaseDate: '2025' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <PageHeader
        title="Wishlist"
        description="Monitor upcoming releases and games you're planning to play next."
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-h)' }}>Tracked Games ({wishlistData.length})</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button disabled style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'not-allowed' }}>Price Alerts</button>
          <button disabled style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'not-allowed' }}>Sort: Release Date</button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '24px'
      }}>
        {wishlistData.map((game, i) => (
          <GameCard key={i} {...game} />
        ))}
      </div>

      {wishlistData.length === 0 && (
        <div style={{
          padding: '80px 40px',
          border: '1px dashed var(--border)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--text)',
          fontSize: '1rem'
        }}>
          Your wishlist is empty. Start discovering games to fill it up!
        </div>
      )}
    </div>
  );
};

export default WishlistView;
