const StatCard = ({ title, value, icon, description }) => {
  return (
    <div
      className="stat-card"
      style={{
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        boxShadow: 'var(--shadow)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-border)';
        e.currentTarget.style.boxShadow = 'var(--glow), var(--shadow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          color: 'var(--text)',
          fontSize: '0.875rem',
          fontWeight: '500',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          {title}
        </span>
        {icon && (
          <div style={{
            color: 'var(--accent)',
            opacity: 0.8
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <span style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--text-h)',
          lineHeight: '1.2'
        }}>
          {value}
        </span>
        {description && (
          <span style={{
            color: 'var(--text)',
            fontSize: '0.75rem'
          }}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
