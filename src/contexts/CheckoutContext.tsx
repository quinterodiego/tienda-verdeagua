'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem } from '@/types';

interface OrderData {
  orderId?: string;
  preferenceId: string;
  items: CartItem[];
  total: number;
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  deliveryInfo?: {
    method: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    } | null;
    cost: number;
  };
  formData?: Record<string, string>;
  paymentMethod: string;
}

interface CheckoutState {
  isProcessingPayment: boolean;
  preferenceId: string | null;
  redirectingTo: 'mercadopago' | null;
  orderData: OrderData | null;
}

interface CheckoutContextType extends CheckoutState {
  setProcessingPayment: (isProcessing: boolean) => void;
  setPreferenceId: (id: string | null) => void;
  setRedirectingTo: (platform: 'mercadopago' | null) => void;
  setOrderData: (data: OrderData | null) => void;
  clearCheckoutState: () => void;
  initializeFromStorage: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

interface CheckoutProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'checkout_state';

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const [state, setState] = useState<CheckoutState>({
    isProcessingPayment: false,
    preferenceId: null,
    redirectingTo: null,
    orderData: null,
  });

  // Inicializar desde localStorage
  const initializeFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedState = JSON.parse(stored);
          setState(parsedState);
          console.log('🔄 Estado de checkout restaurado desde localStorage');
        }
      } catch (error) {
        console.error('Error al restaurar estado de checkout:', error);
        // En caso de error, limpiar el localStorage corrupto
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Limpiar estado
  const clearCheckoutState = useCallback(() => {
    setState({
      isProcessingPayment: false,
      preferenceId: null,
      redirectingTo: null,
      orderData: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    console.log('🧹 Estado de checkout limpiado');
  }, []);

  const setProcessingPayment = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessingPayment: isProcessing }));
  }, []);

  const setPreferenceId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, preferenceId: id }));
  }, []);

  const setRedirectingTo = useCallback((platform: 'mercadopago' | null) => {
    setState(prev => ({ ...prev, redirectingTo: platform }));
  }, []);

  const setOrderData = useCallback((data: OrderData | null) => {
    setState(prev => ({ ...prev, orderData: data }));
  }, []);

  // Persistir solo cuando hay datos significativos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSignificantData = state.isProcessingPayment || state.preferenceId || state.orderData || state.redirectingTo;
      
      if (hasSignificantData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [state]);

  const contextValue: CheckoutContextType = {
    ...state,
    setProcessingPayment,
    setPreferenceId,
    setRedirectingTo,
    setOrderData,
    clearCheckoutState,
    initializeFromStorage,
  };

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider');
  }
  return context;
}
