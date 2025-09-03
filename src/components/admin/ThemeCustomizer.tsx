'use client';

import { useState, useEffect } from 'react';
import { Palette, RotateCcw, Save, Eye } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

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

export default function ThemeCustomizer() {
  const { colors: currentColors, isLoading, applyTheme, resetTheme } = useTheme();
  const [editedColors, setEditedColors] = useState<ThemeColors>(currentColors);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Actualizar colores editados cuando cambian los actuales
  useEffect(() => {
    setEditedColors(currentColors);
  }, [currentColors]);

  // Definición de los campos de color
  const colorFields = [
    {
      key: 'primaryColor' as keyof ThemeColors,
      label: 'Color Primario',
      description: 'Color principal para botones y enlaces',
      example: 'Botones principales, enlaces activos'
    },
    {
      key: 'secondaryColor' as keyof ThemeColors,
      label: 'Color Secundario',
      description: 'Color secundario para acentos',
      example: 'Botones secundarios, badges'
    },
    {
      key: 'accentColor' as keyof ThemeColors,
      label: 'Color de Acento',
      description: 'Color para elementos destacados',
      example: 'Notificaciones, alertas importantes'
    },
    {
      key: 'backgroundColor' as keyof ThemeColors,
      label: 'Color de Fondo',
      description: 'Color de fondo principal',
      example: 'Fondo de la página'
    },
    {
      key: 'textColor' as keyof ThemeColors,
      label: 'Color de Texto',
      description: 'Color principal del texto',
      example: 'Títulos, texto principal'
    },
    {
      key: 'mutedTextColor' as keyof ThemeColors,
      label: 'Color de Texto Secundario',
      description: 'Color para texto menos importante',
      example: 'Subtítulos, descripciones'
    },
    {
      key: 'borderColor' as keyof ThemeColors,
      label: 'Color de Bordes',
      description: 'Color para bordes y líneas',
      example: 'Bordes de inputs, separadores'
    },
    {
      key: 'cardBackgroundColor' as keyof ThemeColors,
      label: 'Color de Fondo de Tarjetas',
      description: 'Color de fondo para tarjetas y paneles',
      example: 'Productos, formularios'
    }
  ];

  // Colores predefinidos populares
  const presetColors = {
    'Verde Agua (Actual)': {
      primaryColor: '#059669',
      secondaryColor: '#0d9488',
      accentColor: '#dc2626',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      mutedTextColor: '#6b7280',
      borderColor: '#e5e7eb',
      cardBackgroundColor: '#f9fafb'
    },
    'Azul Corporativo': {
      primaryColor: '#2563eb',
      secondaryColor: '#0891b2',
      accentColor: '#dc2626',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      mutedTextColor: '#6b7280',
      borderColor: '#e5e7eb',
      cardBackgroundColor: '#f8fafc'
    },
    'Morado Moderno': {
      primaryColor: '#7c3aed',
      secondaryColor: '#a855f7',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      mutedTextColor: '#6b7280',
      borderColor: '#e5e7eb',
      cardBackgroundColor: '#faf5ff'
    },
    'Rosa Elegante': {
      primaryColor: '#ec4899',
      secondaryColor: '#f97316',
      accentColor: '#06b6d4',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      mutedTextColor: '#6b7280',
      borderColor: '#e5e7eb',
      cardBackgroundColor: '#fdf2f8'
    },
    'Modo Oscuro': {
      primaryColor: '#10b981',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b',
      backgroundColor: '#111827',
      textColor: '#f9fafb',
      mutedTextColor: '#9ca3af',
      borderColor: '#374151',
      cardBackgroundColor: '#1f2937'
    }
  };

  const handleColorChange = (field: keyof ThemeColors, value: string) => {
    const newColors = { ...editedColors, [field]: value };
    setEditedColors(newColors);
    
    // Si está en modo preview, aplicar inmediatamente
    if (previewMode) {
      applyTheme(newColors);
    }
  };

  const handlePresetSelect = (preset: ThemeColors) => {
    setEditedColors(preset);
    if (previewMode) {
      applyTheme(preset);
    }
  };

  const handlePreview = () => {
    if (previewMode) {
      // Salir del modo preview - volver a los colores guardados
      applyTheme(currentColors);
      setPreviewMode(false);
    } else {
      // Entrar al modo preview
      applyTheme(editedColors);
      setPreviewMode(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      // Obtener configuración actual
      const currentResponse = await fetch('/api/admin/settings');
      const currentData = await currentResponse.json();
      
      if (!currentData.success) {
        throw new Error('Error obteniendo configuración actual');
      }

      // Actualizar solo el tema
      const updatedSettings = {
        ...currentData.settings,
        theme: editedColors
      };

      // Guardar configuración
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      const data = await response.json();

      if (data.success) {
        applyTheme(editedColors);
        setPreviewMode(false);
        setMessage({ type: 'success', text: 'Tema guardado exitosamente' });
      } else {
        throw new Error(data.error || 'Error guardando tema');
      }
    } catch (error) {
      console.error('Error guardando tema:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error guardando tema' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetTheme();
    setEditedColors(currentColors);
    setPreviewMode(false);
    setMessage({ type: 'success', text: 'Tema restaurado a valores por defecto' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Palette className="h-6 w-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Personalización de Colores</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Personalización de Colores</h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePreview}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              previewMode
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            {previewMode ? 'Salir de Preview' : 'Preview'}
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4 inline mr-2" />
            Resetear
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Presets */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">Temas Predefinidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(presetColors).map(([name, colors]) => (
            <button
              key={name}
              onClick={() => handlePresetSelect(colors)}
              className="p-3 border rounded-lg hover:border-gray-400 transition-colors text-left"
            >
              <div className="font-medium text-sm text-gray-900 mb-2">{name}</div>
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors.primaryColor }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors.secondaryColor }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors.accentColor }}
                />
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: colors.backgroundColor }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor de colores */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Colores Personalizados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colorFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={editedColors[field.key]}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={editedColors[field.key]}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#000000"
                />
              </div>
              <p className="text-xs text-gray-500">{field.description}</p>
              <p className="text-xs text-gray-400">Ejemplo: {field.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview del tema */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">Vista Previa</h3>
        <div className="p-6 border rounded-lg space-y-4" style={{ 
          backgroundColor: editedColors.cardBackgroundColor,
          borderColor: editedColors.borderColor 
        }}>
          <h4 className="text-xl font-bold" style={{ color: editedColors.textColor }}>
            Título de Ejemplo
          </h4>
          <p className="text-sm" style={{ color: editedColors.mutedTextColor }}>
            Este es un texto de ejemplo para mostrar cómo se verían los colores en tu sitio.
          </p>
          <div className="flex space-x-3">
            <button 
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: editedColors.primaryColor }}
            >
              Botón Primario
            </button>
            <button 
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: editedColors.secondaryColor }}
            >
              Botón Secundario
            </button>
            <span 
              className="px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: editedColors.accentColor }}
            >
              Badge
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
