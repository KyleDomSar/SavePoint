// Loading skeleton that matches the GameCard 3:4 aspect ratio.
// Respects prefers-reduced-motion for the shimmer animation.

const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '16px'
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
            backgroundColor: 'var(--panel-hover)',
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
                background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-hover) 12%, transparent), transparent)',
                backgroundSize: '200% 100%',
                animation: 'skeletonShimmer 1.4s ease-in-out infinite'
              }}
            />
          </div>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ height: '14px', width: '70%', backgroundColor: 'var(--panel-hover)', borderRadius: '4px' }} />
            <div style={{ height: '10px', width: '40%', backgroundColor: 'var(--panel-hover)', borderRadius: '4px' }} />
            <div style={{ height: '1px', width: '100%', backgroundColor: 'var(--border)', marginTop: '4px' }} />
            <div style={{ height: '10px', width: '50%', backgroundColor: 'var(--panel-hover)', borderRadius: '4px' }} />
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