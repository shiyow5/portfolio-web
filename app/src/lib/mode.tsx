import { createContext, useContext, useState, type ReactNode } from 'react';

export type Mode = 'quest' | 'terminal';

const STORAGE_KEY = 'shiyow:mode';

interface ModeContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggle: () => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

/**
 * Holds the site presentation mode — 'quest' (pixel / RPG, default) or
 * 'terminal' (IDE / devstation) — persisted to localStorage so a visitor's
 * choice survives reloads.
 */
function readStoredMode(): Mode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'terminal' || saved === 'quest') return saved;
  } catch {
    // localStorage unavailable (private mode / SSR)
  }
  return 'quest';
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(readStoredMode);

  const setMode = (next: Mode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failures
    }
  };

  const toggle = () => setMode(mode === 'quest' ? 'terminal' : 'quest');

  return <ModeContext.Provider value={{ mode, setMode, toggle }}>{children}</ModeContext.Provider>;
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within a ModeProvider');
  return ctx;
}
