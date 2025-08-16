'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PackageIcon as Package, CalendarIcon as Calendar, CreditCardIcon as CreditCard, TruckIcon as Truck, CheckCircleIcon as CheckCircle2, ClockIcon as Clock, ExclamationTriangleIcon as AlertCircle, ChevronDownIcon as ChevronDown, ChevronUpIcon as ChevronUp } from '@/components/HeroIcons';
import { formatCurrency } from '@/lib/currency';
import { Order } from '@/types';
import Image from 'next/image';

// Estados simplificados
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'text-yellow-600 bg-yellow-50';
    case 'confirmed': return 'text-blue-600 bg-blue-50';
    case 'processing': return 'text-blue-600 bg-blue-50';
    case 'shipped': return 'text-purple-600 bg-purple-50';
    case 'delivered': return 'text-green-600 bg-green-50';
    case 'cancelled': return 'text-red-600 bg-red-50';
    case 'payment_failed': return 'text-red-600 bg-red-50';
    default: return 'text-orange-600 bg-orange-50'; // Para estados desconocidos/problemas de pago
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
    case 'payment_failed': return <AlertCircle className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />; // Para estados desconocidos
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pendiente de pago';
    case 'confirmed': return 'Confirmado';
    case 'processing': return 'Procesando';
    case 'shipped': return 'Enviado';
    case 'delivered': return 'Entregado';
    case 'cancelled': return 'Cancelado';
    case 'payment_failed': return 'Pago fallido';
    default: return 'Problema con el pago';
  }
};

const getStatusDescription = (status: string) => {
  switch (status) {
    case 'pending': return 'El pago está siendo procesado por MercadoPago';
    case 'confirmed': return 'El pago fue confirmado exitosamente';
    case 'processing': return 'Tu pedido está siendo preparado';
    case 'shipped': return 'Tu pedido está en camino';
    case 'delivered': return 'Tu pedido fue entregado exitosamente';
    case 'cancelled': return 'El pedido fue cancelado';
    case 'payment_failed': return 'Hubo un problema al procesar el pago';
    default: return 'Hubo un problema técnico con el procesamiento del pago. Puedes intentar pagar nuevamente.';
  }
};

const shouldShowRetryPayment = (status: string) => {
  return status === 'payment_failed' || 
         status === 'cancelled' || 
         !['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(status);
};

export default function MisPedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const retryPayment = async (order: Order) => {
    try {
      // Recrear el pedido en el contexto del checkout
      const orderData = {
        items: order.items,
        total: order.total,
        formData: {
          email: session?.user?.email || '',
          phone: '', // Se podrá llenar en el checkout
          address: '', // Se podrá llenar en el checkout
        },
        paymentMethod: order.paymentMethod || 'mercadopago'
      };

      // Guardar en localStorage para el checkout
      localStorage.setItem('retryPaymentOrder', JSON.stringify(orderData));
      localStorage.setItem('retryOrderId', order.id);
      
      console.log('💾 Guardando datos para reintento de pago:');
      console.log('  - Order ID:', order.id);
      console.log('  - Order Data:', orderData);
      
      // Redirigir al checkout
      router.push('/checkout?retry=true');
    } catch (error) {
      console.error('Error al reintentar pago:', error);
      alert('Error al preparar el reintento de pago. Por favor, intenta nuevamente.');
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchOrders(session.user.email);
    }
  }, [status, router, session]);

  const fetchOrders = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/orders?userEmail=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Datos recibidos de la API:', data);
        
        // Verificar que data sea un array directamente
        if (Array.isArray(data)) {
          // Validar estructura de cada order
          const validOrders = data.map(order => ({
            ...order,
            items: Array.isArray(order.items) ? order.items : []
          }));
          setOrders(validOrders);
        } else {
          console.warn('⚠️ Los datos recibidos no son un array:', data);
          setOrders([]);
        }
      } else {
        console.error('❌ Error en respuesta de API:', response.status);
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrders([]);
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
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.id.slice(-8)}
                          </h3>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2">{getStatusText(order.status)}</span>
                        </div>
                        
                        {/* Mostrar alerta si hay problema con el pago */}
                        {shouldShowRetryPayment(order.status) && (
                          <div className="mt-2 text-sm text-orange-600">
                            ⚠️ Requiere atención - Haz clic para ver opciones
                          </div>
                        )}
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

                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        {/* Estado detallado */}
                        <div className="mb-6 p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Estado del pedido</h4>
                          <p className="text-sm text-gray-600 mb-3">{getStatusDescription(order.status)}</p>
                          
                          {shouldShowRetryPayment(order.status) && (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  retryPayment(order);
                                }}
                                className="bg-[#68c3b7] text-white px-4 py-2 rounded-lg hover:bg-[#5aa399] transition-colors text-sm font-medium"
                              >
                                Reintentar pago
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push('/contacto');
                                }}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                              >
                                Contactar soporte
                              </button>
                            </div>
                          )}
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-4">Productos del pedido</h4>
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-lg">
                              <div className="relative w-16 h-16 flex-shrink-0">
                                {item.product?.image ? (
                                  <Image
                                    src={item.product.image}
                                    alt={item.product?.name || 'Producto'}
                                    fill
                                    className="object-cover rounded-md"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">
                                  {item.product?.name || 'Producto sin nombre'}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {item.quantity} × {formatCurrency(item.product?.price || 0)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {formatCurrency((item.product?.price || 0) * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {order.paymentMethod && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center text-sm text-gray-600">
                              <CreditCard className="w-4 h-4 mr-2" />
                              <span>Método de pago: {order.paymentMethod}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
