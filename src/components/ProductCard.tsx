'use client';

import { Product } from '@/types';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore, useFavoritesStore } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  // Validar y limpiar la URL de la imagen
  const getValidImageUrl = (imageUrl: string) => {
    if (!imageUrl || imageUrl.trim() === '') {
      return '/placeholder-image.jpg'; // Fallback image
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

  const imageUrl = getValidImageUrl(product.image);

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
      <div className="relative aspect-square">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          onError={(e) => {
            // Fallback si la imagen falla al cargar
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.jpg';
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
              ${product.price.toLocaleString()}
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
