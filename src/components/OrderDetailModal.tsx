'use client';

import { useState } from 'react';
import { X, Package, Calendar, CreditCard, Truck, CheckCircle2, Clock, AlertCircle, MapPin, Phone, User, Mail } from 'lucide-react';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/currency';
import Image from 'next/image';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
}

// Función para obtener el color del estado
const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'confirmed':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'processing':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'shipped':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'delivered':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'cancelled':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Función para obtener el icono del estado
const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5" />;
    case 'confirmed':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'processing':
      return <Package className="w-5 h-5" />;
    case 'shipped':
      return <Truck className="w-5 h-5" />;
    case 'delivered':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'cancelled':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
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

// Función para obtener descripción del estado
const getStatusDescription = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'Tu pedido está siendo procesado y se confirmará pronto.';
    case 'confirmed':
      return 'Tu pedido ha sido confirmado y se está preparando.';
    case 'processing':
      return 'Tu pedido se está empaquetando para el envío.';
    case 'shipped':
      return 'Tu pedido está en camino a la dirección de entrega.';
    case 'delivered':
      return 'Tu pedido ha sido entregado exitosamente.';
    case 'cancelled':
      return 'Este pedido ha sido cancelado.';
    default:
      return 'Estado del pedido no especificado.';
  }
};

// Función para validar y limpiar URL de imagen
const getValidImageUrl = (imageUrl: string): string => {
  if (!imageUrl) {
    return '/placeholder-image.svg';
  }
  
  // Si ya es una URL válida de Cloudinary o externa, usarla tal como está
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Si es una ruta relativa, convertirla a absoluta
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // Si no tiene protocolo, asumir que es un path relativo
  return `/${imageUrl}`;
};

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Pedido #{order.id}
              </h2>
              <div className={`flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-2">{getStatusText(order.status)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Estado y descripción */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 text-sm">
              {getStatusDescription(order.status)}
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              Pedido realizado el {formatDate(order.createdAt)}
              {order.updatedAt && (
                <>
                  <span className="mx-2">•</span>
                  Última actualización: {formatDate(order.updatedAt)}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Información del cliente y dirección */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del cliente */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Información del Cliente
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{order.customer.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                Dirección de Envío
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-gray-700">{order.shippingAddress.address}</p>
                <p className="text-gray-700">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                {order.shippingAddress.phone && (
                  <div className="flex items-center mt-3">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-700">{order.shippingAddress.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información de pago */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
              Información de Pago
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Método de pago</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod === 'mercadopago' ? 'MercadoPago' : order.paymentMethod?.replace('_', ' ') || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado del pago</p>
                <p className={`font-medium inline-flex items-center px-2 py-1 rounded text-xs ${
                  order.paymentStatus === 'approved' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'No especificado'}
                </p>
              </div>
              {order.paymentId && (
                <div>
                  <p className="text-sm text-gray-600">ID de pago</p>
                  <p className="font-mono text-sm text-gray-900">{order.paymentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracking (si está disponible) */}
          {order.trackingNumber && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-600" />
                Información de Envío
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Número de seguimiento</p>
                  <p className="font-mono text-lg text-blue-900">{order.trackingNumber}</p>
                </div>
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-sm text-gray-600">Entrega estimada</p>
                    <p className="font-medium text-gray-900">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Productos del pedido */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-600" />
              Productos del Pedido ({order.items.length} producto{order.items.length !== 1 ? 's' : ''})
            </h3>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Desktop: Tabla */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio unit.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => {
                      const product = item.product;
                      
                      return (
                        <tr key={`${order.id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                                <Image
                                  src={getValidImageUrl(product.image)}
                                  alt={product.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.svg';
                                  }}
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">{product.name}</h4>
                                <p className="text-sm text-gray-500">ID: {product.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{item.quantity}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.price * item.quantity)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {order.items.map((item, index) => {
                  const product = item.product;
                  
                  return (
                    <div key={`${order.id}-${index}`} className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={getValidImageUrl(product.image)}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{product.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">ID: {product.id}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(product.price)} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(product.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total del pedido */}
            <div className="mt-6 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total del Pedido</span>
                <span className="text-2xl font-bold text-[#68c3b7]">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notas adicionales */}
          {order.notes && (
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notas del Pedido</h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
