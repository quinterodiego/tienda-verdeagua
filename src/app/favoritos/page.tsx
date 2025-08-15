'use client';

import { useMemo, useState, useEffect } from 'react';
import { HeartIcon as Heart, ShoppingBagIcon as ShoppingBag } from '@/components/HeroIcons';
import ProductCard from '@/components/ProductCard';
import { useFavoritesStore } from '@/lib/store';
import { Product } from '@/types';
import Link from 'next/link';

export default function FavoritosPage() {
  const { favorites, clearFavorites } = useFavoritesStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar productos desde Google Sheets
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
        const productsData = data.products || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const favoriteProducts = useMemo(() => {
    return products.filter(product => favorites.includes(product.id));
  }, [favorites, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
            <span className="ml-2 text-gray-600">Cargando favoritos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No tienes favoritos aún
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Guarda tus productos favoritos para encontrarlos fácilmente más tarde
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[#68c3b7] text-white font-semibold rounded-lg hover:bg-[#64b7ac] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Explorar productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mis Favoritos
            </h1>
            <p className="text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'} en tu lista de favoritos
            </p>
          </div>
          
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Limpiar favoritos
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
