import { useEffect, useState } from 'react';

export function useSyncedNote(key: string = 'cortex-quick-note') {
  const [note, setNote] = useState(() => localStorage.getItem(key) || '');

  // Save note to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(key, note);
    }, 300);
    return () => clearTimeout(timeout);
  }, [note, key]);

  // Listen for updates from other tabs/components
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== note) {
        setNote(e.newValue || '');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [note, key]);

  const clearNote = () => {
    setNote('');
    localStorage.removeItem(key);
  };

  return { note, setNote, clearNote };
}