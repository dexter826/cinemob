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

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'dark',
    storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

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

    const setThemeCallback = useCallback((nextTheme: Theme) => {
        localStorage.setItem(storageKey, nextTheme);
        setTheme(nextTheme);
    }, [storageKey]);

    const value = useMemo(() => ({
        theme,
        setTheme: setThemeCallback,
    }), [theme, setThemeCallback]);

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
