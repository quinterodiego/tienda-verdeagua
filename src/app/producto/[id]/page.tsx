import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateProductMetadata } from '@/lib/metadata';
import ProductDetailClient from '@/components/ProductDetailClient';
import { products } from '@/data/products';
import { getProductByIdWithFallback } from '@/lib/products-fallback';

// Función para obtener producto del servidor
async function getProduct(id: string) {
  try {
    // Usar la nueva función con fallback robusto
    const product = await getProductByIdWithFallback(id, false);
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    // Como último recurso, usar datos locales directamente
    const product = products.find(p => p.id === id);
    return product || null;
  }
}

// Generar rutas estáticas para mejor rendimiento en Vercel
export async function generateStaticParams() {
  // Generar rutas para todos los productos locales
  return products.map((product) => ({
    id: product.id,
  }));
}

// Generar metadata dinámica
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  if (!product) {
    return {
      title: 'Producto no encontrado | Verde Agua Personalizados',
      description: 'El producto que buscas no está disponible.',
    };
  }
  
  return generateProductMetadata(product);
}

// Componente servidor
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }
  
  // Structured Data para SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images || [product.image],
    "brand": {
      "@type": "Brand",
      "name": "Verde Agua Personalizados"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "ARS",
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Verde Agua Personalizados"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews || 1
    } : undefined
  };
  
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Componente cliente */}
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
