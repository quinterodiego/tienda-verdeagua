import { MetadataRoute } from 'next';
import { products } from '@/data/products';

// Función para obtener productos para el sitemap
async function getProducts() {
  try {
    // En build time, usar SIEMPRE los productos estáticos
    if (typeof window === 'undefined') {
      console.log('Using static products for sitemap generation');
      return products;
    }
    
    // Esta parte solo se ejecutaría en runtime (no en build)
    const response = await fetch(`https://verdeaguapersonalizados.com/api/products`, {
      next: { revalidate: 86400 } // Cache por 24 horas
    });
    
    if (!response.ok) {
      return products;
    }
    
    const data = await response.json();
    return data.products || products;
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    // Fallback a productos estáticos
    return products;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  
  // Usar URL fija para el sitemap (evitar problemas con variables de entorno)
  const baseUrl = 'https://verdeaguapersonalizados.com';
  
  console.log(`Generating sitemap with baseUrl: ${baseUrl}`);
  console.log(`Products count: ${products.length}`);
  
  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/favoritos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
  
  // URLs de productos dinámicas - con validación
  const productUrls: MetadataRoute.Sitemap = products
    .filter((product: any) => product && product.id) // Filtrar productos válidos
    .map((product: any) => ({
      url: `${baseUrl}/producto/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  
  // URLs de categorías dinámicas - con validación
  const categories = [...new Set(products
    .map((product: any) => product.category)
    .filter(Boolean) // Filtrar categorías vacías/null/undefined
    .filter((category: string) => category.trim() !== '') // Filtrar categorías vacías
  )];
  
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categoria/${String(category).toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  
  return [...staticUrls, ...productUrls, ...categoryUrls];
}
