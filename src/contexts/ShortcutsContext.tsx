'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Shortcut {
  id: string;
  name: string;
  description: string;
  defaultKeys: string;
  currentKeys: string;
  category: string;
}

interface ShortcutsContextType {
  shortcuts: Shortcut[];
  updateShortcut: (id: string, keys: string) => void;
  resetShortcut: (id: string) => void;
  resetAllShortcuts: () => void;
}

const defaultShortcuts: Shortcut[] = [
  {
    id: 'toggleShortcutsDialog',
    name: 'Toggle Shortcuts Dialog',
    description: 'Open or close the keyboard shortcuts dialog',
    defaultKeys: '?',
    currentKeys: '?',
    category: 'General',
  },
  {
    id: 'openProfile',
    name: 'Open Profile',
    description: 'Open the user profile modal',
    defaultKeys: 'ctrl+shift+p',
    currentKeys: 'ctrl+shift+p',
    category: 'Account',
  },
  {
    id: 'setBusy',
    name: 'Set Busy Status',
    description: 'Set your status to busy',
    defaultKeys: 'ctrl+shift+s',
    currentKeys: 'ctrl+shift+s',
    category: 'Status',
  },
  {
    id: 'logout',
    name: 'Log Out',
    description: 'Sign out of your account',
    defaultKeys: 'ctrl+shift+d',
    currentKeys: 'ctrl+shift+d',
    category: 'Account',
  },
  {
    id: 'toggleTheme',
    name: 'Toggle Theme',
    description: 'Switch between light and dark themes',
    defaultKeys: 'ctrl+shift+t',
    currentKeys: 'ctrl+shift+t',
    category: 'Appearance',
  },
];

// Create a default context value for development
const defaultContextValue: ShortcutsContextType = {
  shortcuts: defaultShortcuts,
  updateShortcut: () => {},
  resetShortcut: () => {},
  resetAllShortcuts: () => {},
};

const ShortcutsContext = createContext<ShortcutsContextType>(defaultContextValue);

export const ShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  // Initialize shortcuts from localStorage or defaults
  useEffect(() => {
    // Safely access localStorage (only in browser environment)
    if (typeof window !== 'undefined') {
      try {
        const savedShortcuts = localStorage.getItem('userShortcuts');
        if (savedShortcuts) {
          setShortcuts(JSON.parse(savedShortcuts));
        } else {
          setShortcuts(defaultShortcuts);
        }
      } catch (error) {
        console.error('Failed to load shortcuts from localStorage:', error);
        setShortcuts(defaultShortcuts);
      }
    } else {
      setShortcuts(defaultShortcuts);
    }
  }, []);

  // Save shortcuts to localStorage when they change
  useEffect(() => {
    if (shortcuts.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem('userShortcuts', JSON.stringify(shortcuts));
      } catch (error) {
        console.error('Failed to save shortcuts to localStorage:', error);
      }
    }
  }, [shortcuts]);

  const updateShortcut = (id: string, keys: string) => {
    setShortcuts(prevShortcuts =>
      prevShortcuts.map(shortcut =>
        shortcut.id === id ? { ...shortcut, currentKeys: keys } : shortcut
      )
    );
  };

  const resetShortcut = (id: string) => {
    setShortcuts(prevShortcuts =>
      prevShortcuts.map(shortcut =>
        shortcut.id === id
          ? { ...shortcut, currentKeys: shortcut.defaultKeys }
          : shortcut
      )
    );
  };

  const resetAllShortcuts = () => {
    setShortcuts(prevShortcuts =>
      prevShortcuts.map(shortcut => ({
        ...shortcut,
        currentKeys: shortcut.defaultKeys,
      }))
    );
  };

  return (
    <ShortcutsContext.Provider value={{ shortcuts, updateShortcut, resetShortcut, resetAllShortcuts }}>
      {children}
    </ShortcutsContext.Provider>
  );
};

export const useShortcuts = () => {
  const context = useContext(ShortcutsContext);
  return context;
};
