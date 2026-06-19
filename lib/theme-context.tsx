'use client';
import { createContext, useContext, useEffect, useState } from 'react';
type Theme = 'dark' | 'light';
interface ThemeContextType { theme: Theme; toggle: () => void; }
const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => { const s = localStorage.getItem('chillzone-theme') as Theme | null; if (s) setTheme(s); }, []);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('chillzone-theme', theme); }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
