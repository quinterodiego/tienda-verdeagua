'use client';

import { useSettings } from './use-settings';

export interface PaymentMethodConfig {
  id: 'mercadopago' | 'cashOnPickup';
  name: string;
  description: string;
  icon: 'credit-card' | 'map-pin';
  available: boolean;
}

export function usePaymentMethods() {
  const { settings, loading } = useSettings();

  console.log('🔍 usePaymentMethods - Settings:', settings);
  console.log('🔍 usePaymentMethods - Loading:', loading);

  // Mientras se carga, no retornar métodos para evitar estado inconsistente
  if (loading) {
    return {
      paymentMethods: [],
      availablePaymentMethods: [],
      hasAvailablePaymentMethods: false,
      loading: true,
      shippingCost: 9.99,
      freeShippingThreshold: 50,
      taxRate: 0.1,
      currency: 'ARS',
    };
  }

  // Una vez cargado, usar la configuración real o valores por defecto si es la primera vez
  const getMercadoPagoAvailable = () => {
    if (!settings) return true; // Primera vez, mostrar por defecto
    return settings.paymentMethods?.mercadopago ?? true;
  };

  const getCashOnPickupAvailable = () => {
    if (!settings) return true; // Primera vez, mostrar por defecto
    return settings.paymentMethods?.cashOnPickup ?? true;
  };

  const paymentMethods: PaymentMethodConfig[] = [
    {
      id: 'mercadopago',
      name: 'Pago Online',
      description: 'Tarjetas de crédito, débito, transferencias',
      icon: 'credit-card',
      available: getMercadoPagoAvailable(),
    },
    {
      id: 'cashOnPickup',
      name: 'Pago al Retirar',
      description: 'Efectivo o transferencia al retirar',
      icon: 'map-pin',
      available: getCashOnPickupAvailable(),
    },
  ];

  const availablePaymentMethods = paymentMethods.filter(method => method.available);
  const hasAvailablePaymentMethods = availablePaymentMethods.length > 0;

  console.log('🔍 usePaymentMethods - Payment methods config:', {
    mercadopago: settings?.paymentMethods?.mercadopago,
    cashOnPickup: settings?.paymentMethods?.cashOnPickup
  });
  console.log('🔍 usePaymentMethods - Available methods:', availablePaymentMethods.map(m => m.id));

  return {
    paymentMethods,
    availablePaymentMethods,
    hasAvailablePaymentMethods,
    loading: false,
    // Configuración de costos para mostrar en UI
    shippingCost: settings?.shippingCost ?? 9.99,
    freeShippingThreshold: settings?.freeShippingThreshold ?? 50,
    taxRate: settings?.taxRate ?? 0.1,
    currency: settings?.currency ?? 'ARS',
  };
}
