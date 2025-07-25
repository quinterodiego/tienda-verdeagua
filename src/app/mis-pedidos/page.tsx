'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Package, ArrowLeft, Eye, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';

// Mock data - en una app real vendría de una API
const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'Entregado',
    total: 1299,
    items: [
      { name: 'iPhone 15 Pro', quantity: 1, price: 1299 }
    ]
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    status: 'En tránsito',
    total: 1499,
    items: [
      { name: 'MacBook Air M3', quantity: 1, price: 1499 }
    ]
  }
];

const statusColors: Record<string, string> = {
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'Procesando': 'bg-[#68c3b7]/20 text-[#68c3b7]',
  'En tránsito': 'bg-purple-100 text-purple-800',
  'Entregado': 'bg-green-100 text-green-800',
  'Cancelado': 'bg-red-100 text-red-800'
};

export default function MisPedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/signin');
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/perfil"
            className="inline-flex items-center text-[#68c3b7] hover:text-[#64b7ac] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al perfil
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-600 mt-2">
            Revisa el estado de tus pedidos recientes
          </p>
        </div>

        {/* Orders List */}
        {mockOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-600 mb-6">
              Cuando realices tu primera compra, aparecerá aquí
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[#68c3b7] text-white font-semibold rounded-lg hover:bg-[#64b7ac] transition-colors"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.id}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <CreditCard className="w-4 h-4 mr-1" />
                        ${order.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#68c3b7] hover:text-[#64b7ac]">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalles
                    </button>
                    
                    {order.status === 'Entregado' && (
                      <button className="inline-flex items-center px-4 py-2 bg-[#68c3b7] text-white text-sm font-medium rounded-lg hover:bg-[#64b7ac] transition-colors">
                        Comprar de nuevo
                      </button>
                    )}
                    
                    {order.status === 'En tránsito' && (
                      <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                        Rastrear pedido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
