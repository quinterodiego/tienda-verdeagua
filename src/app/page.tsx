'use client';

import { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { useSearch } from '@/lib/useSearch';
import { Product } from '@/types';

// Lazy load TODOS los componentes para reducir bundle inicial
const ProductCard = lazy(() => import('@/components/ProductCard'));
const CategoryFilter = lazy(() => import('@/components/CategoryFilter'));
const ActiveFilters = lazy(() => import('@/components/ActiveFilters'));

// Fallback ultra-ligero
const ComponentFallback = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

function HomeContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos desde Google Sheets
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // 🧪 Para testing: permitir simular sin productos SOLO con parámetro muy específico
        const isTestEmpty = searchParams.get('debug') === 'empty-products';
        const apiUrl = isTestEmpty 
          ? '/api/debug/test-empty-products?test=empty'
          : '/api/products';
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        
        console.log('🔍 Respuesta de API:', data);
        
        // La API retorna un objeto con products dentro
        const productsData = data.products || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        
        console.log(`📊 Productos cargados: ${productsData.length}`);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
        // Asegurar que products sea siempre un array
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);
  
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
      // setShowAdvancedFilters(true); // Mostrar filtros cuando hay búsqueda - COMENTADO
    }
  }, [searchParams, updateFilter]);

  // Aplicar filtro de categoría adicional con loading state
  const finalFilteredProducts = useMemo(() => {
    let result;
    if (selectedCategory === 'Todos') {
      result = filteredProducts;
    } else {
      result = filteredProducts.filter(product => product.category === selectedCategory);
    }
    return result;
  }, [filteredProducts, selectedCategory]);

  // Effect para manejar el loading state de filtros
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [filters, selectedCategory]);

  // Early loading state before render
  if (isLoading && products.length === 0) {
    return (
      <div className="bg-gray-50 flex flex-col h-full min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#68c3b7] to-purple-500 text-white flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bienvenidos a Verde Agua Personalizados
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 font-medium">
                Productos personalizados para hacer únicas tus ideas
              </p>
            </div>
          </div>
        </section>

        {/* Loading Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#68c3b7]"></div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col h-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#68c3b7] to-purple-500 text-white flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenidos a Verde Agua Personalizados
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 font-medium">
              Productos personalizados para hacer únicas tus ideas
            </p>
            {/* <p className="text-lg mb-8 opacity-80 font-light">
              Agendas, tazas, llaveros, stickers y más con tu toque personal
            </p> */}
            <p className="text-lg mb-8 opacity-80 font-light">
              Encontrarás todo lo que buscas para tu evento, souvenirs, decoración, invitaciones digitales. También para tu emprendimiento, creación de logos, folletos publicitarios, tarjetas personales y mucho más.
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
      <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nuestros Productos
          </h2>
          <p className="text-lg text-gray-600 font-light">
            Descubre la mejor selección de productos personalizados
          </p>
        </div>

        {/* Loading State - Skeleton Grid */}
        {isLoading && (
          <div className="space-y-8">
            {/* Filtros skeleton */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/4">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <ProductGridSkeleton count={8} />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar productos</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )}

        {/* Content Only When Loaded */}
        {!isLoading && !error && (
          <>
            {/* Si no hay productos en absoluto, mostrar mensaje especial */}
            {products.length === 0 ? (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-4 text-center">
                  <div className="text-yellow-600 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">No hay productos disponibles</h3>
                  <p className="text-yellow-700 mb-4">
                    Actualmente no tenemos productos en nuestro catálogo. Por favor, vuelve más tarde.
                  </p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors w-full"
                    >
                      Recargar página
                    </button>
                    <a 
                      href="/contacto" 
                      className="block bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Contáctanos
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Suspense fallback={<ComponentFallback className="h-16 mx-8 mb-4" />}>
                  <CategoryFilter
                    categories={['Todos', ...new Set(products.map(p => p.category))]}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </Suspense>

                {/* Search Filters */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={filters.query}
                        onChange={(e) => updateFilter('query', e.target.value)}
                        className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                      />
                    </div>
                    {/* <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="text-white bg-gray-400 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      {showAdvancedFilters ? 'Ocultar filtros' : 'Filtros avanzados'}
                    </button> */}
                  </div>

                  {/* {showAdvancedFilters && (
                    <SearchFilters
                      filters={filters}
                      onFilterChange={updateFilter}
                      onClearFilters={clearFilters}
                    />
                  )} */}

                  {/* Active Filters */}
                  <Suspense fallback={<ComponentFallback className="h-8 mb-4" />}>
                    <ActiveFilters
                      filters={filters}
                      onRemoveFilter={removeFilter}
                      onClearAll={clearFilters}
                    />
                  </Suspense>

                  {(filters.query || filters.minPrice > 0 || filters.maxPrice < 10000 || filters.rating > 0 || filters.inStock) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span>Mostrando {finalFilteredProducts.length} de {products.length} productos</span>
                    </div>
                  )}
                </div>

                {/* Grid de productos o skeleton cuando se está filtrando */}
                {isFiltering ? (
                  <ProductGridSkeleton count={6} />
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-stretch">
                      {finalFilteredProducts.map((product, index) => (
                        <Suspense 
                          key={product.id}
                          fallback={<ComponentFallback className="h-80 w-full" />}
                        >
                          <ProductCard 
                            product={product}
                            priority={index < 4} // Prioridad para los primeros 4 productos (primera fila)
                            size="medium"
                          />
                        </Suspense>
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
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 flex flex-col h-full min-h-screen">
        {/* Hero Section Placeholder */}
        <section className="bg-gradient-to-r from-[#68c3b7] to-purple-500 text-white flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Verde Agua Personalizados
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 font-medium">
                Productos personalizados para hacer únicas tus ideas
              </p>
            </div>
          </div>
        </section>
        
        {/* Loading Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#68c3b7]"></div>
        </section>
      </div>
    }>
      <ClientOnly fallback={
        <div className="bg-gray-50 flex flex-col h-full min-h-screen">
          {/* Hero Section Placeholder */}
          <section className="bg-gradient-to-r from-[#68c3b7] to-purple-500 text-white flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Verde Agua Personalizados
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 font-medium">
                  Productos personalizados para hacer únicas tus ideas
                </p>
              </div>
            </div>
          </section>
          
          {/* Loading Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#68c3b7]"></div>
          </section>
        </div>
      }>
        <HomeContent />
      </ClientOnly>
    </Suspense>
  );
}
