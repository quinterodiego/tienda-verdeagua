import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/types';

interface UseSearchProps {
  products: Product[];
}

interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  inStock: boolean;
}

export function useSearch({ products }: UseSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'Todos',
    minPrice: 0,
    maxPrice: 10000,
    rating: 0,
    inStock: false,
  });

  const filteredProducts = useMemo(() => {
    // Validar que products sea un array
    if (!Array.isArray(products)) {
      console.warn('useSearch: products no es un array:', products);
      return [];
    }

    return products.filter(product => {
      // Filtro por búsqueda de texto (más robusto)
      const searchTerm = filters.query.toLowerCase().trim();
      const matchesQuery = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        // Búsqueda por palabras individuales
        searchTerm.split(' ').some(word => 
          product.name.toLowerCase().includes(word) ||
          product.description.toLowerCase().includes(word) ||
          product.category.toLowerCase().includes(word)
        );

      // Filtro por categoría
      const matchesCategory = filters.category === 'Todos' || 
        product.category === filters.category;

      // Filtro por precio
      const matchesPrice = product.price >= filters.minPrice && 
        product.price <= filters.maxPrice;

      // Filtro por rating
      const matchesRating = !product.rating || 
        product.rating >= filters.rating;

      // Filtro por stock
      const matchesStock = !filters.inStock || product.stock > 0;

      return matchesQuery && matchesCategory && matchesPrice && 
             matchesRating && matchesStock;
    });
  }, [products, filters]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: string | number | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      category: 'Todos',
      minPrice: 0,
      maxPrice: 10000,
      rating: 0,
      inStock: false,
    });
  }, []);

  const removeFilter = useCallback((key: keyof SearchFilters) => {
    setFilters(prev => {
      const defaultValues: SearchFilters = {
        query: '',
        category: 'Todos',
        minPrice: 0,
        maxPrice: 10000,
        rating: 0,
        inStock: false,
      };
      
      return {
        ...prev,
        [key]: defaultValues[key]
      };
    });
  }, []);

  return {
    filters,
    filteredProducts,
    updateFilter,
    clearFilters,
    removeFilter,
    resultCount: filteredProducts.length
  };
}
