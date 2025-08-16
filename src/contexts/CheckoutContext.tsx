'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem } from '@/types';

interface OrderData {
  preferenceId: string;
  items: CartItem[];
  formData: Record<string, string>;
  paymentMethod: string;
  total: number;
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

  // Persistir estado en localStorage solo cuando hay cambios significativos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentStored = localStorage.getItem(STORAGE_KEY);
      const newStateString = JSON.stringify(state);
      
      // Solo guardar si el estado ha cambiado realmente
      if (currentStored !== newStateString) {
        localStorage.setItem(STORAGE_KEY, newStateString);
      }
    }
  }, [state]);

  // Inicializar desde localStorage
  const initializeFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedState = JSON.parse(stored);
          // Solo actualizar si el estado es diferente para evitar bucles infinitos
          setState(prev => {
            const isDifferent = JSON.stringify(prev) !== JSON.stringify(parsedState);
            if (isDifferent) {
              console.log('🔄 Estado de checkout restaurado desde localStorage:', parsedState);
              return parsedState;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error al restaurar estado de checkout:', error);
      }
    }
  }, []);

  // Limpiar estado
  const clearCheckoutState = () => {
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
  };

  const setProcessingPayment = (isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessingPayment: isProcessing }));
  };

  const setPreferenceId = (id: string | null) => {
    setState(prev => ({ ...prev, preferenceId: id }));
  };

  const setRedirectingTo = (platform: 'mercadopago' | null) => {
    setState(prev => ({ ...prev, redirectingTo: platform }));
  };

  const setOrderData = (data: OrderData | null) => {
    setState(prev => ({ ...prev, orderData: data }));
  };

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
