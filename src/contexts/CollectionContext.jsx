import { useCallback, useEffect, useState } from 'react';
import { CollectionContext } from './collectionContext';

const STORAGE_KEY = 'savepoint-collection';
const VALID_STATUSES = ['playing', 'backlog', 'completed', 'wishlist'];


function isValidCollection(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.entries(value).every(([key, game]) => (
    game &&
    typeof game === 'object' &&
    !Array.isArray(game) &&
    game.id !== undefined &&
    game.id !== null &&
    String(game.id) === key &&
    typeof game.title === 'string' &&
    VALID_STATUSES.includes(game.status)
  ));
}

function readStoredCollection() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      return { collection: {}, canPersist: true, storageError: null };
    }

    const parsed = JSON.parse(stored);

    if (!isValidCollection(parsed)) {
      return {
        collection: {},
        canPersist: false,
        storageError: 'The saved collection has an invalid format. It was left untouched so existing data is not overwritten.'
      };
    }

    return { collection: parsed, canPersist: true, storageError: null };
  } catch (error) {
    console.error('SavePoint could not read the local collection:', error);
    return {
      collection: {},
      canPersist: false,
      storageError: 'Browser storage could not be read. Your existing saved data was left untouched.'
    };
  }
}

export const CollectionProvider = ({ children }) => {
  // Read storage during initialization so the empty default never overwrites
  // an unreadable or malformed collection before it has been inspected.
  const [initialStorage] = useState(readStoredCollection);
  const [collection, setCollection] = useState(initialStorage.collection);
  const [canPersist, setCanPersist] = useState(initialStorage.canPersist);
  const [storageError, setStorageError] = useState(initialStorage.storageError);

  useEffect(() => {
    if (!canPersist) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    } catch (error) {
      console.error('SavePoint could not save the local collection:', error);
      // Storage writes can fail synchronously in browsers with blocked or full storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError('Changes are available for this session, but the browser could not save them. Check available storage and browser permissions.');
      // Stop retrying on every render after a quota or storage error.
      setCanPersist(false);
    }
  }, [collection, canPersist]);

  const addGame = useCallback((game, status = 'backlog') => {
    if (!game || game.id === undefined || game.id === null || !VALID_STATUSES.includes(status)) {
      return;
    }

    const id = String(game.id);
    if (!game.title || typeof game.title !== 'string') return;

    const requestedAt = Date.now();

    setCollection((previous) => {
      const existing = previous[id];
      return {
        ...previous,
        [id]: {
          ...(existing || {}),
          ...game,
          id,
          status,
          addedAt: existing?.addedAt ?? requestedAt
        }
      };
    });
  }, []);

  const updateGameStatus = useCallback((id, status) => {
    if (id === undefined || id === null || !VALID_STATUSES.includes(status)) return;

    setCollection((previous) => {
      const stringId = String(id);
      if (!previous[stringId] || previous[stringId].status === status) return previous;

      return {
        ...previous,
        [stringId]: { ...previous[stringId], status }
      };
    });
  }, []);

  const removeGame = useCallback((id) => {
    if (id === undefined || id === null) return;

    setCollection((previous) => {
      const stringId = String(id);
      if (!previous[stringId]) return previous;

      const next = { ...previous };
      delete next[stringId];
      return next;
    });
  }, []);

  const value = {
    collection,
    items: Object.values(collection),
    isLoaded: true,
    storageError,
    addGame,
    updateGameStatus,
    removeGame
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

