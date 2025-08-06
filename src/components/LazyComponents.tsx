'use client';

import { Suspense, lazy } from 'react';
import { ProductGridSkeleton } from './LoadingSkeletons';

// Lazy load components
const ProductCard = lazy(() => import('./ProductCard'));
const CategoryFilter = lazy(() => import('./CategoryFilter'));
const SearchFilters = lazy(() => import('./SearchFilters'));

// Fallbacks for different components
const ProductCardFallback = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
);

const FiltersFallback = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Wrapper components with Suspense
export const LazyProductCard = (props: any) => (
  <Suspense fallback={<ProductCardFallback />}>
    <ProductCard {...props} />
  </Suspense>
);

export const LazyCategoryFilter = (props: any) => (
  <Suspense fallback={<FiltersFallback />}>
    <CategoryFilter {...props} />
  </Suspense>
);

export const LazySearchFilters = (props: any) => (
  <Suspense fallback={<FiltersFallback />}>
    <SearchFilters {...props} />
  </Suspense>
);

// Advanced lazy loader with intersection observer
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazySection({ 
  children, 
  fallback = <ProductGridSkeleton count={4} />,
  rootMargin = '100px',
  threshold = 0.1 
}: LazyComponentProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
