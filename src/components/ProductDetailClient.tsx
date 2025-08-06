'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { Star, ShoppingCart, ArrowLeft, Plus, Minus, Heart, Share } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Notification from '@/components/Notification';
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#68c3b7] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
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

  const handleAddToCart = () => {
    addItem(product, quantity);
    setShowNotification(true);
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb y botón de volver */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg group">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
              
              {/* Indicador de zoom */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {selectedImage + 1} / {productImages.length}
              </div>
              
              {/* Navegación con flechas si hay múltiples imágenes */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : productImages.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(selectedImage < productImages.length - 1 ? selectedImage + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity rotate-180"
                  >
                    <ArrowLeft className="w-4 h-4" />
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
                    className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-md ${
                      selectedImage === index 
                        ? 'border-[#68c3b7] shadow-lg ring-2 ring-[#68c3b7] ring-opacity-30' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} vista ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-[#68c3b7] bg-opacity-20"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Información adicional de imágenes */}
            {productImages.length > 1 && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {productImages.length} imagen{productImages.length !== 1 ? 'es' : ''} disponible{productImages.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Categoría */}
            <div>
              <span className="text-sm text-[#68c3b7] font-medium uppercase tracking-wide">
                {product.category}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Rating y reviews */}
            {product.rating && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
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
            <div className="border-t border-b py-6">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Información adicional para productos personalizados */}
            {((product as any).medidas || (product as any).color) && (
              <div className="bg-gray-50 p-4 rounded-lg">
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Stock disponible:</span>
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
              </span>
            </div>

            {/* Selector de cantidad y botón de compra */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">Cantidad:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#68c3b7] hover:bg-[#64b7ac] text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors text-lg font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Agregar al carrito</span>
                </button>
              </div>
            )}

            {/* Botones adicionales */}
            <div className="flex space-x-4 pt-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span>Agregar a favoritos</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-[#68c3b7] transition-colors">
                <Share className="w-5 h-5" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {allProducts.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
