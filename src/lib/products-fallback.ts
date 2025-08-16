import { Product } from '@/types';
import { products as staticProducts } from '@/data/products';

/**
 * Función para obtener productos con fallback robusto
 * Prioritiza Google Sheets pero usa datos locales como fallback SOLO en errores críticos
 */
export async function getProductsWithFallback(includeInactive = false): Promise<Product[]> {
  try {
    // Intentar obtener de Google Sheets con timeout
    const { getProductsFromSheets } = await import('@/lib/products-sheets');
    
    // Agregar timeout para evitar bloqueos en Vercel
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );
    
    const productsPromise = getProductsFromSheets(includeInactive);
    
    const products = await Promise.race([productsPromise, timeoutPromise]) as Product[];
    
    // CAMBIO IMPORTANTE: Si Google Sheets está disponible pero vacío, respetar eso
    // No usar fallback cuando no hay productos en el sheet
    if (Array.isArray(products)) {
      console.log(`✅ Productos obtenidos de Google Sheets: ${products.length} productos`);
      return products; // Incluye arrays vacíos - eso es correcto
    }
    
    throw new Error('Google Sheets returned invalid data');
    
  } catch (error) {
    console.log('⚠️ Google Sheets no disponible - ERROR CRÍTICO:', error);
    
    // SOLO usar fallback en casos de ERROR CRÍTICO (conexión, timeout, etc.)
    // NO cuando el sheet simplemente está vacío
    
    // Verificar si es un error de conexión real vs sheet vacío
    const isConnectionError = error instanceof Error && (
      error.message.includes('Timeout') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('Network') ||
      error.message.includes('fetch')
    );
    
    if (isConnectionError) {
      console.log('🚨 Error de conexión detectado - usando productos locales como emergencia');
      
      // Fallback a productos estáticos SOLO en errores de conexión
      const mappedProducts: Product[] = staticProducts.map(p => ({ 
        ...p, 
        status: (p.status || 'active') as 'active' | 'inactive' | 'pending' | 'draft'
      }));
      
      // Aplicar el mismo filtrado que en Google Sheets
      const filteredProducts = includeInactive 
        ? mappedProducts
        : mappedProducts.filter(p => p.status === 'active');
      
      console.log(`📊 Usando ${filteredProducts.length} productos locales de emergencia`);
      return filteredProducts;
    } else {
      console.log('📭 Sheet vacío o error menor - retornando array vacío');
      // Si no es error de conexión, probablemente el sheet está vacío
      // Retornar array vacío para mostrar mensaje "No hay productos"
      return [];
    }
  }
}

/**
 * Función específica para obtener un producto por ID
 */
export async function getProductByIdWithFallback(id: string, includeInactive = false): Promise<Product | null> {
  try {
    const products = await getProductsWithFallback(includeInactive);
    return products.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    // Como último recurso, buscar solo en datos locales
    const product = staticProducts.find(p => p.id === id);
    return product || null;
  }
}
