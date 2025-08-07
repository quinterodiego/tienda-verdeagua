'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme-store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, isDark, isInitialized, setIsDark, initialize } = useThemeStore();

  // Inicializar el tema al cargar
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Manejar cambios de tema del sistema
  useEffect(() => {
    if (!isInitialized) return;
    
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
      };

      setIsDark(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, setIsDark, isInitialized]);

  // Aplicar clases al documento (redundante pero asegura que se aplique)
  useEffect(() => {
    if (!isInitialized) return;
    
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDark, isInitialized]);

  return (
    <>
      {children}
    </>
  );
}
