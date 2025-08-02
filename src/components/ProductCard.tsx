'use client';

import { Product } from '@/types';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore, useFavoritesStore } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

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

  const imageUrl = getValidImageUrl((product as any).images || product.image);

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
    <Link 
      href={`/producto/${product.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
    >
      <div className="relative aspect-square overflow-hidden">        
        <Image
          src={imageUrl}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si la imagen falla al cargar
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.svg';
          }}
        />
        
        {/* Botón de favoritos */}
        <button
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
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-[#68c3b7] font-medium uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Información adicional para productos personalizados */}
        {((product as any).medidas || (product as any).color) && (
          <div className="mb-3 space-y-1">
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
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
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
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            <p className="text-xs text-gray-500">
              Stock: {product.stock}
            </p>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-[#68c3b7] hover:bg-[#64b7ac] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
