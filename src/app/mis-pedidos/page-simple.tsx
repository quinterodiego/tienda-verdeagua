'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, Calendar, CreditCard, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Order } from '@/types';

// Estados simplificados
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'text-yellow-600 bg-yellow-50';
    case 'confirmed': return 'text-blue-600 bg-blue-50';
    case 'processing': return 'text-blue-600 bg-blue-50';
    case 'shipped': return 'text-purple-600 bg-purple-50';
    case 'delivered': return 'text-green-600 bg-green-50';
    case 'cancelled': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'confirmed': return <CheckCircle2 className="w-4 h-4" />;
    case 'processing': return <Package className="w-4 h-4" />;
    case 'shipped': return <Truck className="w-4 h-4" />;
    case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
    case 'cancelled': return <AlertCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'confirmed': return 'Confirmado';
    case 'processing': return 'Procesando';
    case 'shipped': return 'Enviado';
    case 'delivered': return 'Entregado';
    case 'cancelled': return 'Cancelado';
    default: return 'Desconocido';
  }
};

export default function MisPedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#68c3b7] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">Rastrea el estado de tus pedidos y revisa tu historial de compras</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes pedidos aún</h3>
            <p className="text-gray-600 mb-6">Cuando realices tu primera compra, aparecerá aquí.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#68c3b7] text-white px-6 py-2 rounded-lg hover:bg-[#5aa399] transition-colors"
            >
              Comenzar a comprar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="bg-gray-100 rounded-lg p-3 mr-4">
                      <Package className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.id.slice(-8)}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{getStatusText(order.status)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} artículo{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center text-sm text-gray-500">
                        +{order.items.length - 3} artículo{order.items.length - 3 !== 1 ? 's' : ''} más
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                {order.paymentMethod && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span>Método de pago: {order.paymentMethod}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
