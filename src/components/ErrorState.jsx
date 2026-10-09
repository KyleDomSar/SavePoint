// Error state shown when an API request fails.
// Includes a manual retry button.

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="error-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '64px 24px',
      backgroundColor: 'var(--panel-bg)',
      border: '1px solid #7f1d1d', // Subtle warning red
      borderRadius: '12px',
      textAlign: 'center',
      width: '100%'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        color: '#f87171'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fca5a5', margin: 0 }}>Catalog Error</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', margin: 0, maxWidth: '420px' }}>
          {message || 'Failed to fetch games from the catalog. Please check your connection and try again.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '8px',
            backgroundColor: 'var(--bg)',
            border: '1px solid #7f1d1d',
            color: '#fca5a5',
            padding: '8px 20px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7f1d1d'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg)'; e.currentTarget.style.color = '#fca5a5'; }}
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorState;