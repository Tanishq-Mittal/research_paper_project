import React, { createContext, useContext, useState, useEffect } from 'react';
import { Paper } from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  description?: string;
}

interface WorkspaceContextType {
  theme: 'dark' | 'light' | 'system';
  setTheme: (t: 'dark' | 'light' | 'system') => void;
  selectedPaperIds: string[];
  toggleSelectPaper: (id: string) => void;
  selectAllPapers: (ids: string[]) => void;
  clearSelectedPapers: () => void;
  isPaperSelected: (id: string) => boolean;
  activePaper: Paper | null;
  setActivePaper: (p: Paper | null) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('scholarpulse_theme') as any) || 'dark';
  });
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [activePaper, setActivePaper] = useState<Paper | null>(null);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
    localStorage.setItem('scholarpulse_theme', theme);
  }, [theme]);

  // Global Ctrl+K hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setTheme = (t: 'dark' | 'light' | 'system') => {
    setThemeState(t);
  };

  const toggleSelectPaper = (id: string) => {
    setSelectedPaperIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const selectAllPapers = (ids: string[]) => {
    setSelectedPaperIds(ids);
  };

  const clearSelectedPapers = () => {
    setSelectedPaperIds([]);
  };

  const isPaperSelected = (id: string) => selectedPaperIds.includes(id);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <WorkspaceContext.Provider
      value={{
        theme,
        setTheme,
        selectedPaperIds,
        toggleSelectPaper,
        selectAllPapers,
        clearSelectedPapers,
        isPaperSelected,
        activePaper,
        setActivePaper,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return ctx;
};
