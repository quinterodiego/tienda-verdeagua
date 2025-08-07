'use client';

import { useThemeStore, colorSchemes } from '@/lib/theme-store';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeIndicatorProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeIndicator({ showLabel = false, className = '' }: ThemeIndicatorProps) {
  const { theme, colorScheme, isDark } = useThemeStore();
  
  const themeIcons = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
  };

  const Icon = themeIcons[theme];
  const colors = colorSchemes[colorScheme];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <Icon className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-gray-600'}`} />
        {showLabel && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {theme === 'auto' ? 'Auto' : isDark ? 'Oscuro' : 'Claro'}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <div 
          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: colors.primary }}
          title={colors.name}
        />
        {showLabel && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {colors.name}
          </span>
        )}
      </div>
    </div>
  );
}
