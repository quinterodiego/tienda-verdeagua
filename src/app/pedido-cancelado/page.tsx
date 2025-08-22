'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';

export default function OrderCancelledPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícono de confirmación */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pedido Cancelado
        </h1>

        {/* Mensaje de confirmación */}
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Tu pedido ha sido cancelado exitosamente.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Pedido <span className="font-mono font-medium">#{orderId}</span>
            </p>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">¿Qué significa esto?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• El pedido ha sido eliminado de tu historial</li>
            <li>• No se procesará ningún pago</li>
            <li>• Los productos vuelven a estar disponibles</li>
            <li>• Hemos notificado a nuestro equipo</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Home className="w-5 h-5" />
            Volver a la Tienda
          </button>
          
          <button
            onClick={() => router.push('/mis-pedidos')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver Mis Pedidos
          </button>
        </div>

        {/* Mensaje de ayuda */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            ¿Necesitas ayuda?
          </p>
          <a 
            href="https://wa.me/+5491123456789" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Contactanos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
