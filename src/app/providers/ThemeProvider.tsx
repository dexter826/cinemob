import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
};

const VALID_THEMES: Theme[] = ['dark', 'light', 'system'];

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);
    return VALID_THEMES.find((candidate) => candidate === stored) ?? defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme !== 'system') {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemTheme = () => {
      root.classList.remove('light', 'dark');
      root.classList.add(media.matches ? 'dark' : 'light');
    };

    applySystemTheme();
    media.addEventListener('change', applySystemTheme);
    return () => media.removeEventListener('change', applySystemTheme);
  }, [theme]);

  const setThemeCallback = useCallback(
    (nextTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {}
      setTheme(nextTheme);
    },
    [storageKey],
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeCallback,
    }),
    [theme, setThemeCallback],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
