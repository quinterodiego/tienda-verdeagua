'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Link from 'next/link';

// Componente interno que usa useSearchParams
function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();

  // Redireccionar a mis-pedidos después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/mis-pedidos');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <div className="flex items-center justify-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">
            ¡Pedido confirmado!
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {orderId
                ? `Tu pedido con ID ${orderId} ha sido registrado correctamente.`
                : 'Tu pedido ha sido registrado correctamente.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Nos pondremos en contacto contigo pronto para coordinar la entrega.
            </p>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Serás redirigido a tus pedidos en 5 segundos.{' '}
              <Link href="/mis-pedidos" className="text-blue-600 hover:text-blue-800">
                Ir ahora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de loading para el Suspense
function OrderConfirmationLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <div className="flex items-center justify-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">
            Cargando confirmación...
          </h3>
        </div>
      </div>
    </div>
  );
}

// Componente principal envuelto en Suspense
export default function OrderConfirmation() {
  return (
    <Suspense fallback={<OrderConfirmationLoading />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
