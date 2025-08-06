'use client';

import { useEffect, useRef, useState } from 'react';

// Hook para animaciones de entrada al scroll
export function useScrollAnimation(
  threshold: number = 0.1,
  once: boolean = true
) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '50px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once]);

  return { isVisible, elementRef };
}

// Hook para manejar hover states con delays
export function useHoverAnimation(delay: number = 0) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

// Hook para animaciones de ripple effect
export function useRippleEffect() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remover el ripple después de la animación
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return { ripples, createRipple };
}

// Hook para animaciones escalonadas
export function useStaggeredAnimation(
  items: any[],
  baseDelay: number = 100
) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * baseDelay);
    });

    return () => {
      setVisibleItems(new Set());
    };
  }, [items, baseDelay]);

  return visibleItems;
}

// Utilidades de clases CSS para animaciones
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  bounceIn: 'animate-bounce-in',
  slideUp: 'animate-slide-up',
  pulseScale: 'animate-pulse-scale',
  glow: 'animate-glow',
  hoverLift: 'hover-lift',
  hoverScale: 'hover-scale',
} as const;

// Función para generar delays escalonados
export function generateStaggerDelay(index: number, baseDelay: number = 100): React.CSSProperties {
  return {
    animationDelay: `${index * baseDelay}ms`,
  };
}

// Hook para preload de animaciones críticas
export function useAnimationPreload() {
  useEffect(() => {
    // Precargar animaciones críticas en el navegador
    const style = document.createElement('style');
    style.textContent = `
      .preload-animations * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `;
    document.head.appendChild(style);

    // Remover después de que la página esté completamente cargada
    const timer = setTimeout(() => {
      document.head.removeChild(style);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
}
