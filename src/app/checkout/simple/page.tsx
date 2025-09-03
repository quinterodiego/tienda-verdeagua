'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useNotifications } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';

export default function SimplifiedCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session } = useSession();
  const { items, clearCart, total: subtotal } = useCartStore();
  const addNotification = useNotifications((state) => state.addNotification);
  const router = useRouter();

  const handleOrderSubmit = async () => {
    if (!session) {
      addNotification('Debes iniciar sesión para realizar un pedido', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Datos mínimos para la orden
      const orderData = {
        customerInfo: {
          firstName: session.user?.name?.split(' ')[0] || 'Cliente',
          lastName: session.user?.name?.split(' ')[1] || 'Registrado',
          email: session.user?.email
        },
        items: items.map((item: any) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        total: subtotal,
        paymentMethod: 'cash_on_pickup',
        paymentStatus: 'pending'
      };
      
      console.log('📋 Datos del pedido:', orderData);
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el pedido');
      }
      
      const result = await response.json();
      console.log('✅ Pedido creado exitosamente:', result);
      
      addNotification('✅ Pedido creado exitosamente', 'success');
      clearCart();
      router.push(`/checkout/confirmation?orderId=${result.orderId}`);
    } catch (error) {
      console.error('❌ Error al procesar pedido:', error);
      addNotification('Error al procesar el pedido', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <Link href="/" className="text-[#68c3b7] hover:underline">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Finalizar Compra - Pago al Retirar</h1>
          
          <div className="space-y-6">
            {/* Productos */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Resumen del Pedido</h2>
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    {item.product.image && (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total a Pagar</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {/* Info de Usuario */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Información del Cliente</h3>
              {session ? (
                <p className="text-gray-600">
                  Nombre: {session.user?.name}<br />
                  Email: {session.user?.email}
                </p>
              ) : (
                <p className="text-gray-600">Por favor, inicia sesión para continuar.</p>
              )}
            </div>

            {/* Botón de Confirmar */}
            <button
              onClick={handleOrderSubmit}
              disabled={isProcessing || !session || items.length === 0}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando pedido...
                </>
              ) : (
                'Confirmar Pedido (Pago al Retirar)'
              )}
            </button>

            {/* Botón Volver */}
            <Link
              href="/cart"
              className="block text-center text-[#68c3b7] hover:underline mt-4"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
