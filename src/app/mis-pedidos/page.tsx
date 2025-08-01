'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/currency';
import { Package, Calendar, CreditCard, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Order } from '@/types';

// Función para obtener el color del estado
const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'confirmed':
      return 'text-blue-600 bg-blue-50';
    case 'processing':
      return 'text-blue-600 bg-blue-50';
    case 'shipped':
      return 'text-purple-600 bg-purple-50';
    case 'delivered':
      return 'text-green-600 bg-green-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Función para obtener el icono del estado
const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'confirmed':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'processing':
      return <Package className="w-4 h-4" />;
    case 'shipped':
      return <Truck className="w-4 h-4" />;
    case 'delivered':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'cancelled':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

// Función para obtener el texto del estado
const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'confirmed':
      return 'Confirmado';
    case 'processing':
      return 'Procesando';
    case 'shipped':
      return 'Enviado';
    case 'delivered':
      return 'Entregado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

export default function MisPedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Cargar pedidos del usuario desde la API
    loadUserOrders();
  }, [session, status, router]);

  const loadUserOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userEmail=${session?.user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Error al cargar pedidos');
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    // Confirmar cancelación
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres cancelar este pedido?\n\nEsta acción no se puede deshacer.'
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          notes: 'Pedido cancelado por el usuario'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar la lista de pedidos localmente
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' as const, updatedAt: new Date() }
              : order
          )
        );
        alert('✅ Pedido cancelado exitosamente');
      } else {
        alert(`❌ Error: ${data.error || 'No se pudo cancelar el pedido'}`);
      }
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      alert('❌ Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    }
  };

  const reorderItems = async (order: Order) => {
    // Esta función podría agregar los productos del pedido al carrito actual
    alert('Funcionalidad de "Volver a comprar" en desarrollo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">Historial y estado de tus pedidos</p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-[#68c3b7] mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Entregados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">En Camino</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes pedidos aún</h3>
            <p className="text-gray-600 mb-6">¡Explora nuestros productos y realiza tu primer pedido!</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#68c3b7] text-white px-6 py-3 rounded-lg hover:bg-[#5bb3a7] transition-colors"
            >
              Ir a la tienda
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header del pedido */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{order.id}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </div>
                      
                      {/* Mostrar mensaje específico para pedidos cancelados por error de pago */}
                      {order.status === 'cancelled' && order.paymentStatus === 'rejected' && (
                        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Pago rechazado
                        </div>
                      )}
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} producto(s)</p>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional para pedidos cancelados */}
                  {order.status === 'cancelled' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-800 font-medium text-sm">
                            {order.paymentStatus === 'rejected' 
                              ? 'Este pedido fue cancelado debido a un problema con el pago'
                              : 'Este pedido fue cancelado'
                            }
                          </p>
                          <p className="text-red-700 text-xs mt-1">
                            {order.paymentStatus === 'rejected' 
                              ? 'Puedes volver a intentar el pago creando un nuevo pedido con los mismos productos'
                              : 'Si tienes dudas, contáctanos'
                            }
                          </p>
                          
                          {/* Botón para recomprar si fue rechazado por pago */}
                          {order.paymentStatus === 'rejected' && (
                            <button
                              onClick={() => {
                                // Agregar productos al carrito y redirigir
                                order.items.forEach(item => {
                                  // Aquí deberías llamar a tu función addToCart
                                  console.log('Agregando al carrito:', item);
                                });
                                router.push('/cart');
                              }}
                              className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                            >
                              Volver a comprar estos productos
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Productos del pedido */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={`${order.id}-${index}`} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(item.product.price * item.quantity)}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.product.price)} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Información adicional */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Dirección de envío:</p>
                        <p className="text-gray-900">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                          {order.shippingAddress.address}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Estado del pago:</p>
                        <p className="text-gray-900">
                          {order.paymentStatus ? 
                            order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 
                            'No especificado'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button 
                      className="flex-1 sm:flex-none bg-[#68c3b7] text-white px-6 py-2 rounded-lg hover:bg-[#5bb3a7] transition-colors"
                      onClick={() => alert('Vista de detalles en desarrollo')}
                    >
                      Ver detalles
                    </button>
                    {order.status === 'delivered' && (
                      <button 
                        className="flex-1 sm:flex-none border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => reorderItems(order)}
                      >
                        Volver a comprar
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                      <button 
                        className="flex-1 sm:flex-none border border-red-300 text-red-700 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancelar pedido
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
