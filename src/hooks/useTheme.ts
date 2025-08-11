'use client';

import { useState, useEffect } from 'react';

interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  cardBackgroundColor: string;
}

interface ThemeConfig {
  colors: ThemeColors;
  isLoading: boolean;
  applyTheme: (colors: ThemeColors) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeColors = {
  primaryColor: '#68c3b7',      // Verde agua actual del sitio
  secondaryColor: '#0d9488',    // teal-600  
  accentColor: '#dc2626',       // red-600
  backgroundColor: '#ffffff',   // white
  textColor: '#111827',         // gray-900
  mutedTextColor: '#6b7280',    // gray-500
  borderColor: '#e5e7eb',       // gray-200
  cardBackgroundColor: '#f9fafb' // gray-50
};

export function useTheme(): ThemeConfig {
  const [colors, setColors] = useState<ThemeColors>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tema desde el admin
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings?.theme) {
            setColors(data.settings.theme);
            applyThemeToDOM(data.settings.theme);
          } else {
            // Si no hay tema configurado, usar el por defecto
            applyThemeToDOM(defaultTheme);
          }
        }
      } catch (error) {
        console.error('Error cargando tema:', error);
        // En caso de error, usar tema por defecto
        applyThemeToDOM(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Aplicar colores al DOM usando CSS custom properties
  const applyThemeToDOM = (themeColors: ThemeColors) => {
    const root = document.documentElement;
    
    // Aplicar cada color como una custom property
    root.style.setProperty('--color-primary', themeColors.primaryColor);
    root.style.setProperty('--color-secondary', themeColors.secondaryColor);
    root.style.setProperty('--color-accent', themeColors.accentColor);
    root.style.setProperty('--color-background', themeColors.backgroundColor);
    root.style.setProperty('--color-text', themeColors.textColor);
    root.style.setProperty('--color-text-muted', themeColors.mutedTextColor);
    root.style.setProperty('--color-border', themeColors.borderColor);
    root.style.setProperty('--color-card-background', themeColors.cardBackgroundColor);
    
    // También aplicar versiones con opacidad para hover/focus
    root.style.setProperty('--color-primary-hover', addOpacity(themeColors.primaryColor, 0.9));
    root.style.setProperty('--color-primary-light', addOpacity(themeColors.primaryColor, 0.1));
    root.style.setProperty('--color-secondary-hover', addOpacity(themeColors.secondaryColor, 0.9));
    root.style.setProperty('--color-accent-hover', addOpacity(themeColors.accentColor, 0.9));
  };

  // Función para aplicar un nuevo tema
  const applyTheme = (newColors: ThemeColors) => {
    setColors(newColors);
    applyThemeToDOM(newColors);
  };

  // Función para resetear al tema por defecto
  const resetTheme = () => {
    setColors(defaultTheme);
    applyThemeToDOM(defaultTheme);
  };

  return {
    colors,
    isLoading,
    applyTheme,
    resetTheme
  };
}

// Función auxiliar para agregar opacidad a un color hex
function addOpacity(hexColor: string, opacity: number): string {
  // Convertir hex a RGB y agregar opacidad
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Hook específico para obtener solo los colores (más ligero para componentes que solo leen)
export function useThemeColors(): ThemeColors {
  const { colors } = useTheme();
  return colors;
}
