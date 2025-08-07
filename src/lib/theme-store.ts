'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeStore {
  theme: Theme;
  isDark: boolean;
  isInitialized: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setIsDark: (isDark: boolean) => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'auto',
      isDark: false,
      isInitialized: false,
      
      initialize: () => {
        if (typeof window === 'undefined') return;
        
        const { theme } = get();
        let isDark = false;
        
        if (theme === 'auto') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
          isDark = theme === 'dark';
        }
        
        set({ isDark, isInitialized: true });
        
        // Aplicar inmediatamente al DOM
        const root = document.documentElement;
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
      
      setTheme: (theme: Theme) => {
        set({ theme });
        
        let isDark = false;
        
        // Auto-detectar tema del sistema si se selecciona 'auto'
        if (theme === 'auto' && typeof window !== 'undefined') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
          isDark = theme === 'dark';
        }
        
        set({ isDark });
        
        // Aplicar inmediatamente al DOM
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (isDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },
      
      setIsDark: (isDark: boolean) => {
        set({ isDark });
        
        // Aplicar inmediatamente al DOM
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (isDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },
    }),
    {
      name: 'theme-preferences',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
