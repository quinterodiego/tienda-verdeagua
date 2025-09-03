'use client';

import { useThemeStore } from '@/lib/theme-store';
import { SunIcon as Sun, MoonIcon as Moon, ComputerDesktopIcon as Monitor } from '@/components/HeroIcons';

interface ThemeIndicatorProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeIndicator({ showLabel = false, className = '' }: ThemeIndicatorProps) {
  const { theme, isDark } = useThemeStore();
  
  const themeIcons = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
  };

  const Icon = themeIcons[theme];

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
    </div>
  );
}
