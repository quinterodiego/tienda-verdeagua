'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from './admin-store';

export interface SiteSettings {
  storeName: string;
  contactEmail: string;
  description: string;
  currency: string;
  shippingCost: number;
  freeShippingThreshold: number;
  taxRate: number;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    newUsers: boolean;
  };
  paymentMethods: {
    mercadopago: boolean;
    cashOnPickup: boolean;
  };
  lastUpdated?: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // También actualizar el store local para compatibilidad
  const updateStoreSettings = useAdminStore((state) => state.updateSettings);

  // Cargar configuración desde Google Sheets
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        setSettings(data.settings);
        // Sincronizar con el store local
        updateStoreSettings(data.settings);
      } else {
        throw new Error(data.error || 'Error al cargar configuración');
      }
    } catch (err) {
      console.error('Error cargando configuración:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Fallback al store local si hay error
      const localSettings = useAdminStore.getState().settings;
      setSettings(localSettings);
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración en Google Sheets
  const saveSettings = async (newSettings: SiteSettings) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        // Sincronizar con el store local
        updateStoreSettings(data.settings);
        return { success: true, message: 'Configuración guardada exitosamente' };
      } else {
        throw new Error(data.error || 'Error al guardar configuración');
      }
    } catch (err) {
      console.error('Error guardando configuración:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  // Actualizar configuración localmente (sin guardar aún)
  const updateSettings = (updates: Partial<SiteSettings>) => {
    if (settings) {
      setSettings(prev => ({ ...prev!, ...updates }));
    }
  };

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    error,
    loadSettings,
    saveSettings,
    updateSettings,
  };
}
