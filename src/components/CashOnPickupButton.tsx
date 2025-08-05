'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/lib/store';
import { useNotification } from '@/components/NotificationProvider';

export default function CashOnPickupButton() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clearCart, subtotal } = useStore();
  const { addNotification } = useNotification();

  const handleCashOnPickupOrder = async () => {
    console.log('💰 Iniciando proceso de pago al retirar simplificado');
    console.log('📊 Estado de sesión:', session);
    
    if (!session) {
      console.log('❌ No hay sesión de usuario');
      addNotification('Debe iniciar sesión para realizar un pedido', 'error');
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
      
      console.log('📋 Datos simplificados del pedido:', orderData);
      
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

  return (
    <button
      onClick={handleCashOnPickupOrder}
      disabled={isProcessing}
      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Procesando pedido...
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          Confirmar Pedido (Pago al Retirar)
        </>
      )}
    </button>
  );
}
