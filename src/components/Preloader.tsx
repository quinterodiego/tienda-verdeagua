'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Preload critical routes
const CRITICAL_ROUTES = [
  '/cart',
  '/checkout',
  '/producto',
];

// Preload popular product routes
const POPULAR_PRODUCTS = ['1', '2', '3', '4', '5'];

export function usePreloader() {
  const router = useRouter();

  useEffect(() => {
    // Preload critical routes after initial load
    const preloadRoutes = () => {
      CRITICAL_ROUTES.forEach(route => {
        router.prefetch(route);
      });

      // Preload popular products
      POPULAR_PRODUCTS.forEach(id => {
        router.prefetch(`/producto/${id}`);
      });
    };

    // Delay preloading to not interfere with initial page load
    const timer = setTimeout(preloadRoutes, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  // Preload on hover
  const preloadOnHover = (href: string) => {
    return {
      onMouseEnter: () => router.prefetch(href),
      onTouchStart: () => router.prefetch(href),
    };
  };

  return { preloadOnHover };
}

// Component to preload resources
export function ResourcePreloader() {
  useEffect(() => {
    // Preload critical CSS
    const preloadCSS = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'style';
      document.head.appendChild(link);
    };

    // Preload important images
    const preloadImages = (srcs: string[]) => {
      srcs.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'image';
        document.head.appendChild(link);
      });
    };

    // Preload hero images and logos
    const criticalImages = [
      '/logo.svg',
      '/hero-bg.jpg',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    ];

    preloadImages(criticalImages);
  }, []);

  return null;
}
