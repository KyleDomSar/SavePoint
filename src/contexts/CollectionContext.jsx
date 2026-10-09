import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'savepoint-collection';

const CollectionContext = createContext(null);

export const CollectionProvider = ({ children }) => {
  const [collection, setCollection] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          setCollection(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load collection:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
      } catch (e) {
        console.error('Failed to persist collection:', e);
      }
    }
  }, [collection, isLoaded]);

  const addGame = useCallback((game, status = 'backlog') => {
    setCollection((prev) => {
      const id = String(game.id);
      return {
        ...prev,
        [id]: { ...game, id, status, addedAt: Date.now() }
      };
    });
  }, []);

  const updateGameStatus = useCallback((id, status) => {
    setCollection((prev) => {
      const stringId = String(id);
      if (!prev[stringId]) return prev;
      return {
        ...prev,
        [stringId]: { ...prev[stringId], status }
      };
    });
  }, []);

  const removeGame = useCallback((id) => {
    setCollection((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      return next;
    });
  }, []);

  const value = {
    collection,
    isLoaded,
    addGame,
    updateGameStatus,
    removeGame,
    // Helper to get array representation
    items: Object.values(collection)
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) throw new Error('useCollection must be used within CollectionProvider');
  return context;
};
