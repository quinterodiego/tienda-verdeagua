'use client';

import { lazy, Suspense } from 'react';

// Lazy load de componentes pesados para mejorar performance
export const LazyMercadoPagoCheckout = lazy(() => 
  import('./MercadoPagoCheckout').then(module => ({ default: module.default }))
);

export const LazyOrderDetailModal = lazy(() => 
  import('./OrderDetailModal').then(module => ({ default: module.default }))
);

export const LazyTestCardsHelper = lazy(() => 
  import('./TestCardsHelper').then(module => ({ default: module.default }))
);

export const LazyThemeCustomizer = lazy(() => 
  import('./ThemeCustomizer').then(module => ({ default: module.default }))
);

export const LazyCloudinarySetup = lazy(() => 
  import('./CloudinarySetup').then(module => ({ default: module.default }))
);

// Wrapper con Suspense para facilitar el uso
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 h-32 rounded"></div>}>
      {children}
    </Suspense>
  );
}

// Hook para cargar componentes solo cuando se necesiten
export function useLazyComponent<T>(
  loader: () => Promise<{ default: T }>,
  condition: boolean = true
) {
  const LazyComponent = condition ? lazy(loader) : null;
  return LazyComponent;
}
