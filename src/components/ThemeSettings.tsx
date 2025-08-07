'use client';

import { useState } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Type, 
  Zap, 
  Layout, 
  Eye, 
  Play, 
  Volume2,
  RotateCcw,
  X,
  Check
} from 'lucide-react';
import { useThemeStore, colorSchemes, ColorScheme, Theme } from '@/lib/theme-store';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeSettings({ isOpen, onClose }: ThemeSettingsProps) {
  const {
    theme,
    colorScheme,
    fontSize,
    animations,
    compactMode,
    showPrices,
    autoplay,
    soundEffects,
    setTheme,
    setColorScheme,
    setFontSize,
    toggleAnimations,
    toggleCompactMode,
    toggleShowPrices,
    toggleAutoplay,
    toggleSoundEffects,
    resetToDefaults,
  } = useThemeStore();

  const [activeSection, setActiveSection] = useState<string>('appearance');

  if (!isOpen) return null;

  const sections = [
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'layout', label: 'Diseño', icon: Layout },
    { id: 'accessibility', label: 'Accesibilidad', icon: Eye },
    { id: 'behavior', label: 'Comportamiento', icon: Settings },
  ];

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'auto', label: 'Automático', icon: Monitor },
  ];

  const fontSizeOptions = [
    { value: 'small' as const, label: 'Pequeño', preview: 'Aa' },
    { value: 'medium' as const, label: 'Mediano', preview: 'Aa' },
    { value: 'large' as const, label: 'Grande', preview: 'Aa' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configuración de Tema
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex h-96">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Reset Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Restablecer</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                {/* Tema */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Tema
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            theme === option.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Esquema de colores */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Esquema de colores
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(colorSchemes).map(([key, colors]) => (
                      <button
                        key={key}
                        onClick={() => setColorScheme(key as ColorScheme)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          colorScheme === key
                            ? 'border-gray-900 dark:border-white'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div 
                          className="w-full h-8 rounded mb-2"
                          style={{ backgroundColor: colors.primary }}
                        />
                        <div className="text-xs font-medium text-gray-900 dark:text-white">
                          {colors.name}
                        </div>
                        {colorScheme === key && (
                          <Check className="w-4 h-4 mx-auto mt-1 text-gray-900 dark:text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'layout' && (
              <div className="space-y-6">
                {/* Tamaño de fuente */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Tamaño de fuente
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {fontSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFontSize(option.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          fontSize === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className={`font-bold mb-2 ${
                          option.value === 'small' ? 'text-sm' : 
                          option.value === 'medium' ? 'text-base' : 'text-lg'
                        }`}>
                          {option.preview}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modo compacto */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Layout className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Modo compacto
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Reduce el espaciado para mostrar más contenido
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleCompactMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      compactMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        compactMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'accessibility' && (
              <div className="space-y-6">
                {/* Mostrar precios */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Mostrar precios
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Ocultar precios en la navegación
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleShowPrices}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showPrices ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showPrices ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'behavior' && (
              <div className="space-y-6">
                {/* Animaciones */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Animaciones
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Habilitar animaciones y transiciones
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      animations ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        animations ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Autoplay */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Play className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Reproducción automática
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Avanzar automáticamente en carruseles
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleAutoplay}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoplay ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoplay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Efectos de sonido */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Efectos de sonido
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Reproducir sonidos en interacciones
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleSoundEffects}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      soundEffects ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        soundEffects ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
