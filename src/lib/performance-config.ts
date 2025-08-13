// Performance preset para optimización extrema
export const PERFORMANCE_CONFIG = {
  // Lazy loading agresivo
  LAZY_LOAD_THRESHOLD: 0.1, // Load cuando el elemento está al 10% visible
  LAZY_LOAD_ROOT_MARGIN: '50px', // Preload 50px antes
  
  // Debouncing
  SEARCH_DEBOUNCE: 300,
  FILTER_DEBOUNCE: 200,
  SCROLL_DEBOUNCE: 16, // ~60fps
  
  // Chunks sizes
  MIN_CHUNK_SIZE: 10000,   // 10KB mínimo
  MAX_CHUNK_SIZE: 50000,   // 50KB máximo para chunks individuales
  
  // Image optimization
  IMAGE_QUALITY: 75,
  IMAGE_FORMATS: ['webp', 'avif'],
  
  // Virtual scrolling
  VIRTUAL_ITEM_HEIGHT: 320, // Altura promedio de ProductCard
  VIRTUAL_OVERSCAN: 5,      // Items extra para smooth scrolling
  
  // Cache
  CACHE_TTL: 1000 * 60 * 5, // 5 minutos
  
  // Bundle splitting priorities
  CHUNK_PRIORITIES: {
    react: 50,
    nextjs: 45,
    ui: 40,
    auth: 35,
    vendor: 20,
    common: 10
  }
};

// Utility functions para performance
export const performanceUtils = {
  // Debounce function optimizada
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Intersection Observer para lazy loading
  createLazyObserver: (callback, options = {}) => {
    return new IntersectionObserver(callback, {
      threshold: PERFORMANCE_CONFIG.LAZY_LOAD_THRESHOLD,
      rootMargin: PERFORMANCE_CONFIG.LAZY_LOAD_ROOT_MARGIN,
      ...options
    });
  }
};

export default PERFORMANCE_CONFIG;
