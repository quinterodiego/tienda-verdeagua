'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/currency';
import { FilterIcon, XIcon, StarIcon } from './Icons';

interface SearchFiltersProps {
  filters: {
    query: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    rating: number;
    inStock: boolean;
  };
  onFilterChange: (key: keyof SearchFiltersProps['filters'], value: string | number | boolean) => void;
  onClearFilters: () => void;
  categories?: string[];
}

export default function SearchFilters({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  categories = []
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FilterIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Limpiar filtros
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <XIcon className="w-4 h-4" /> : <FilterIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Categorías */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className="text-gray-600 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de precios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango de precio: {formatCurrency(filters.minPrice)} - {formatCurrency(filters.maxPrice)}
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Precio mínimo</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.minPrice}
                  onChange={(e) => onFilterChange('minPrice', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Precio máximo</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Inputs numéricos como alternativa */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', Number(e.target.value))}
                className="text-gray-600 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="$0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
                className="text-gray-600 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="$10000"
              />
            </div>
          </div>

          {/* Rating mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating mínimo
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFilterChange('rating', rating === filters.rating ? 0 : rating)}
                  className={`p-1 rounded ${
                    rating <= filters.rating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <StarIcon className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Solo en stock */}
        <div className="flex items-center">
          <input
            id="inStock"
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onFilterChange('inStock', e.target.checked)}
            className="h-4 w-4 text-[#68c3b7] focus:ring-[#68c3b7] border-gray-300 rounded"
          />
          <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
            Solo productos en stock
          </label>
        </div>
      </div>
    </div>
  );
}
