'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function PendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-10 w-10 text-yellow-600 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pago pendiente
        </h1>
        
        <p className="text-gray-600 mb-8">
          Tu pago está siendo procesado. Te notificaremos cuando se complete.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-600">Número de pedido:</p>
            <p className="font-mono font-bold">{orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar estado
          </button>
          
          <Link 
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PendingContent />
    </Suspense>
  );
}
