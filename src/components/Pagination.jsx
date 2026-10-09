// Page navigation component.
//
// Renders a compact pagination bar with first/previous/next/last buttons
// and a window of surrounding pages when the total page count is known.
// Falls back to a "Load More" button when the total page count is unknown
// but a next page is available.

const Pagination = ({ page, totalPages, hasNext, onPageChange }) => {
  // If we only have 1 page and no more coming, don't show pagination.
  if (totalPages <= 1 && !hasNext) return null;

  // Full pagination bar (First, Previous, [Surrounding Pages], Next, Last)
  if (totalPages && totalPages > 1) {
    const windowSize = 2; // Show 2 pages on each side of the current page
    const start = Math.max(1, page - windowSize);
    const end = Math.min(totalPages, page + windowSize);
    const pageNumbers = [];
    for (let i = start; i <= end; i++) pageNumbers.push(i);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0 16px', width: '100%' }}>
        <div className="pagination-controls" style={{
          display: 'flex',
          gap: '4px',
          padding: '8px',
          backgroundColor: 'var(--panel-bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          alignItems: 'center',
          boxShadow: 'var(--shadow)'
        }}>
          {/* First and Previous */}
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onPageChange(1)}
            aria-label="First page"
            style={pageButtonStyle(page === 1)}
          >
            «
          </button>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            style={pageButtonStyle(page === 1)}
          >
            ‹
          </button>

          {/* Start Ellipsis */}
          {start > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                style={pageButtonStyle(false)}
              >
                1
              </button>
              {start > 2 && <span style={{ color: 'var(--text)', padding: '0 4px' }}>…</span>}
            </>
          )}

          {/* Page Numbered Buttons */}
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
              style={p === page ? activePageButtonStyle() : pageButtonStyle(false)}
            >
              {p}
            </button>
          ))}

          {/* End Ellipsis */}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span style={{ color: 'var(--text)', padding: '0 4px' }}>…</span>}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                style={pageButtonStyle(false)}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next and Last */}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            style={pageButtonStyle(page === totalPages)}
          >
            ›
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="Last page"
            style={pageButtonStyle(page === totalPages)}
          >
            »
          </button>
        </div>
      </div>
    );
  }

  // Load More Fallback (used when totalPages is not known but hasNext is true)
  if (hasNext) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0 16px', width: '100%' }}>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          style={{
            backgroundColor: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)',
            padding: '10px 24px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.25)';
            e.currentTarget.style.boxShadow = 'var(--glow), var(--shadow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
            e.currentTarget.style.boxShadow = 'var(--shadow)';
          }}
        >
          Load more results
        </button>
      </div>
    );
  }

  return null;
};

const pageButtonStyle = (disabled) => ({
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  backgroundColor: disabled ? 'transparent' : 'var(--bg)',
  color: disabled ? 'var(--border)' : 'var(--text)',
  border: '1px solid var(--border)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  fontSize: '0.875rem',
  fontWeight: '600',
  transition: 'all 0.15s ease'
});

const activePageButtonStyle = () => ({
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  backgroundColor: 'var(--accent)',
  color: 'var(--text-h)',
  border: '1px solid var(--accent)',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '0.875rem',
  boxShadow: 'var(--glow)'
});

export default Pagination;
