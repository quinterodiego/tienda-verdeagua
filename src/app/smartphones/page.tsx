'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Product } from '@/types';

export default function SmartphonesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        
        // La API retorna un objeto con products dentro
        const allProductsData = data.products || [];
        const allProducts = Array.isArray(allProductsData) ? allProductsData : [];
        
        // Filtrar solo smartphones
        const smartphones = allProducts.filter((product: Product) => 
          product.category.toLowerCase() === 'smartphones'
        );
        
        setProducts(smartphones);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
            <span className="ml-2 text-gray-600">Cargando smartphones...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Link 
              href="/"
              className="inline-flex items-center mt-4 text-[#68c3b7] hover:text-[#5ab3a7]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-[#68c3b7] hover:text-[#5ab3a7] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a todos los productos
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Smartphones Personalizados
          </h1>
          <p className="text-gray-600 mt-2">
            Descubre nuestra colección de fundas y accesorios para smartphones
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Smartphones en preparación
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos preparando nuestra colección de accesorios para smartphones. ¡Pronto tendremos productos disponibles!
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#5ab3a7] transition-colors"
            >
              Ver otros productos
            </Link>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-gray-600 mb-4">
            Podemos personalizar fundas y accesorios para cualquier modelo de smartphone.
          </p>
          <Link 
            href="/contacto"
            className="inline-flex items-center px-4 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#5ab3a7] transition-colors"
          >
            Contactanos para personalización
          </Link>
        </div>
      </div>
    </div>
  );
}
