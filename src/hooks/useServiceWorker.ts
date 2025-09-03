'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') return;
    
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Verificar actualizaciones
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nueva versión disponible
                    if (confirm('Nueva versión disponible. ¿Actualizar?')) {
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
          });
      });
    }
  }, []);
}

// Web Vitals tracking - Temporalmente deshabilitado
export function useWebVitals() {
  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') return;
    
    // Temporalmente deshabilitado para evitar problemas de build
    // if (process.env.NODE_ENV === 'production') {
    //   // Web vitals tracking implementation
    // }
  }, []);
}
