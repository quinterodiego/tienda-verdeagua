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

    // Preload important images with WebP support
    const preloadImages = (srcs: string[]) => {
      srcs.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'image';
        link.type = 'image/webp';
        document.head.appendChild(link);
      });
    };

    // Preconnect to external domains
    const preconnectDomains = [
      'https://images.unsplash.com',
      'https://picsum.photos',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.mercadopago.com',
      'https://res.cloudinary.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for additional domains
    const dnsPrefetchDomains = [
      'https://www.google-analytics.com',
      'https://fonts.googleapis.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preload hero images and logos
    const criticalImages = [
      '/logo.svg',
      '/hero-bg.jpg',
      '/placeholder-image.svg',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&fm=webp',
    ];

    preloadImages(criticalImages);

    // Preload critical fonts
    const fontPreloads = [
      { href: '/fonts/poppins-400.woff2', type: 'font/woff2' },
      { href: '/fonts/poppins-600.woff2', type: 'font/woff2' }
    ];

    fontPreloads.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font.href;
      link.as = 'font';
      link.type = font.type;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

  }, []);

  return null;
}
