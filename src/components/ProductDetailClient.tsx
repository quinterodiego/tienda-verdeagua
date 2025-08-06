'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { Star, ShoppingCart, ArrowLeft, Plus, Minus, Heart, Share } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Notification from '@/components/Notification';
import { ProductDetailSkeleton } from '@/components/LoadingSkeletons';
import { LoadingButton } from '@/components/LoadingComponents';
import { Product } from '@/types';

interface ProductDetailClientProps {
  initialProduct?: Product;
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Solo cargar desde API si no hay producto inicial
  useEffect(() => {
    if (!initialProduct) {
      const fetchProduct = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/products');
          if (!response.ok) {
            throw new Error('Error al cargar productos');
          }
          const data = await response.json();
          
          const productsData = data.products || [];
          setAllProducts(Array.isArray(productsData) ? productsData : []);
          const foundProduct = productsData.find((p: Product) => p.id === params.id);
          setProduct(foundProduct || null);
        } catch (err) {
          console.error('Error al cargar producto:', err);
          setError(err instanceof Error ? err.message : 'Error al cargar producto');
        } finally {
          setIsLoading(false);
        }
      };

      if (params.id) {
        fetchProduct();
      }
    } else {
      // Si hay producto inicial, cargar productos relacionados
      const fetchRelatedProducts = async () => {
        try {
          const response = await fetch('/api/products');
          if (response.ok) {
            const data = await response.json();
            const productsData = data.products || [];
            setAllProducts(Array.isArray(productsData) ? productsData : []);
          }
        } catch (err) {
          console.error('Error al cargar productos relacionados:', err);
        }
      };
      fetchRelatedProducts();
    }
  }, [params.id, initialProduct]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'El producto que buscas no existe o no está disponible.'}</p>
          <Link 
            href="/" 
            className="bg-[#68c3b7] hover:bg-[#64b7ac] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      // Simular un pequeño delay para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 500));
      addItem(product, quantity);
      setShowNotification(true);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Usar las imágenes reales del producto
  const productImages = (() => {
    // Si el producto tiene un array de imágenes, usarlo
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    // Fallback: usar solo la imagen principal
    if (product.image) {
      return [product.image];
    }
    // Último fallback: placeholder
    return ['/placeholder-image.svg'];
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification
        message={`${product.name} agregado al carrito`}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        type="success"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb y botón de volver */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          
          <nav className="text-sm text-gray-600 hidden sm:block">
            <Link href="/" className="hover:text-gray-900">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4 animate-fade-in">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg group">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-all duration-500 ease-out group-hover:scale-110"
                priority
              />
              
              {/* Indicador de zoom con animación */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                {selectedImage + 1} / {productImages.length}
              </div>
              
              {/* Overlay sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Navegación con flechas si hay múltiples imágenes */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : productImages.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(selectedImage < productImages.length - 1 ? selectedImage + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg rotate-180"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails - Solo mostrar si hay múltiples imágenes */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                      selectedImage === index 
                        ? 'border-[#68c3b7] shadow-xl ring-4 ring-[#68c3b7] ring-opacity-30 scale-105' 
                        : 'border-gray-200 hover:border-[#68c3b7] hover:border-opacity-50'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} vista ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-[#68c3b7] bg-opacity-10 animate-pulse"></div>
                    )}
                    {/* Número de imagen */}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Información adicional de imágenes */}
            {/* {productImages.length > 1 && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {productImages.length} imagen{productImages.length !== 1 ? 'es' : ''} disponible{productImages.length !== 1 ? 's' : ''}
                </p>
              </div>
            )} */}
          </div>

          {/* Información del producto */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Categoría */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <span className="text-sm text-[#68c3b7] font-medium uppercase tracking-wide bg-[#68c3b7] bg-opacity-10 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Rating y reviews */}
            {product.rating && (
              <div className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 transition-all duration-300 hover:scale-125 ${
                        i < Math.floor(product.rating!) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({product.reviews} reseñas)
                </span>
              </div>
            )}

            {/* Precio */}
            <div className="border-t border-b py-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-gray-900 cursor-default">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Información adicional para productos personalizados */}
            {((product as any).medidas || (product as any).color) && (
              <div className="bg-gray-50 p-4 rounded-lg animate-fade-in transform transition-all duration-300 hover:scale-105 hover:shadow-md" style={{ animationDelay: '0.6s' }}>
                <h4 className="font-medium text-gray-900 mb-2">Especificaciones</h4>
                <div className="space-y-1">
                  {(product as any).medidas && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Medidas:</span> {(product as any).medidas}
                    </p>
                  )}
                  {(product as any).color && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Color:</span> {(product as any).color}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center space-x-2 animate-fade-in transform transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.7s' }}>
              <span className="text-sm text-gray-600">Stock disponible:</span>
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
              </span>
            </div>

            {/* Selector de cantidad y botón de compra */}
            {product.stock > 0 && (
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">Cantidad:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <button
                      onClick={decrementQuantity}
                      className="p-3 hover:bg-gray-100 transition-all duration-300 touch-manipulation transform hover:scale-110 disabled:opacity-50 disabled:transform-none"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[60px] text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="p-3 hover:bg-gray-100 transition-all duration-300 touch-manipulation transform hover:scale-110 disabled:opacity-50 disabled:transform-none"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <LoadingButton
                  onClick={handleAddToCart}
                  isLoading={isAddingToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-[#68c3b7] hover:bg-[#64b7ac] text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 text-lg font-medium touch-manipulation transform hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <span>Agregar al carrito</span>
                </LoadingButton>
              </div>
            )}

            {/* Botones adicionales */}
            <div className="flex space-x-4 pt-4 animate-fade-in" style={{ animationDelay: '0.9s' }}>
              {/* <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span>Agregar a favoritos</span>
              </button> */}
              <button className="flex items-center space-x-2 text-gray-600 hover:text-[#68c3b7] transition-all duration-300 transform hover:scale-105 hover:bg-gray-50 px-3 py-2 rounded-lg">
                <Share className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {/* {allProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allProducts
                .filter(p => p.id !== product.id && p.category === product.category)
                .slice(0, 4)
                .map(relatedProduct => (
                  <Link
                    key={relatedProduct.id}
                    href={`/producto/${relatedProduct.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={relatedProduct.images?.[0] || relatedProduct.image || '/placeholder-image.svg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{relatedProduct.name}</h3>
                      <p className="text-lg font-bold text-[#68c3b7]">
                        {formatCurrency(relatedProduct.price)}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
