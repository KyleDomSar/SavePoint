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
      const existing = previous[stringId];
      if (!existing || existing.status === status) return previous;

      const nextGame = { ...existing, status };
      if (status === 'completed') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        nextGame.completedAt = `${year}-${month}-${day}`;
      }

      return {
        ...previous,
        [stringId]: nextGame
      };
    });
  }, []);

  const updateGameProgress = useCallback((id, progress = {}) => {
    if (id === undefined || id === null || !progress || typeof progress !== 'object') return;

    const rawHours = progress.playtimePlayed;
    const hours = rawHours === '' || rawHours === null || rawHours === undefined
      ? null
      : Number(rawHours);
    if (hours !== null && (!Number.isFinite(hours) || hours < 0 || hours > 100000)) return;

    const rawRating = progress.personalRating;
    const personalRating = rawRating === '' || rawRating === null || rawRating === undefined
      ? null
      : Number(rawRating);
    if (personalRating !== null && (!Number.isInteger(personalRating) || personalRating < 1 || personalRating > 5)) return;

    const personalNotes = typeof progress.personalNotes === 'string'
      ? progress.personalNotes.slice(0, 2000)
      : '';

    setCollection((previous) => {
      const stringId = String(id);
      if (!previous[stringId]) return previous;

      return {
        ...previous,
        [stringId]: {
          ...previous[stringId],
          playtimePlayed: hours === null ? null : Math.round(hours * 10) / 10,
          personalRating,
          personalNotes
        }
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

  const importCollection = useCallback((games) => {
    if (!Array.isArray(games)) {
      return { success: false, message: 'The backup does not contain a valid games list.' };
    }

    if (games.length > 10000) {
      return { success: false, message: 'This backup contains too many games to import safely.' };
    }

    const importedGames = {};
    for (const game of games) {
      if (
        !game ||
        typeof game !== 'object' ||
        Array.isArray(game) ||
        (typeof game.id !== 'string' && typeof game.id !== 'number') ||
        !/^\d+$/.test(String(game.id)) ||
        !game.title ||
        typeof game.title !== 'string' ||
        !VALID_STATUSES.includes(game.status)
      ) {
        return { success: false, message: 'The backup has an invalid game entry. Nothing was imported.' };
      }

      if (
        game.personalRating !== undefined &&
        game.personalRating !== null &&
        (!Number.isInteger(game.personalRating) || game.personalRating < 1 || game.personalRating > 5)
      ) {
        return { success: false, message: `The saved rating for "${game.title}" is invalid. Nothing was imported.` };
      }

      if (
        game.playtimePlayed !== undefined &&
        game.playtimePlayed !== null &&
        (typeof game.playtimePlayed !== 'number' || !Number.isFinite(game.playtimePlayed) || game.playtimePlayed < 0 || game.playtimePlayed > 100000)
      ) {
        return { success: false, message: `The saved playtime for "${game.title}" is invalid. Nothing was imported.` };
      }

      if (game.personalNotes !== undefined && typeof game.personalNotes !== 'string') {
        return { success: false, message: `The saved notes for "${game.title}" are invalid. Nothing was imported.` };
      }

      const id = String(game.id);
      importedGames[id] = {
        ...game,
        id,
        title: game.title.trim(),
        personalNotes: typeof game.personalNotes === 'string' ? game.personalNotes.slice(0, 2000) : ''
      };
      if (!importedGames[id].title) {
        return { success: false, message: 'The backup contains a game with an empty title. Nothing was imported.' };
      }
    }

    const importedIds = Object.keys(importedGames);
    const added = importedIds.filter((id) => !collection[id]).length;
    const updated = importedIds.length - added;

    if (importedIds.length === 0) {
      return { success: true, added: 0, updated: 0, count: 0 };
    }

    setCollection((previous) => {
      const next = { ...previous };
      for (const [id, game] of Object.entries(importedGames)) {
        // Imported records restore their progress fields, while unknown fields
        // already saved locally are preserved by merging the two records.
        next[id] = { ...(previous[id] || {}), ...game, id };
      }
      return next;
    });

    return { success: true, added, updated, count: Object.keys(importedGames).length };
  }, [collection]);

  const value = {
    collection,
    items: Object.values(collection),
    isLoaded: true,
    storageError,
    addGame,
    updateGameStatus,
    updateGameProgress,
    removeGame,
    importCollection
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

