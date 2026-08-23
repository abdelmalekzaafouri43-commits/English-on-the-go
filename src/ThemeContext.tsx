import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'sapphire' | 'emerald' | 'violet' | 'ocean' | 'crimson' | 'midnight';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  badgeLabel: string;
  previewColor: string;
  accentClass: string;
  activeBtnClass: string;
  borderAccent: string;
  pillColor: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'sapphire',
    name: 'Sapphire Navy',
    badgeLabel: 'SAPPHIRE',
    previewColor: '#38bdf8',
    accentClass: 'text-sky-400',
    activeBtnClass: 'bg-sky-500 text-slate-950 font-black',
    borderAccent: 'border-sky-500/40',
    pillColor: 'bg-sky-500',
  },
  {
    id: 'ocean',
    name: 'Cobalt Blue',
    badgeLabel: 'COBALT',
    previewColor: '#3b82f6',
    accentClass: 'text-blue-400',
    activeBtnClass: 'bg-blue-500 text-slate-950 font-black',
    borderAccent: 'border-blue-500/40',
    pillColor: 'bg-blue-500',
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    badgeLabel: 'EMERALD',
    previewColor: '#10b981',
    accentClass: 'text-emerald-400',
    activeBtnClass: 'bg-emerald-500 text-slate-950 font-black',
    borderAccent: 'border-emerald-500/40',
    pillColor: 'bg-emerald-500',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    badgeLabel: 'VIOLET',
    previewColor: '#a855f7',
    accentClass: 'text-purple-400',
    activeBtnClass: 'bg-purple-500 text-slate-950 font-black',
    borderAccent: 'border-purple-500/40',
    pillColor: 'bg-purple-500',
  },
  {
    id: 'crimson',
    name: 'Sunset Crimson',
    badgeLabel: 'CRIMSON',
    previewColor: '#f43f5e',
    accentClass: 'text-rose-400',
    activeBtnClass: 'bg-rose-500 text-slate-950 font-black',
    borderAccent: 'border-rose-500/40',
    pillColor: 'bg-rose-500',
  },
  {
    id: 'midnight',
    name: 'OLED Night Mode',
    badgeLabel: 'NIGHT',
    previewColor: '#000000',
    accentClass: 'text-slate-300',
    activeBtnClass: 'bg-slate-200 text-slate-950 font-black',
    borderAccent: 'border-slate-500/40',
    pillColor: 'bg-slate-200',
  },
];

interface ThemeContextValue {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  currentThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'sapphire',
  setTheme: () => {},
  currentThemeConfig: THEMES[0],
});

const STORAGE_KEY = 'zlabs_english_active_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved as ThemeType;
      }
    } catch {
      // ignore
    }
    return 'sapphire';
  });

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  };

  const currentThemeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  useEffect(() => {
    // Set theme attribute on root element
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentThemeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
