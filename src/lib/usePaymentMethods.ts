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

  const paymentMethods: PaymentMethodConfig[] = [
    {
      id: 'mercadopago',
      name: 'Pago Online',
      description: 'Tarjetas de crédito, débito, transferencias',
      icon: 'credit-card',
      available: settings?.paymentMethods?.mercadopago ?? true,
    },
    {
      id: 'cashOnPickup',
      name: 'Pago al Retirar',
      description: 'Efectivo o transferencia al retirar',
      icon: 'map-pin',
      available: settings?.paymentMethods?.cashOnPickup ?? true,
    },
  ];

  const availablePaymentMethods = paymentMethods.filter(method => method.available);
  const hasAvailablePaymentMethods = availablePaymentMethods.length > 0;

  return {
    paymentMethods,
    availablePaymentMethods,
    hasAvailablePaymentMethods,
    loading,
    // Configuración de costos para mostrar en UI
    shippingCost: settings?.shippingCost ?? 9.99,
    freeShippingThreshold: settings?.freeShippingThreshold ?? 50,
    taxRate: settings?.taxRate ?? 0.1,
    currency: settings?.currency ?? 'ARS',
  };
}
