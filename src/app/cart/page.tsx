'use client';

import { useCartStore } from '@/lib/store';
import { useStockCheck } from '@/lib/useStockCheck';
import { formatCurrency } from '@/lib/currency';
import { Minus, Plus, X, AlertTriangle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const { stockChecks, allSufficient, loading: stockLoading, error: stockError, refreshStock } = useStockCheck(items);

  // Crear un mapa de stock para fácil acceso
  const stockMap = new Map(stockChecks.map(check => [check.productId, check]));

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Agrega algunos productos para comenzar tu compra
            </p>
            <Link
              href="/"
              className="bg-[#68c3b7] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#64b7ac] transition-colors"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Carrito de compras ({items.length} productos)
                </h1>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Vaciar carrito
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const stockInfo = stockMap.get(item.product.id);
                  const hasStockIssue = stockInfo && !stockInfo.sufficient;
                  
                  return (
                    <div key={item.product.id} className={`border-b pb-4 ${hasStockIssue ? 'bg-red-50 border-red-200 p-4 rounded-lg' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-20 h-20">
                          <Image
                            src={(item.product as any).images?.[0] || item.product.image || '/placeholder-image.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.product.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.product.category}
                          </p>
                          <p className="font-bold text-lg text-gray-900">
                                                      <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(item.product.price)}
                          </p>
                          </p>
                          
                          {/* Alerta de stock individual */}
                          {hasStockIssue && (
                            <div className="mt-2 flex items-center text-sm text-red-700">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Solo {stockInfo.availableStock} disponibles
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold px-3 py-1 bg-gray-100 rounded">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className={`p-1 rounded-full ${
                              hasStockIssue 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            disabled={hasStockIssue}
                            title={hasStockIssue ? 'Stock insuficiente' : 'Agregar uno más'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-red-600 hover:text-red-700 mt-2"
                          >
                            <X className="w-5 h-5" />
                          </button>
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
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resumen del pedido
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-semibold">Gratis</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Botón de checkout condicionado por stock */}
              {!allSufficient && !stockLoading ? (
                <div className="mb-4">
                  <button
                    disabled
                    className="block w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed mb-2"
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
                  className="block w-full bg-[#68c3b7] text-white py-3 rounded-lg font-semibold hover:bg-[#64b7ac] transition-colors mb-4 text-center"
                >
                  Proceder al checkout
                </Link>
              )}
              
              <Link
                href="/"
                className="block text-center text-[#68c3b7] hover:text-[#64b7ac] font-medium"
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
