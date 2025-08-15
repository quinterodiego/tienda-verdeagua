'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCheckoutContext } from '@/contexts/CheckoutContext';
import { useCartStore } from '@/lib/store';
import { CheckCircleIcon as CheckCircle, PackageIcon as Package, ArrowLeftIcon as ArrowLeft } from '@/components/HeroIcons';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { clearCheckoutState } = useCheckoutContext();
  const { clearCart } = useCartStore();
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const paymentMethod = searchParams.get('payment_method');

  // Limpiar estado de checkout y carrito al llegar a success
  useEffect(() => {
    console.log('🎉 Llegó a página de éxito, limpiando contexto de checkout y carrito');
    clearCheckoutState();
    clearCart();
  }, [clearCheckoutState, clearCart]);

  const isCashOnPickup = paymentMethod === 'cash_on_pickup';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isCashOnPickup ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          <CheckCircle className={`h-10 w-10 ${
            isCashOnPickup ? 'text-green-600' : 'text-blue-600'
          }`} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isCashOnPickup ? '¡Pedido confirmado!' : '¡Pago exitoso!'}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {isCashOnPickup 
            ? 'Tu pedido ha sido reservado. Te contactaremos para coordinar el retiro.'
            : 'Tu pedido ha sido confirmado y lo recibirás pronto.'
          }
        </p>

        {isCashOnPickup && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-2">Información del retiro:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Te contactaremos en las próximas 2 horas</li>
              <li>• Horarios: Lunes a Viernes 9:00 - 18:00</li>
              <li>• Pago en efectivo o transferencia</li>
              <li>• Reservado por 48 horas</li>
            </ul>
          </div>
        )}

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-600">Número de pedido:</p>
            <p className="font-mono font-bold">{orderId}</p>
            {paymentId && !isCashOnPickup && (
              <>
                <p className="text-sm text-gray-600 mt-2">ID de pago:</p>
                <p className="font-mono text-sm">{paymentId}</p>
              </>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/mis-pedidos"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Package className="h-4 w-4 mr-2" />
            Ver mis pedidos
          </Link>
          
          <Link 
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
