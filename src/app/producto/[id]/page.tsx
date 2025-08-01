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

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar producto específico desde Google Sheets
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        
        // La API retorna un objeto con products dentro
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
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
          <span className="ml-2 text-gray-600">Cargando producto...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h1 className="text-xl font-bold text-red-800 mb-2">Error</h1>
            <p className="text-red-700">{error}</p>
            <Link
              href="/"
              className="inline-block mt-4 bg-[#68c3b7] text-white px-6 py-2 rounded-lg hover:bg-[#5aa8a0] transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h1>
          <Link
            href="/"
            className="bg-[#68c3b7] text-white px-6 py-3 rounded-lg hover:bg-[#64b7ac] transition-colors"
          >
            Volver a la tienda
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

  // Usar las imágenes reales del producto si están disponibles
  const productImages = (() => {
    const productWithImages = product as any;
    if (productWithImages.images && Array.isArray(productWithImages.images) && productWithImages.images.length > 0) {
      return productWithImages.images;
    }
    // Fallback: usar solo la imagen individual
    const mainImage = product.image || '/placeholder-image.jpg';
    return [mainImage];
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
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index 
                      ? 'border-[#68c3b7]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} vista ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
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
                {/* COMENTADO - Sin funcionalidad de descuentos
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.price * 1.2)}
                </span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                  -17%
                </span>
                */}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Descripción
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
              
              {/* Información adicional para productos personalizados */}
              {((product as any).medidas || (product as any).color) && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-gray-900">Especificaciones del producto:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Medidas:</span>
                      <span className="ml-2 text-gray-600">
                        {(product as any).medidas || '-'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Color:</span>
                      <span className="ml-2 text-gray-600">
                        {(product as any).color || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Características adicionales */}
              <div className="mt-6 space-y-2">
                <h4 className="font-semibold text-gray-900">Características:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Garantía de 2 años</li>
                  <li>Envío gratuito a toda Colombia</li>
                  <li>Devolución en 30 días</li>
                  <li>Soporte técnico especializado</li>
                </ul>
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                product.stock > 10 ? 'bg-green-500' : 
                product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {product.stock > 10 ? 'En stock' : 
                 product.stock > 0 ? `Solo ${product.stock} disponibles` : 'Agotado'}
              </span>
            </div>

            {/* Selector de cantidad */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-[#68c3b7] hover:bg-[#64b7ac] disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Agregar al carrito - {formatCurrency(product.price * quantity)}</span>
              </button>
              
              <div className="flex space-x-4">
                <button className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Favoritos</span>
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2">
                  <Share className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProducts
              .filter((p: Product) => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct: Product) => (
                <Link
                  key={relatedProduct.id}
                  href={`/producto/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={(relatedProduct as any).images?.[0] || relatedProduct.image || '/placeholder-image.jpg'}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
