import { useState } from 'react';
import AppShell from './components/AppShell';
import DashboardView from './views/DashboardView';
import DiscoverView from './views/DiscoverView';
import LibraryView from './views/LibraryView';
import WishlistView from './views/WishlistView';
import { CollectionProvider } from './contexts/CollectionContext.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'discover':
        return <DiscoverView />;
      case 'library':
        return <LibraryView />;
      case 'wishlist':
        return <WishlistView />;
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
