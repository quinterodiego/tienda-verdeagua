'use client';

import { X } from 'lucide-react';

interface FilterChip {
  label: string;
  value: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  filters: {
    query: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    rating: number;
    inStock: boolean;
  };
  onRemoveFilter: (key: keyof ActiveFiltersProps['filters']) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({ filters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  const activeFilters: FilterChip[] = [];

  if (filters.query) {
    activeFilters.push({
      label: `Búsqueda: "${filters.query}"`,
      value: 'query',
      onRemove: () => onRemoveFilter('query')
    });
  }

  if (filters.category && filters.category !== 'Todos') {
    activeFilters.push({
      label: `Categoría: ${filters.category}`,
      value: 'category',
      onRemove: () => onRemoveFilter('category')
    });
  }

  if (filters.minPrice > 0) {
    activeFilters.push({
      label: `Precio min: $${filters.minPrice}`,
      value: 'minPrice',
      onRemove: () => onRemoveFilter('minPrice')
    });
  }

  if (filters.maxPrice < 10000) {
    activeFilters.push({
      label: `Precio max: $${filters.maxPrice}`,
      value: 'maxPrice',
      onRemove: () => onRemoveFilter('maxPrice')
    });
  }

  if (filters.rating > 0) {
    activeFilters.push({
      label: `Rating: ${filters.rating}+ estrellas`,
      value: 'rating',
      onRemove: () => onRemoveFilter('rating')
    });
  }

  if (filters.inStock) {
    activeFilters.push({
      label: 'Solo en stock',
      value: 'inStock',
      onRemove: () => onRemoveFilter('inStock')
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <span className="text-sm text-gray-600 mr-2">Filtros activos:</span>
      {activeFilters.map((filter) => (
        <div
          key={filter.value}
          className="inline-flex items-center bg-[#68c3b7]/20 text-[#68c3b7] text-sm px-3 py-1 rounded-full"
        >
          <span className="mr-1">{filter.label}</span>
          <button
            onClick={filter.onRemove}
            className="ml-1 hover:bg-[#68c3b7]/30 rounded-full p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-800 underline ml-2"
        >
          Limpiar todos
        </button>
      )}
    </div>
  );
}
