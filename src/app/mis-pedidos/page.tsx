'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Calendar, CreditCard, Truck, Package, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Order } from '@/types';
import Image from 'next/image';

// Función para obtener color según estado
const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'pending_transfer':
    case 'payment_pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-purple-100 text-purple-800';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'payment_failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Función para obtener texto del estado en español
const getOrderStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'pending_transfer':
      return 'Pago Pendiente';
    case 'payment_pending':
      return 'Pago Pendiente';
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
    case 'payment_failed':
      return 'Problema con el pago';
    case 'rejected':
      return 'Rechazado';
    case 'failed':
      return 'Fallido';
    default:
      return status;
  }
};

// Función para obtener ícono según estado
const getOrderStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
    case 'pending_transfer':
      return <Clock className="w-4 h-4" />;
    case 'confirmed':
      return <CheckCircle className="w-4 h-4" />;
    case 'processing':
      return <Package className="w-4 h-4" />;
    case 'shipped':
      return <Truck className="w-4 h-4" />;
    case 'delivered':
      return <CheckCircle className="w-4 h-4" />;
    case 'cancelled':
    case 'payment_failed':
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

// Función para determinar si el pago falló o está pendiente
const isPaymentFailed = (status: string) => {
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
      // Recrear el pedido en el contexto del checkout, permitiendo cambiar método de pago
      const orderData = {
        items: order.items,
        total: order.total,
        formData: {
          email: session?.user?.email || order.customer?.email || '',
          phone: order.shippingAddress?.phone || '', // Precargar datos existentes
          address: order.shippingAddress?.address || '', // Precargar datos existentes
          firstName: order.shippingAddress?.firstName || '',
          lastName: order.shippingAddress?.lastName || '',
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          zipCode: order.shippingAddress?.zipCode || '',
        },
        paymentMethod: order.paymentMethod || 'mercadopago', // Precargar pero permitir cambio
        isRetry: true, // Indicar que es un reintento
        originalOrderId: order.id // Mantener referencia al pedido original
      };

      // Guardar en localStorage para el checkout
      localStorage.setItem('retryPaymentOrder', JSON.stringify(orderData));
      localStorage.setItem('retryOrderId', order.id);
      
      console.log('💾 Guardando datos para reintento de pago:');
      console.log('  - Order ID:', order.id);
      console.log('  - Order Data:', orderData);
      
      // Redirigir al checkout con posibilidad de cambiar método de pago
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'mercadopago':
        return 'Mercado Pago';
      case 'transfer':
      case 'transferencia_bancaria':
        return 'Transferencia Bancaria';
      case 'cash_on_pickup':
        return 'Efectivo al Retirar';
      case 'tarjeta_credito':
        return 'Tarjeta de Crédito';
      case 'tarjeta_debito':
        return 'Tarjeta de Débito';
      case 'efectivo':
        return 'Efectivo';
      case 'dinero_cuenta_mp':
        return 'Dinero en Cuenta MP';
      default:
        return method || 'No especificado';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No tienes pedidos aún</h2>
          <p className="text-gray-500 mb-6">Cuando realices tu primera compra, aparecerá aquí.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header del pedido */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.id}
                      </h3>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusIcon(order.status)}
                        {getOrderStatusText(order.status)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.createdAt.toString())}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {getPaymentMethodText(order.paymentMethod || '')}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isPaymentFailed(order.status) && (
                      <button
                        onClick={() => retryPayment(order)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Completar Pago
                      </button>
                    )}
                    
                    <button
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <span className="text-sm">Detalles</span>
                      {expandedOrders.has(order.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalles expandibles */}
              {expandedOrders.has(order.id) && (
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Productos */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Productos</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                            {item.product?.image && (
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                width={48}
                                height={48}
                                className="object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product?.name || 'Producto'}</p>
                              <p className="text-sm text-gray-600">
                                Cantidad: {item.quantity} × {formatCurrency(item.product?.price || 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Información de envío */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Información de Envío</h4>
                      <div className="bg-white p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Nombre:</span> {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                        <p><span className="font-medium">Dirección:</span> {order.shippingAddress?.address}</p>
                        <p><span className="font-medium">Ciudad:</span> {order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                        <p><span className="font-medium">Código Postal:</span> {order.shippingAddress?.zipCode}</p>
                        <p><span className="font-medium">Teléfono:</span> {order.shippingAddress?.phone}</p>
                      </div>
                      
                      {order.trackingNumber && (
                        <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Número de Seguimiento</p>
                          <p className="text-blue-700">{order.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Notas del Pedido</h4>
                      <p className="text-gray-700 bg-white p-3 rounded-lg">{order.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
