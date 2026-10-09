import { useEffect, useState } from 'react';
import AppShell from './components/AppShell';
import DashboardView from './views/DashboardView';
import DiscoverView from './views/DiscoverView';
import LibraryView from './views/LibraryView';
import WishlistView from './views/WishlistView';
import { CollectionProvider } from './contexts/CollectionContext.jsx';

const VALID_TABS = ['dashboard', 'discover', 'library', 'wishlist'];

function getTabFromHash() {
  const tab = window.location.hash.slice(1);
  return VALID_TABS.includes(tab) ? tab : 'dashboard';
}

function App() {
  const [activeTab, setActiveTabState] = useState(getTabFromHash);

  // Keep the visible tab in sync when users use browser Back/Forward.
  useEffect(() => {
    const syncActiveTab = () => setActiveTabState(getTabFromHash());

    window.addEventListener('hashchange', syncActiveTab);
    return () => window.removeEventListener('hashchange', syncActiveTab);
  }, []);

  // The URL hash preserves the selected view across refreshes without
  // requiring a routing library or server rewrite configuration.
  const setActiveTab = (tab) => {
    if (!VALID_TABS.includes(tab)) return;

    const nextHash = `#${tab}`;
    if (window.location.hash === nextHash) {
      setActiveTabState(tab);
    } else {
      window.location.hash = tab;
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoverView />;
      case 'library':
        return <LibraryView />;
      case 'wishlist':
        return <WishlistView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <CollectionProvider>
      <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderActiveView()}
      </AppShell>
    </CollectionProvider>
  );
}

export default App;
