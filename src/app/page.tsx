'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import SearchFilters from '@/components/SearchFilters';
import ActiveFilters from '@/components/ActiveFilters';
import ClientOnly from '@/components/ClientOnly';
import { useSearch } from '@/lib/useSearch';
import { Product } from '@/types';

function HomeContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos desde Google Sheets
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const productsData = await response.json();
        setProducts(productsData);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  const {
    filters,
    updateFilter,
    clearFilters,
    removeFilter,
    filteredProducts
  } = useSearch({ products });

  // Leer query parameters de la URL y aplicar búsqueda
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      updateFilter('query', searchQuery);
      setShowAdvancedFilters(true); // Mostrar filtros cuando hay búsqueda
    }
  }, [searchParams, updateFilter]);

  // Aplicar filtro de categoría adicional
  const finalFilteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return filteredProducts;
    }
    return filteredProducts.filter(product => product.category === selectedCategory);
  }, [filteredProducts, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#68c3b7] to-[#c29fb4] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a Verde Agua Personalizados
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Productos escolares personalizados para hacer únicos tus estudios
            </p>
            <p className="text-lg mb-8 opacity-80">
              Agendas, tazas, llaveros, stickers y más con tu toque personal
            </p>
            <button 
              onClick={() => {
                document.getElementById('productos')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              className="bg-white text-[#68c3b7] px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Ver Productos
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nuestros Productos
          </h2>
          <p className="text-lg text-gray-600">
            Descubre la mejor selección de productos personalizados
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
            <span className="ml-2 text-gray-600">Cargando productos...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar productos</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Only When Loaded */}
        {!isLoading && !error && (
          <>
            <CategoryFilter
              categories={['Todos', ...new Set(products.map(p => p.category))]}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Search Filters */}
            <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              {showAdvancedFilters ? 'Ocultar filtros' : 'Filtros avanzados'}
            </button>
          </div>

          {showAdvancedFilters && (
            <SearchFilters
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
            />
          )}

          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            onRemoveFilter={removeFilter}
            onClearAll={clearFilters}
          />

          {(filters.query || filters.minPrice > 0 || filters.maxPrice < 10000 || filters.rating > 0 || filters.inStock) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span>Mostrando {finalFilteredProducts.length} de {products.length} productos</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {finalFilteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {finalFilteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No se encontraron productos con los filtros aplicados.
            </p>
          </div>
        )}
        </>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <ClientOnly>
      <Suspense fallback={<div>Cargando...</div>}>
        <HomeContent />
      </Suspense>
    </ClientOnly>
  );
}
