'use client';

import { 
  SunIcon as Sun, 
  MoonIcon as Moon, 
  ComputerDesktopIcon as Monitor, 
  XMarkIcon as X,
  CheckIcon as Check
} from '@/components/HeroIcons';
import { useThemeStore, type Theme } from '@/lib/theme-store';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeSettings({ isOpen, onClose }: ThemeSettingsProps) {
  const { theme, setTheme, isDark } = useThemeStore();

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configuración de Tema
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Apariencia
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`
                      flex flex-col items-center p-3 rounded-lg border-2 transition-colors
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
                    <span className={`text-sm ${isSelected ? 'text-blue-500 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-500 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tema actual: {isDark ? 'Oscuro' : 'Claro'}
              </span>
              <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-yellow-400'}`}></div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
