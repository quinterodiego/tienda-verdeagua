'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { StarIcon, ShoppingCartIcon, HeartIcon, ImageIcon } from '@/components/HeroIcons';
import { useCartStore, useFavoritesStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { formatCurrency } from '@/lib/currency';
import OptimizedImage from './OptimizedImage';
import Link from 'next/link';

// Función para generar placeholder blur data URL
const generateBlurDataURL = (width: number, height: number): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>`
  ).toString('base64')}`;
};

interface ProductCardProps {
  product: Product;
  priority?: boolean; // Para imágenes que deben cargarse con prioridad
  size?: 'small' | 'medium' | 'large'; // Diferentes tamaños de tarjeta
}

export default function ThemedProductCard({ product, priority = false, size = 'medium' }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [imageError, setImageError] = useState(false);
  
  // Configuración simplificada (valores fijos por ahora)
  const compactMode = false;
  const showPrices = true;
  const animations = true;
  const [imageLoading, setImageLoading] = useState(true);

  // Configuración de tamaños según el prop size
  const sizeConfig = {
    small: { 
      width: 200, 
      height: 200, 
      className: 'w-full h-48',
      sizes: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
    },
    medium: { 
      width: 300, 
      height: 300, 
      className: 'w-full h-full',
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    },
    large: { 
      width: 400, 
      height: 400, 
      className: 'w-full h-full',
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw'
    }
  };

  const config = sizeConfig[size];
  const isFav = isFavorite(product.id);

  // Manejar errores de imagen
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Manejar carga completa de imagen
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Obtener la imagen principal del producto
  const getProductImage = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || '/placeholder-image.svg';
  };

  // Clases dinámicas basadas en el tema
  const cardClasses = `
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-white
    border border-gray-200 dark:border-gray-700
    rounded-lg shadow-md hover:shadow-lg 
    overflow-hidden 
    transition-all duration-500 
    block h-full 
    ${animations ? 'transform hover:-translate-y-1' : ''}
    group
  `.trim();

  const textPrimaryClasses = 'text-gray-900 dark:text-white';
  const textSecondaryClasses = 'text-gray-600 dark:text-gray-300';
  const textMutedClasses = 'text-gray-500 dark:text-gray-400';
  
  const paddingClasses = compactMode ? 'p-3' : 'p-4';
  const spacingClasses = compactMode ? 'space-y-2' : 'space-y-3';

  return (
    <Link
      href={`/producto/${product.id}`}
      className={cardClasses}
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Imagen del producto */}
      <div className={`relative ${compactMode ? 'aspect-square' : 'aspect-[4/3]'} overflow-hidden bg-gray-100 dark:bg-gray-700`}>
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-pulse" />
          </div>
        )}
        
        {!imageError ? (
          <OptimizedImage
            src={getProductImage()}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500 ${animations ? 'group-hover:scale-110' : ''}`}
            sizes={config.sizes}
            priority={priority}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          // Fallback cuando la imagen no se puede cargar
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700">
            <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-2" />
            <p className={`text-sm ${textMutedClasses}`}>Imagen no disponible</p>
          </div>
        )}

        {/* Botón de favoritos */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
            isFav 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-red-500'
          }`}
          title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <HeartIcon className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Información del producto */}
      <div className={`${paddingClasses} flex flex-col h-full`}>
        <div className={`${spacingClasses} flex-grow`}>
          {/* Título */}
          <h3 className={`text-sm sm:text-lg font-semibold ${textPrimaryClasses} mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem] leading-tight`}>
            {product.name}
          </h3>

          {/* Descripción */}
          <p className={`${textSecondaryClasses} text-xs sm:text-sm mb-3 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] flex-grow leading-relaxed`}>
            {product.description}
          </p>

          {/* Información adicional */}
          {((product as any).medidas || (product as any).color) && !compactMode && (
            <div className="space-y-1 mb-3">
              {(product as any).medidas && (
                <p className={`text-xs ${textMutedClasses}`}>
                  <span className="font-medium">Medidas:</span> {(product as any).medidas}
                </p>
              )}
              {(product as any).color && (
                <p className={`text-xs ${textMutedClasses}`}>
                  <span className="font-medium">Color:</span> {(product as any).color}
                </p>
              )}
            </div>
          )}

          {/* Rating */}
          {product.rating && !compactMode && (
            <div className="flex items-center mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating!) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-sm ${textSecondaryClasses} ml-2`}>
                ({product.rating})
              </span>
            </div>
          )}

          {/* Precio */}
          {showPrices && (
            <div className="mb-4">
              <span className={`text-lg sm:text-2xl font-bold ${textPrimaryClasses}`}>
                {formatCurrency(product.price)}
              </span>
              {(product as any).originalPrice && (
                <p className={`text-xs ${textMutedClasses}`}>
                  <span className="line-through mr-2">
                    {formatCurrency((product as any).originalPrice)}
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    -{Math.round((1 - product.price / (product as any).originalPrice) * 100)}%
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Stock */}
          <div className={`text-xs ${textMutedClasses} mb-3`}>
            {product.stock > 0 ? (
              <span className="text-green-600 dark:text-green-400">✓ En stock ({product.stock} disponibles)</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">✗ Sin stock</span>
            )}
          </div>
        </div>

        {/* Botón de agregar al carrito */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (product.stock > 0) {
              addItem(product, 1);
            }
          }}
          disabled={product.stock === 0}
          className={`
            w-full py-2 px-4 rounded-lg font-medium text-sm
            transition-all duration-300
            ${animations ? 'transform hover:scale-105 active:scale-95' : ''}
            ${product.stock > 0 
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white hover:shadow-lg' 
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
          title={product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
        >
          <ShoppingCartIcon className="w-4 h-4 inline mr-2" />
          {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      </div>
    </Link>
  );
}
