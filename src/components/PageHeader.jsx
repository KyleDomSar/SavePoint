const PageHeader = ({ title, description, children }) => {
  return (
    <div className="page-header" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '32px',
      borderBottom: '1px solid var(--border)',
      paddingBottom: '16px',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 className="page-header-title" style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: 'var(--text-h)',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            {title}
          </h1>
          {description && (
            <p className="page-header-description" style={{
              color: 'var(--text)',
              fontSize: '0.875rem',
              margin: '4px 0 0 0'
            }}>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
