'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Plus, Loader2 } from 'lucide-react';
import { Color } from '@/types/colors-motivos';
import ColorModal from './ColorModal';

interface ColorModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  color?: Color;
}

export function ColorsContent() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ColorModalState>({ isOpen: false, mode: 'create' });

  const loadColors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/colors');
      if (response.ok) {
        const data = await response.json();
        setColors(data.colors || []); // Corregir: usar data.colors en lugar de data
      }
    } catch (error) {
      console.error('Error loading colors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColors();
  }, []);

  const handleColorSaved = () => {
    setModal({ isOpen: false, mode: 'create' });
    loadColors();
  };

  const handleColorUpdated = () => {
    setModal({ isOpen: false, mode: 'create' });
    loadColors();
  };

  const handleColorDeleted = () => {
    setModal({ isOpen: false, mode: 'create' });
    loadColors();
  };

  const handleSaveColor = async (colorData: any) => {
    try {
      const response = await fetch('/api/admin/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colorData),
      });
      if (response.ok) {
        handleColorSaved();
      }
    } catch (error) {
      console.error('Error saving color:', error);
    }
  };

  const handleUpdateColor = async (id: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/colors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (response.ok) {
        handleColorUpdated();
      }
    } catch (error) {
      console.error('Error updating color:', error);
    }
  };

  const handleDeleteColor = async (id: string) => {
    try {
      const response = await fetch('/api/admin/colors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        handleColorDeleted();
      }
    } catch (error) {
      console.error('Error deleting color:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Colores</h2>
        </div>
        <button
          onClick={() => setModal({ isOpen: true, mode: 'create' })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Color
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Colores ({colors.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {colors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay colores registrados</p>
            </div>
          ) : (
            colors.map((color) => (
              <div
                key={color.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setModal({ isOpen: true, mode: 'edit', color })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{color.nombre}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          color.disponible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {color.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {color.id}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ColorModal
        isOpen={modal.isOpen}
        color={modal.mode === 'edit' ? modal.color : null}
        onClose={() => setModal({ isOpen: false, mode: 'create' })}
        onSave={handleSaveColor}
        onUpdate={handleUpdateColor}
        onDelete={handleDeleteColor}
      />
    </div>
  );
}
