import { Product } from '@/types';
import { products as staticProducts } from '@/data/products';

/**
 * Función para obtener productos con fallback robusto
 * Prioritiza Google Sheets pero usa datos locales como fallback
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
    
    if (products && products.length > 0) {
      console.log('✅ Productos obtenidos de Google Sheets');
      return products;
    }
    
    throw new Error('Google Sheets returned empty array');
    
  } catch (error) {
    console.log('⚠️ Google Sheets no disponible, usando datos locales:', error);
    
    // Fallback a productos estáticos
    const mappedProducts: Product[] = staticProducts.map(p => ({ 
      ...p, 
      status: (p.status || 'active') as 'active' | 'inactive' | 'pending' | 'draft'
    }));
    
    // Aplicar el mismo filtrado que en Google Sheets
    const filteredProducts = includeInactive 
      ? mappedProducts
      : mappedProducts.filter(p => p.status === 'active');
    
    console.log(`📊 Usando ${filteredProducts.length} productos locales`);
    return filteredProducts;
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
