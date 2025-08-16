'use client';

import { useCartStore } from '@/lib/store';
import { useCheckoutContext } from '@/contexts/CheckoutContext';
import { useStockCheck } from '@/lib/useStockCheck';
import { formatCurrency } from '@/lib/currency';
import { MinusIcon as Minus, PlusIcon as Plus, XMarkIcon as X, ExclamationTriangleIcon as AlertTriangle, ArrowPathIcon as RefreshCw } from '@/components/HeroIcons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isProcessingPayment, redirectingTo, orderData, initializeFromStorage, clearCheckoutState } = useCheckoutContext();
  const { stockChecks, allSufficient, loading: stockLoading, error: stockError, refreshStock } = useStockCheck(items);

  // Crear un mapa de stock para fácil acceso
  const stockMap = new Map(stockChecks.map(check => [check.productId, check]));

  // Inicializar estado de checkout al cargar la página
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  // Limpiar estado de checkout si el usuario interactúa con el carrito
  // (borra productos, cambia cantidades, etc.) y no está en un proceso activo
  useEffect(() => {
    // Si no hay items en el carrito y no estamos en un proceso de pago activo,
    // limpiar el estado de checkout para evitar mostrar pantallas incorrectas
    if (items.length === 0 && !window.location.pathname.includes('/checkout')) {
      // Solo limpiar si han pasado más de 5 segundos desde la última actividad de pago
      const lastPaymentActivity = localStorage.getItem('lastPaymentActivity');
      const now = Date.now();
      
      if (!lastPaymentActivity || (now - parseInt(lastPaymentActivity)) > 5000) {
        clearCheckoutState();
      }
    }
  }, [items.length, clearCheckoutState]);

  // Si hay un proceso de pago ACTIVO en curso y el carrito está "vacío"
  // Solo mostrar si estamos en un proceso de redirección activa
  if (items.length === 0 && isProcessingPayment && orderData && redirectingTo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-6"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {redirectingTo === 'mercadopago' ? 'Redirigiendo a MercadoPago...' : 'Procesando tu pago...'}
            </h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
              {redirectingTo === 'mercadopago' 
                ? 'Te estamos llevando a la plataforma de pago segura. No cierres esta ventana.'
                : 'Estamos preparando tu orden para el pago. Este proceso puede tomar unos segundos.'
              }
            </p>
            
            {/* Mostrar resumen de la orden */}
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de tu orden</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Productos:</span>
                  <span>{orderData.items.length}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(orderData.total)}</span>
                </div>
              </div>
            </div>

            {/* Botón de cancelar (en caso de que algo falle) */}
            <button
              onClick={() => {
                // Restaurar carrito desde orderData
                clearCart();
                orderData.items.forEach(item => {
                  useCartStore.getState().addItem(item.product, item.quantity);
                });
                clearCheckoutState();
              }}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Cancelar y restaurar carrito
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Agrega algunos productos para comenzar tu compra
            </p>
            <Link
              href="/"
              className="inline-block bg-[#68c3b7] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#64b7ac] transition-colors text-sm sm:text-base"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alerta de stock insuficiente */}
        {!stockLoading && !allSufficient && stockChecks.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Stock insuficiente para algunos productos
                </h3>
                <div className="text-sm text-red-700 space-y-1">
                  {stockChecks
                    .filter(check => !check.sufficient)
                    .map(check => (
                      <div key={check.productId}>
                        <strong>{check.productName}:</strong> Solo {check.availableStock} disponibles 
                        (tienes {check.requestedQuantity} en el carrito)
                      </div>
                    ))}
                </div>
                <button
                  onClick={refreshStock}
                  className="mt-2 inline-flex items-center text-sm text-red-800 hover:text-red-900"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Actualizar stock
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Tú carrito de compras
                  <span className="block sm:inline text-base font-normal text-gray-600 mt-1 sm:mt-0 sm:ml-2">
                    ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                  </span>
                </h1>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium self-start sm:self-auto"
                >
                  Vaciar carrito
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const stockInfo = stockMap.get(item.product.id);
                  const hasStockIssue = stockInfo && !stockInfo.sufficient;
                  
                  return (
                    <div key={item.product.id} className={`border-b pb-4 last:border-b-0 ${hasStockIssue ? 'bg-red-50 border-red-200 p-4 rounded-lg' : ''}`}>
                      {/* Desktop Layout */}
                      <div className="hidden md:flex items-center space-x-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={(item.product as any).images?.[0] || item.product.image || '/placeholder-image.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.product.category}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(item.product.price)}
                          </p>
                          
                          {/* Alerta de stock individual */}
                          {hasStockIssue && (
                            <div className="mt-2 flex items-center text-sm text-red-700">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Solo {stockInfo.availableStock} disponibles
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex items-center justify-center font-semibold px-4 py-2 bg-gray-100 rounded text-gray-900 min-w-[3.5rem] h-8">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-gray-600 transition-colors ${
                              hasStockIssue 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            disabled={hasStockIssue}
                            title={hasStockIssue ? 'Stock insuficiente' : 'Agregar uno más'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-lg text-gray-900">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-red-600 hover:text-red-700 mt-2 p-1"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={(item.product as any).images?.[0] || item.product.image || '/placeholder-image.jpg'}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                              {item.product.name}
                            </h3>
                            <p className="text-gray-600 text-xs mt-1">
                              {item.product.category}
                            </p>
                            <p className="text-base font-bold text-gray-900 mt-1">
                              {formatCurrency(item.product.price)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-red-600 hover:text-red-700 p-1 flex-shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Alerta de stock individual móvil */}
                        {hasStockIssue && (
                          <div className="flex items-center text-sm text-red-700 bg-red-100 p-2 rounded">
                            <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Solo {stockInfo.availableStock} disponibles
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="flex items-center justify-center font-semibold px-4 py-2 bg-gray-100 rounded text-gray-900 min-w-[3.5rem] h-8">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-gray-600 transition-colors ${
                                hasStockIssue 
                                  ? 'bg-gray-300 cursor-not-allowed' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              disabled={hasStockIssue}
                              title={hasStockIssue ? 'Stock insuficiente' : 'Agregar uno más'}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">
                              {formatCurrency(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Resumen del pedido
              </h2>
              
              <div className="space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Botón de checkout condicionado por stock */}
              {!allSufficient && !stockLoading ? (
                <div className="mb-4">
                  <button
                    disabled
                    className="flex items-center justify-center w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed mb-2"
                  >
                    Stock insuficiente
                  </button>
                  <p className="text-sm text-gray-600 text-center">
                    Ajusta las cantidades antes de continuar
                  </p>
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="flex items-center justify-center w-full bg-[#68c3b7] text-white py-3 rounded-lg font-semibold hover:bg-[#64b7ac] transition-colors mb-4"
                >
                  Proceder al pago
                </Link>
              )}
              
              <Link
                href="/"
                className="flex items-center justify-center text-[#68c3b7] hover:text-[#64b7ac] font-medium"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
