'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AdminColor } from '@/types/colors-motivos';

interface ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  color?: AdminColor | null;
  onSave: (colorData: Omit<AdminColor, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<AdminColor>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function ColorModal({ 
  isOpen, 
  onClose, 
  color, 
  onSave, 
  onUpdate, 
  onDelete 
}: ColorModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    disponible: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (color) {
        // Editando color existente
        setFormData({
          nombre: color.nombre || '',
          disponible: color.disponible ?? true,
        });
      } else {
        // Creando nuevo color
        setFormData({
          nombre: '',
          disponible: true,
        });
      }
      setError('');
    }
  }, [isOpen, color]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.nombre.trim()) {
        setError('El nombre del color es requerido');
        setLoading(false);
        return;
      }

      if (color) {
        // Actualizar color existente
        await onUpdate(color.id, formData);
      } else {
        // Crear nuevo color
        await onSave(formData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar color:', error);
      setError('Error al guardar el color');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!color || !onDelete) return;
    
    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar el color "${color.nombre}"?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await onDelete(color.id);
      onClose();
    } catch (error) {
      console.error('Error al eliminar color:', error);
      setError('Error al eliminar el color');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {color ? 'Editar Color' : 'Nuevo Color'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Color *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              placeholder="Ej: Azul marino, Rojo, Verde agua"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
              className="h-4 w-4 text-[#68c3b7] focus:ring-[#68c3b7] border-gray-300 rounded"
            />
            <label htmlFor="disponible" className="ml-2 block text-sm text-gray-900">
              Color disponible
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <div>
              {color && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Eliminar
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#64b7ac] disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (color ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
