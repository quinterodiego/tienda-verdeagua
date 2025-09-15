'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import { Motivo } from '@/types/colors-motivos';
import MotivoModal from './MotivoModal';

interface MotivoModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  motivo?: Motivo;
}

export function MotivosContent() {
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<MotivoModalState>({ isOpen: false, mode: 'create' });

  const loadMotivos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/motivos');
      if (response.ok) {
        const data = await response.json();
        setMotivos(data.motivos || []); // Corregir: usar data.motivos en lugar de data
      }
    } catch (error) {
      console.error('Error loading motivos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMotivos();
  }, []);

  const handleMotivoSaved = () => {
    setModal({ isOpen: false, mode: 'create' });
    loadMotivos();
  };

  const handleMotivoUpdated = () => {
    setModal({ isOpen: false, mode: 'create' });
    loadMotivos();
  };

  const handleMotivoDeleted = () => {
    setModal({ isOpen: false, mode: 'create' });
    loadMotivos();
  };

  const handleSaveMotivo = async (motivoData: any) => {
    try {
      const response = await fetch('/api/admin/motivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(motivoData),
      });
      if (response.ok) {
        handleMotivoSaved();
      }
    } catch (error) {
      console.error('Error saving motivo:', error);
    }
  };

  const handleUpdateMotivo = async (id: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/motivos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (response.ok) {
        handleMotivoUpdated();
      }
    } catch (error) {
      console.error('Error updating motivo:', error);
    }
  };

  const handleDeleteMotivo = async (id: string) => {
    try {
      const response = await fetch('/api/admin/motivos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        handleMotivoDeleted();
      }
    } catch (error) {
      console.error('Error deleting motivo:', error);
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
          <Sparkles className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Motivos</h2>
        </div>
        <button
          onClick={() => setModal({ isOpen: true, mode: 'create' })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Motivo
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Motivos ({motivos.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {motivos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay motivos registrados</p>
            </div>
          ) : (
            motivos.map((motivo) => (
              <div
                key={motivo.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setModal({ isOpen: true, mode: 'edit', motivo })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{motivo.nombre}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          motivo.disponible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {motivo.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {motivo.id}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <MotivoModal
        isOpen={modal.isOpen}
        motivo={modal.mode === 'edit' ? modal.motivo : null}
        onClose={() => setModal({ isOpen: false, mode: 'create' })}
        onSave={handleSaveMotivo}
        onUpdate={handleUpdateMotivo}
        onDelete={handleDeleteMotivo}
      />
    </div>
  );
}
