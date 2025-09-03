import { Metadata } from 'next';

// Configuración base del sitio
export const siteConfig = {
  name: 'Verde Agua Personalizados',
  description: 'Tienda online de productos personalizados: agendas, tazas, llaveros, stickers, cuadernos y más. Dale tu toque personal a tus estudios con Verde Agua Personalizados.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://verdeaguapersonalizados.com',
  ogImage: '/og-image.jpg',
  creator: 'Verde Agua Personalizados',
  keywords: [
    'productos personalizados',
    'agendas personalizadas',
    'tazas personalizadas',
    'llaveros personalizados',
    'stickers personalizados',
    'cuadernos personalizados',
    'regalos personalizados',
    'verde agua',
    'personalización',
    'estudios',
    'oficina',
    'regalo único'
  ],
  categories: [
    'Agendas',
    'Tazas',
    'Llaveros', 
    'Stickers',
    'Cuadernos',
    'Libretas',
    'Accesorios',
    'Regalos'
  ]
};

// Interfaz para metadata personalizada
export interface CustomMetadata {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  price?: number;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  category?: string;
  brand?: string;
  canonical?: string;
}

// Función para generar metadata completa
export function generateMetadata({
  title,
  description,
  image,
  keywords,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  price,
  currency = 'ARS',
  availability = 'in_stock',
  category,
  brand = siteConfig.creator,
  canonical
}: CustomMetadata = {}): Metadata {
  
  const metaTitle = title 
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name;
    
  const metaDescription = description || siteConfig.description;
  const metaImage = image || `${siteConfig.url}${siteConfig.ogImage}`;
  const metaKeywords = keywords 
    ? [...siteConfig.keywords, ...keywords]
    : siteConfig.keywords;
  
  const metaUrl = canonical || siteConfig.url;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords.join(', '),
    authors: [{ name: author || siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    
    // Open Graph
    openGraph: {
      type: type === 'product' ? 'website' : type,
      locale: 'es_AR',
      url: metaUrl,
      siteName: siteConfig.name,
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
          type: 'image/jpeg',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@verdeaguapersonalizados',
      site: '@verdeaguapersonalizados',
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verificaciones
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },
    
    // Canonical
    ...(canonical && { 
      alternates: {
        canonical: canonical
      }
    }),
    
    // Rich snippets adicionales para productos
    ...(type === 'product' && price && {
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': currency,
        'product:availability': availability,
        ...(category && { 'product:category': category }),
        'product:brand': brand,
      }
    }),
  };
}

// Metadata específica para páginas principales
export const homeMetadata = generateMetadata({
  title: 'Inicio',
  description: 'Descubre nuestra colección única de productos personalizados. Agendas, tazas, llaveros y más para dar tu toque personal a cada momento.',
  keywords: ['tienda online', 'productos únicos', 'personalización', 'regalos originales'],
  type: 'website'
});

export const shopMetadata = generateMetadata({
  title: 'Catálogo de Productos',
  description: 'Explora todos nuestros productos personalizados. Encuentra agendas, tazas, llaveros, stickers y cuadernos únicos para cada ocasión.',
  keywords: ['catálogo', 'productos disponibles', 'comprar online'],
  type: 'website'
});

export const contactMetadata = generateMetadata({
  title: 'Contacto',
  description: 'Ponte en contacto con Verde Agua Personalizados. Consultas, pedidos especiales y atención personalizada.',
  keywords: ['contacto', 'consultas', 'pedidos especiales', 'atención al cliente'],
  type: 'website'
});

// Función para metadata de productos
export function generateProductMetadata(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  category: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}) {
  const productImage = product.images?.[0] || product.image;
  
  return generateMetadata({
    title: product.name,
    description: `${product.description} - Precio: $${product.price.toLocaleString('es-AR')}. ${product.stock > 0 ? 'Disponible ahora' : 'Consultar disponibilidad'}.`,
    image: productImage,
    keywords: [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      'personalizado',
      'único',
      'regalo',
      'comprar'
    ],
    type: 'product',
    price: product.price,
    currency: 'ARS',
    availability: product.stock > 0 ? 'in_stock' : 'out_of_stock',
    category: product.category,
    publishedTime: product.createdAt,
    modifiedTime: product.updatedAt,
    canonical: `${siteConfig.url}/producto/${product.id}`
  });
}

// Función para metadata de categorías
export function generateCategoryMetadata(category: string, productCount: number = 0) {
  return generateMetadata({
    title: `${category} Personalizados`,
    description: `Descubre nuestra colección de ${category.toLowerCase()} personalizados. ${productCount > 0 ? `${productCount} productos únicos` : 'Diseños únicos'} para personalizar a tu gusto.`,
    keywords: [
      `${category.toLowerCase()} personalizados`,
      `${category.toLowerCase()} únicos`,
      `comprar ${category.toLowerCase()}`,
      'personalización',
      'regalo'
    ],
    type: 'website',
    canonical: `${siteConfig.url}/categoria/${category.toLowerCase().replace(/\s+/g, '-')}`
  });
}
