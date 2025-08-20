'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CheckCircle, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

function MercadoPagoDemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const orderId = searchParams.get('order_id');
  const preferenceId = searchParams.get('preference_id');
  const unauth = searchParams.get('unauth');

  useEffect(() => {
    // Auto-avanzar después de 3 segundos
    const timer = setTimeout(() => {
      if (step === 1) setStep(2);
    }, 3000);

    return () => clearTimeout(timer);
  }, [step]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirigir a página de éxito
    router.push(`/checkout/success?order_id=${orderId}&demo=true&preference_id=${preferenceId}${unauth ? '&unauth=true' : ''}`);
  };

  const handleCancel = () => {
    router.push('/checkout?cancelled=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header simulando MercadoPago */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">MercadoPago</h1>
                <p className="text-sm text-gray-600">Modo Demo - Simulación</p>
              </div>
            </div>
            <button 
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cancelar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Preparando tu pago
              </h2>
              <p className="text-gray-600 mb-6">
                Estamos configurando tu transacción...
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  🧪 <strong>Modo Demo</strong> - Esta es una simulación del flujo de MercadoPago
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Confirmar Pago
              </h2>
              <p className="text-gray-600">
                Order ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{orderId}</code>
              </p>
            </div>

            <div className="border rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Resumen del pedido</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Productos</span>
                  <span className="font-medium">$100.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">Gratis</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>$100.00</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Método de pago demo</h3>
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                <CreditCard className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium">Tarjeta de prueba</p>
                  <p className="text-sm text-gray-600">**** **** **** 1234</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                🧪 <strong>Simulación:</strong> Al hacer clic en "Pagar ahora", simularemos un pago exitoso.
                No se procesará ningún pago real.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Pagar ahora (DEMO)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MercadoPagoDemo() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <MercadoPagoDemoContent />
    </Suspense>
  );
}
