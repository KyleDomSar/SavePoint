import { useContext } from 'react';
import { CollectionContext } from './collectionContext';

export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) throw new Error('useCollection must be used within CollectionProvider');
  return context;
}
