'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Clock, Package, Truck, XCircle } from 'lucide-react';

interface OrderStatusEmailTestPanelProps {
  className?: string;
}

export default function OrderStatusEmailTestPanel({ className = '' }: OrderStatusEmailTestPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    orderId: 'TEST-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    customerName: '',
    customerEmail: '',
    newStatus: 'confirmed' as const,
    trackingNumber: '',
    estimatedDelivery: '',
    cancellationReason: ''
  });

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', icon: Clock, color: 'text-yellow-600', description: 'Pedido recibido, esperando confirmación' },
    { value: 'confirmed', label: 'Confirmado', icon: CheckCircle, color: 'text-blue-600', description: 'Pago verificado, pedido confirmado' },
    { value: 'processing', label: 'Procesando', icon: Package, color: 'text-teal-600', description: 'Pedido siendo preparado' },
    { value: 'shipped', label: 'Enviado', icon: Truck, color: 'text-purple-600', description: 'Pedido en camino al cliente' },
    { value: 'delivered', label: 'Entregado', icon: CheckCircle, color: 'text-green-600', description: 'Pedido entregado exitosamente' },
    { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'text-red-600', description: 'Pedido cancelado' }
  ];

  const selectedStatus = statusOptions.find(s => s.value === formData.newStatus);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateNewOrderId = () => {
    const newId = 'TEST-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData(prev => ({ ...prev, orderId: newId }));
  };

  const sendTestEmail = async () => {
    if (!formData.customerName || !formData.customerEmail) {
      setMessage({ type: 'error', text: 'Por favor, completa el nombre y email del cliente' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const requestData = {
        ...formData,
        items: [
          { productName: 'Agenda Personalizada Premium', quantity: 1, price: 35.99 },
          { productName: 'Taza Mágica con Foto', quantity: 2, price: 22.50 }
        ],
        total: 80.99
      };

      const response = await fetch('/api/admin/test-status-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `✅ Email enviado exitosamente a ${formData.customerEmail}` 
        });
        // Generar nuevo ID para próxima prueba
        generateNewOrderId();
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Error: ${data.error || 'No se pudo enviar el email'}` 
        });
      }
    } catch (error) {
      console.error('Error al enviar email de prueba:', error);
      setMessage({ 
        type: 'error', 
        text: '❌ Error de conexión. Verifica tu internet e inténtalo de nuevo.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Mail className="w-6 h-6 text-[#68c3b7] mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Prueba de Emails de Estado</h3>
            <p className="text-sm text-gray-600">Envía emails de prueba para diferentes estados de pedido</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Formulario */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID del Pedido
            </label>
            <div className="flex">
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="TEST-ABC123"
              />
              <button
                onClick={generateNewOrderId}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm hover:bg-gray-200 transition-colors"
                title="Generar nuevo ID"
              >
                🔄
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email del Cliente *
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              placeholder="juan@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Pedido *
            </label>
            <select
              value={formData.newStatus}
              onChange={(e) => handleInputChange('newStatus', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
            >
              {statusOptions.map((status) => {
                const Icon = status.icon;
                return (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Estado seleccionado */}
        {selectedStatus && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <selectedStatus.icon className={`w-5 h-5 ${selectedStatus.color} mr-2`} />
              <span className="font-medium text-gray-900">{selectedStatus.label}</span>
            </div>
            <p className="text-sm text-gray-600">{selectedStatus.description}</p>
          </div>
        )}

        {/* Campos opcionales */}
        {formData.newStatus === 'shipped' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Seguimiento
              </label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="MP123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entrega Estimada
              </label>
              <input
                type="text"
                value={formData.estimatedDelivery}
                onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="3-5 días hábiles"
              />
            </div>
          </div>
        )}

        {formData.newStatus === 'cancelled' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón de Cancelación
            </label>
            <input
              type="text"
              value={formData.cancellationReason}
              onChange={(e) => handleInputChange('cancellationReason', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
              placeholder="Producto sin stock"
            />
          </div>
        )}

        {/* Mensaje de estado */}
        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.text}
              </span>
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <div className="flex justify-end">
          <button
            onClick={sendTestEmail}
            disabled={isLoading || !formData.customerName || !formData.customerEmail}
            className="flex items-center px-6 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#64b7ac] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Email de Prueba
              </>
            )}
          </button>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Información de prueba:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Se incluirán productos de ejemplo en el email</li>
                <li>• Total del pedido: $80.99</li>
                <li>• El email se enviará con el template real que verán los clientes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
