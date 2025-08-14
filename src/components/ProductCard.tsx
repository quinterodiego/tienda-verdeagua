'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { StarIcon, ShoppingCartIcon, HeartIcon, ImageIcon } from './Icons';
import { useCartStore, useFavoritesStore } from '@/lib/store';
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

export default function ProductCard({ product, priority = false, size = 'medium' }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [imageError, setImageError] = useState(false);
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
      className: 'w-full h-80',
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw'
    }
  };
  
  const currentSize = sizeConfig[size];

  // Validar y limpiar la URL de la imagen
  const getValidImageUrl = (imageOrImages: string | string[]) => {
    let imageUrl: string;
    
    // Si es un array, tomar la primera imagen
    if (Array.isArray(imageOrImages)) {
      imageUrl = imageOrImages.length > 0 ? imageOrImages[0] : '';
    } else {
      imageUrl = imageOrImages || '';
    }
    
    if (!imageUrl || imageUrl.trim() === '') {
      return '/placeholder-image.svg'; // Fallback image
    }
    
    // Si es una URL completa válida, usarla tal como está
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch {
      // Si no es una URL válida, asumir que es una ruta relativa
      return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    }
  };

  const imageUrl = getValidImageUrl(product.images || product.image);

  // Handlers para el manejo de imágenes
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación cuando se hace clic en el botón
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 block h-full transform hover:-translate-y-1 group">
      <Link href={`/producto/${product.id}`} className="block h-full w-full">
        <div className="flex flex-col h-full w-full">
        <div className="relative aspect-square overflow-hidden">
          {/* Indicador de carga */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
          )}
          
          {/* Componente OptimizedImage */}
          <OptimizedImage
            src={imageError ? '/placeholder-image.svg' : imageUrl}
            alt={product.name}
            width={currentSize.width}
            height={currentSize.height}
            className={`${currentSize.className} object-cover transition-transform duration-700 group-hover:scale-105`}
            sizes={currentSize.sizes}
            priority={priority}
            quality={85}
            transformation="card"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {/* Overlay de error si la imagen falla */}
          {imageError && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Imagen no disponible</p>
              </div>
            </div>
          )}
          
          {/* Botón de favoritos */}
          {/* <button
            onClick={handleToggleFavorite}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              isFavorite(product.id)
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart 
              className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} 
            />
          </button> */}
        </div>
        
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <div className="mb-2">
            <span className="text-xs text-[#68c3b7] font-medium uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem] leading-tight">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] flex-grow leading-relaxed">
            {product.description}
          </p>

          {/* Información adicional para productos personalizados */}
          {/* <div className="mb-3 min-h-[1rem]">
            {((product as any).medidas || (product as any).color) && (
              <div className="space-y-1">
                {(product as any).medidas && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Medidas:</span> {(product as any).medidas}
                  </p>
                )}
                {(product as any).color && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Color:</span> {(product as any).color}
                  </p>
                )}
              </div>
            )}
          </div> */}
          
          {/* Rating */}
          {/* <div className="mb-3 min-h-[1.5rem]">
            {product.rating && (
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating!) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  ({product.reviews})
                </span>
              </div>
            )}
          </div> */}
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex-1 transition-transform duration-500 group-hover:scale-[1.01]">
              <span className="text-lg sm:text-2xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              <p className="text-xs text-gray-500">
                {product.stock > 0 ? (
                  `Stock: ${product.stock}`
                ) : (
                  <span className="text-red-400">Agotado</span>
                )}
              </p>
            </div>
            
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`${
                  product.stock === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#68c3b7] hover:bg-[#64b7ac] transform hover:scale-105 hover:shadow-md active:scale-95'
                } text-white px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-all duration-500 text-sm touch-manipulation w-[70px] sm:w-[100px] h-[40px]`}
              >
                <ShoppingCartIcon className={`w-4 h-4 ${product.stock > 0 ? 'transition-transform duration-500 hover:rotate-6' : ''}`} />
                <span className="hidden sm:inline">Agregar</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </Link>
    </div>
  );
}
