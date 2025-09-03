'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DebugOrdersPage() {
  const { data: session } = useSession();
  const [debugData, setDebugData] = useState<{
    userEmail: string;
    totalOrdersInSheet: number;
    userOrdersCount: number;
    userOrders: any[];
    allOrdersPreview: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/debug-orders?email=${encodeURIComponent(session.user.email)}`);
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className="p-4">Necesitas estar logueado para ver esta página</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug de Pedidos</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p><strong>Usuario logueado:</strong> {session.user?.email}</p>
        <p><strong>Nombre:</strong> {session.user?.name}</p>
      </div>

      <button
        onClick={fetchDebugData}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {loading ? 'Cargando...' : '🔍 Analizar Pedidos'}
      </button>

      {debugData && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Resumen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total en Google Sheets</p>
                <p className="text-2xl font-bold">{debugData.totalOrdersInSheet}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Pedidos del Usuario</p>
                <p className="text-2xl font-bold">{debugData.userOrdersCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-mono">{debugData.userEmail}</p>
              </div>
            </div>
          </div>

          {debugData.userOrdersCount > 0 ? (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📦 Pedidos del Usuario</h2>
              <div className="space-y-4">
                {debugData.userOrders.map((order: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p><strong>ID:</strong> {order.id}</p>
                        <p><strong>Total:</strong> ${order.total}</p>
                        <p><strong>Estado:</strong> <span className="px-2 py-1 bg-gray-100 rounded text-sm">{order.status}</span></p>
                      </div>
                      <div>
                        <p><strong>Pago ID:</strong> {order.paymentId || 'N/A'}</p>
                        <p><strong>Estado Pago:</strong> {order.paymentStatus || 'N/A'}</p>
                        <p><strong>Método:</strong> {order.paymentMethod || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Fecha:</strong> {order.createdAt}</p>
                        <p><strong>Tracking:</strong> {order.trackingNumber || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {order.items && (
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Items:</p>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(JSON.parse(order.items), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">⚠️ No se encontraron pedidos</h2>
              <p>No hay pedidos registrados para el email: <code>{debugData.userEmail}</code></p>
            </div>
          )}

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🗂️ Primeros 5 Pedidos en Google Sheets</h2>
            <div className="space-y-2">
              {debugData.allOrdersPreview.map((order: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{order.id}</span>
                  <span className="text-sm">{order.email}</span>
                  <span className="text-sm text-gray-600">{order.name}</span>
                </div>
              ))}
            </div>
          </div>

          <details className="bg-gray-50 border rounded-lg p-6">
            <summary className="cursor-pointer font-semibold">🔍 Datos Raw Completos</summary>
            <pre className="mt-4 text-xs overflow-x-auto">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
