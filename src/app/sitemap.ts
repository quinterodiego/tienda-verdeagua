import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/metadata';

// Función para obtener productos para el sitemap
async function getProducts() {
  try {
    const response = await fetch(`${siteConfig.url}/api/products`, {
      next: { revalidate: 86400 } // Cache por 24 horas
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  
  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteConfig.url}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/favoritos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
  
  // URLs de productos dinámicas
  const productUrls: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${siteConfig.url}/producto/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  // URLs de categorías dinámicas
  const categories = [...new Set(products.map((product: any) => product.category).filter(Boolean))];
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteConfig.url}/categoria/${String(category).toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  
  return [...staticUrls, ...productUrls, ...categoryUrls];
}
