// Cache simple para Google Sheets
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

class SheetsCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttlMinutes: number = 5) {
    const ttl = ttlMinutes * 60 * 1000; // Convertir a milisegundos
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Verificar si la entrada ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  // Invalidar todas las entradas que contengan una palabra clave
  invalidateByPattern(pattern: string) {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Instancia global del caché
export const sheetsCache = new SheetsCache();

// Función helper para generar claves de caché
export function generateCacheKey(sheetName: string, operation: string, params?: any): string {
  const baseKey = `${sheetName}_${operation}`;
  if (params) {
    const paramStr = typeof params === 'string' ? params : JSON.stringify(params);
    return `${baseKey}_${Buffer.from(paramStr).toString('base64').slice(0, 20)}`;
  }
  return baseKey;
}

// Decorador para cachear funciones
export function withCache<T extends any[], R>(
  cacheKey: string,
  ttlMinutes: number = 5
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: T): Promise<R> {
      const key = generateCacheKey(cacheKey, propertyName, args);
      
      // Intentar obtener del caché primero
      const cached = sheetsCache.get<R>(key);
      if (cached) {
        console.log(`🎯 Cache HIT para ${key}`);
        return cached;
      }
      
      console.log(`📡 Cache MISS para ${key} - consultando API`);
      try {
        const result = await method.apply(this, args);
        sheetsCache.set(key, result, ttlMinutes);
        return result;
      } catch (error) {
        console.error(`❌ Error en método cacheado ${propertyName}:`, error);
        throw error;
      }
    };
  };
}
