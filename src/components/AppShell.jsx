import { useState, useEffect, useRef } from 'react';
import {
  DashboardIcon,
  DiscoverIcon,
  LibraryIcon,
  WishlistIcon,
  CollapseIcon,
  HamburgerIcon,
  CloseIcon
} from './Icons';

const AppShell = ({ activeTab, setActiveTab, children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'discover', label: 'Discover', icon: <DiscoverIcon /> },
    { id: 'library', label: 'My Library', icon: <LibraryIcon /> },
    { id: 'wishlist', label: 'Wishlist', icon: <WishlistIcon /> },
  ];

  // Handle Mobile Drawer Focus Management
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';

      // Capture focus in the drawer
      const focusableElements = mobileMenuRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // Handle Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        window.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'auto';
      };
    } else {
      // Restore focus to hamburger when closing
      if (hamburgerRef.current) {
        hamburgerRef.current.focus();
      }
    }
  }, [isMobileMenuOpen]);

  // Handle focus trapping in mobile drawer
  const handleTabKey = (e) => {
    if (e.key !== 'Tab' || !mobileMenuRef.current) return;

    const focusableElements = mobileMenuRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { // if shift + tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else { // if tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: isSidebarCollapsed ? '80px' : '260px',
          backgroundColor: 'var(--panel-bg)',
          borderRight: '1px solid var(--border)',
          display: 'none',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40
        }}
        className="desktop-sidebar"
      >
        <style>{`
          @media (min-width: 769px) {
            .desktop-sidebar { display: flex !important; }
            .main-content { margin-left: ${isSidebarCollapsed ? '80px' : '260px'} !important; }
            .mobile-header { display: none !important; }
          }
        `}</style>

        {/* Sidebar Header / Brand */}
        <div style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--glow)'
          }}>
            <svg viewBox="0 0 24 24" fill="white" style={{ width: '20px', height: '20px' }}>
              <path d="M21 7.25a.75.75 0 0 0-1.06 0l-1.2 1.2a.75.75 0 0 1-1.06-1.06l1.2-1.2a.75.75 0 0 0 0-1.06.75.75 0 0 0-1.06 0l-1.2 1.2a.75.75 0 0 1-1.06-1.06l1.2-1.2a.75.75 0 0 0-1.06-1.06L14 4.54a.75.75 0 0 0 0 1.06l1.2 1.2a.75.75 0 0 1-1.06 1.06l-1.2-1.2a.75.75 0 0 0-1.06 0 .75.75 0 0 0 0 1.06l1.2 1.2a.75.75 0 0 1-1.06 1.06l-1.2-1.2a.75.75 0 0 0-1.06 0L9 10.3l-1.12-1.12a2.25 2.25 0 0 0-3.18 0l-1.12 1.12a2.25 2.25 0 0 0 0 3.18l1.12 1.12a2.25 2.25 0 0 0 3.18 0L9 13.48v5.27a2.25 2.25 0 0 0 2.25 2.25h5.5a2.25 2.25 0 0 0 2.25-2.25v-5.27l1.12 1.12a2.25 2.25 0 0 0 3.18 0l1.12-1.12a2.25 2.25 0 0 0 0-3.18L21 7.25Z" />
            </svg>
          </div>
          {!isSidebarCollapsed && (
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-h)', letterSpacing: '-0.03em' }}>SavePoint</span>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isSidebarCollapsed ? item.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                  fontWeight: isActive ? '600' : '500',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = 'var(--text-h)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
              >
                <div style={{ flexShrink: 0 }}>{item.icon}</div>
                {!isSidebarCollapsed && <span>{item.label}</span>}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: '3px',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Collapse Toggler */}
        <div style={{
          padding: isSidebarCollapsed ? '12px' : '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
        }}>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: isSidebarCollapsed ? '40px' : 'auto',
              height: '40px',
              padding: isSidebarCollapsed ? '0' : '0 10px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-focus)';
              e.currentTarget.style.color = 'var(--text-h)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            <CollapseIcon collapsed={isSidebarCollapsed} />
            {!isSidebarCollapsed && <span style={{ fontSize: '0.8rem' }}>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header
        className="mobile-header"
        style={{
          height: '64px',
          width: '100%',
          backgroundColor: 'var(--panel-bg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: 'var(--glow)' }}>
             <svg viewBox="0 0 24 24" fill="white" style={{ width: '16px', height: '16px', margin: '0 auto' }}>
              <path d="M21 7.25a.75.75 0 0 0-1.06 0l-1.2 1.2a.75.75 0 0 1-1.06-1.06l1.2-1.2a.75.75 0 0 0 0-1.06.75.75 0 0 0-1.06 0l-1.2 1.2a.75.75 0 0 1-1.06-1.06l1.2-1.2a.75.75 0 0 0-1.06-1.06L14 4.54a.75.75 0 0 0 0 1.06l1.2 1.2a.75.75 0 0 1-1.06 1.06l-1.2-1.2a.75.75 0 0 0-1.06 0 .75.75 0 0 0 0 1.06l1.2 1.2a.75.75 0 0 1-1.06 1.06l-1.2-1.2a.75.75 0 0 0-1.06 0L9 10.3l-1.12-1.12a2.25 2.25 0 0 0-3.18 0l-1.12 1.12a2.25 2.25 0 0 0 0 3.18l1.12 1.12a2.25 2.25 0 0 0 3.18 0L9 13.48v5.27a2.25 2.25 0 0 0 2.25 2.25h5.5a2.25 2.25 0 0 0 2.25-2.25v-5.27l1.12 1.12a2.25 2.25 0 0 0 3.18 0l1.12-1.12a2.25 2.25 0 0 0 0-3.18L21 7.25Z" />
            </svg>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-h)', letterSpacing: '-0.02em' }}>SavePoint</span>
        </div>
        <button
          ref={hamburgerRef}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Menu"
          aria-expanded={isMobileMenuOpen}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-h)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px'
          }}
        >
          <HamburgerIcon />
        </button>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
          onKeyDown={handleTabKey}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          `}</style>
          <div
            ref={mobileMenuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: 'var(--bg)',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-h)' }}>Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close Menu"
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
              >
                <CloseIcon />
              </button>
            </div>
            <nav style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeTab === item.id ? 'var(--accent-bg)' : 'transparent',
                    color: activeTab === item.id ? 'var(--accent)' : 'var(--text)',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className="main-content"
        aria-hidden={isMobileMenuOpen}
        style={{
          flex: 1,
          padding: '32px',
          maxWidth: '1400px',
          margin: '0 auto',
          marginTop: '64px', // Space for mobile header
          transition: 'margin-left 0.3s ease',
          width: '100%'
        }}
      >
        <style>{`
          @media (min-width: 769px) {
            .main-content { margin-top: 0 !important; padding: 40px !important; }
          }
          @media (max-width: 480px) {
            .main-content { padding: 24px 16px !important; }
          }
        `}</style>
        {children}
      </main>
    </div>
  );
};

export default AppShell;
