'use client';

import { useState } from 'react';

interface TestResult {
  type: string;
  data: any;
}

export default function DebugMercadoPago() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mercadopago/health');
      const data = await response.json();
      setResult({ type: 'health', data });
    } catch (error) {
      setResult({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const testDebug = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-mp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setResult({ type: 'debug', data });
    } catch (error) {
      setResult({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  const testRealCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: 'test-item',
            title: 'Producto de Prueba',
            quantity: 1,
            unit_price: 100
          }],
          orderId: `test-${Date.now()}`,
          customerInfo: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com'
          }
        })
      });
      const data = await response.json();
      setResult({ type: 'checkout', data });
    } catch (error) {
      setResult({ type: 'error', data: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Debug MercadoPago en Producción
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests Disponibles:</h2>
          
          <div className="space-y-4">
            <button
              onClick={testHealth}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              🏥 Test Health Check
            </button>
            
            <button
              onClick={testDebug}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              🔧 Test Debug Simple
            </button>
            
            <button
              onClick={testRealCheckout}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              🛒 Test Checkout Real
            </button>
          </div>
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Ejecutando test...</p>
            </div>
          )}
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">
              📋 Resultado del Test: {result.type}
            </h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
