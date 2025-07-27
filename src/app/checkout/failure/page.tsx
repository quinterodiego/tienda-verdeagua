'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, RefreshCw, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

function FailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');
  const statusDetail = searchParams.get('status_detail');

  const getErrorMessage = (detail: string | null) => {
    switch (detail) {
      case 'cc_rejected_insufficient_amount':
        return 'Fondos insuficientes en la tarjeta';
      case 'cc_rejected_bad_filled_card_number':
        return 'Número de tarjeta incorrecto';
      case 'cc_rejected_bad_filled_date':
        return 'Fecha de vencimiento incorrecta';
      case 'cc_rejected_bad_filled_security_code':
        return 'Código de seguridad incorrecto';
      case 'cc_rejected_call_for_authorize':
        return 'Debes autorizar el pago con tu banco';
      case 'cc_rejected_card_disabled':
        return 'Tarjeta deshabilitada';
      case 'cc_rejected_duplicated_payment':
        return 'Pago duplicado';
      case 'cc_rejected_high_risk':
        return 'Pago rechazado por seguridad';
      default:
        return 'Hubo un problema procesando tu pago';
    }
  };

  const handleRetry = () => {
    // Volver al checkout para intentar de nuevo
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icono de error */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pago no procesado
        </h1>
        
        <p className="text-gray-600 mb-6">
          {getErrorMessage(statusDetail)}
        </p>

        {/* Detalles del error */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Información del intento
            </h3>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Pedido:</span>
                <span className="font-mono">{orderId}</span>
              </div>
              
              {status && (
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span>{status}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sugerencias */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-8">
          <h4 className="font-medium text-yellow-800 mb-2">Qué puedes hacer:</h4>
          <ul className="text-yellow-700 text-sm text-left space-y-1">
            <li>• Verifica los datos de tu tarjeta</li>
            <li>• Asegúrate de tener fondos suficientes</li>
            <li>• Intenta con otra tarjeta</li>
            <li>• Contacta a tu banco si persiste el problema</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button 
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </button>
          
          <Link 
            href="/cart"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al carrito
          </Link>
          
          <Link 
            href="/"
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <FailureContent />
    </Suspense>
  );
}
