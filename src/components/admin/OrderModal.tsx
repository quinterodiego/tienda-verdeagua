'use client';

import { X, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Order } from '@/lib/admin-store';
import { useState } from 'react';
import TrackingManager from './TrackingManager';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

const statusInfo = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Procesando', color: 'bg-teal-100 text-teal-800', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const statusOptions: Array<{ value: Order['status']; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' }
];

export default function OrderModal({ isOpen, onClose, order, onUpdateStatus }: OrderModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const handleStatusUpdate = async () => {
    if (selectedStatus !== order.status) {
      setIsUpdating(true);
      try {
        await onUpdateStatus(order.id, selectedStatus);
        // El modal se cerrará desde el componente padre después de recargar datos
      } catch (error) {
        console.error('Error al actualizar estado:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const currentStatusInfo = statusInfo[order.status];
  const StatusIcon = currentStatusInfo.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Pedido {order.id}
            </h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusInfo.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {currentStatusInfo.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Nombre</p>
                <p className="text-sm text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Fecha del Pedido</p>
                <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </div>

          {/* Información de pago */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información de Pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Método de Pago</p>
                <div className="flex items-center mt-1">
                  {order.paymentMethod === 'cash_on_pickup' ? (
                    <>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pago al Retirar
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        MercadoPago
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Estado de Pago</p>
                <div className="flex items-center mt-1">
                  {order.paymentStatus === 'approved' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aprobado
                    </span>
                  ) : order.paymentStatus === 'pending' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  ) : order.paymentStatus === 'rejected' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Rechazado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {order.paymentStatus || 'No definido'}
                    </span>
                  )}
                </div>
              </div>
              {order.paymentId && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">ID de Pago</p>
                  <p className="text-sm text-gray-900 font-mono">{order.paymentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracking de Envío */}
          <TrackingManager
            orderId={order.id}
            currentTracking={order.trackingNumber}
            currentShippingUrl={order.shippingUrl}
            paymentMethod={order.paymentMethod}
            paymentStatus={order.paymentStatus}
            customerEmail={order.customerEmail}
            customerName={order.customerName}
            onUpdate={(success, message) => {
              if (success) {
                // Aquí podrías actualizar el estado local del pedido si es necesario
                console.log('Tracking actualizado:', message);
              }
            }}
          />

          {/* Dirección de envío */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Dirección de Envío</h3>
              <div className="text-sm text-gray-900">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>Teléfono: {order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Productos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Productos</h3>
            
            {/* Desktop Table */}
            <div className="hidden lg:block border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={item.image || '/placeholder-image.svg'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.svg';
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">ID: {item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={item.image || '/placeholder-image.svg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">ID: {item.id}</p>
                      
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Precio:</span>
                          <div className="font-medium text-gray-900">{formatCurrency(item.price)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Cantidad:</span>
                          <div className="font-medium text-gray-900">{item.quantity}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <div className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del total */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total del Pedido</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cambiar estado */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Gestionar Estado del Pedido</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Pedido
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
                  className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={selectedStatus === order.status || isUpdating}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedStatus === order.status || isUpdating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#68c3b7] text-white hover:bg-[#64b7ac]'
                }`}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </div>
                ) : (
                  'Actualizar Estado'
                )}
              </button>
            </div>
          </div>

          {/* Línea de tiempo del pedido */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Historial del Pedido</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pedido creado</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              {order.status !== 'pending' && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#68c3b7]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pedido en procesamiento</p>
                    <p className="text-xs text-gray-500">Estado actualizado</p>
                  </div>
                </div>
              )}

              {(order.status === 'shipped' || order.status === 'delivered') && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pedido enviado</p>
                    <p className="text-xs text-gray-500">En camino al cliente</p>
                  </div>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pedido entregado</p>
                    <p className="text-xs text-gray-500">Completado exitosamente</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#64b7ac]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
