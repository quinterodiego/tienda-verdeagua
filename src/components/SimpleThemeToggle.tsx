'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/lib/theme-store';

interface SimpleThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function SimpleThemeToggle({ className = '', showLabel = false }: SimpleThemeToggleProps) {
  const { theme, isDark, setTheme, isInitialized } = useThemeStore();

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const Icon = isDark ? Sun : Moon;
  const label = isDark ? 'Modo claro' : 'Modo oscuro';

  if (!isInitialized) {
    return (
      <div className={`p-2 ${className}`}>
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 text-gray-600 dark:text-gray-300 
        hover:text-gray-900 dark:hover:text-white 
        hover:bg-gray-100 dark:hover:bg-gray-800
        rounded-lg transition-all duration-300 
        transform hover:scale-105 group
        ${className}
      `}
      title={label}
      aria-label={label}
    >
      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
      {showLabel && (
        <span className="ml-2 text-sm hidden md:inline">
          {label}
        </span>
      )}
    </button>
  );
}
