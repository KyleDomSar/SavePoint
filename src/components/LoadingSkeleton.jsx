// Loading skeleton that matches the GameCard 3:4 aspect ratio.
// Respects prefers-reduced-motion for the shimmer animation.

const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '24px'
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            height: '100%'
          }}
        >
          <div style={{
            position: 'relative',
            paddingTop: '135%',
            backgroundColor: '#1b1d26',
            overflow: 'hidden'
          }}>
            <div
              className="skeleton-shimmer"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.12), transparent)',
                backgroundSize: '200% 100%',
                animation: 'skeletonShimmer 1.4s ease-in-out infinite'
              }}
            />
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ height: '14px', width: '70%', backgroundColor: '#1b1d26', borderRadius: '4px' }} />
            <div style={{ height: '10px', width: '40%', backgroundColor: '#1b1d26', borderRadius: '4px' }} />
            <div style={{ height: '1px', width: '100%', backgroundColor: 'var(--border)', marginTop: '4px' }} />
            <div style={{ height: '10px', width: '50%', backgroundColor: '#1b1d26', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .skeleton-shimmer { animation: none !important; }
        }
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;