'use client';

import { useState } from 'react';
import { Package, Truck, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

interface TrackingManagerProps {
  orderId: string;
  currentTracking?: string;
  currentShippingUrl?: string;
  paymentMethod?: 'mercadopago' | 'cash_on_pickup';
  paymentStatus?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  customerEmail?: string;
  customerName?: string;
  onUpdate?: (success: boolean, message: string) => void;
}

export default function TrackingManager({ 
  orderId, 
  currentTracking, 
  currentShippingUrl,
  paymentMethod,
  paymentStatus,
  customerEmail,
  customerName,
  onUpdate 
}: TrackingManagerProps) {
  const [trackingNumber, setTrackingNumber] = useState(currentTracking || '');
  const [shippingUrl, setShippingUrl] = useState(currentShippingUrl || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  // Solo mostrar para pedidos pagados por MercadoPago que estén aprobados
  if (paymentMethod !== 'mercadopago' || paymentStatus !== 'approved') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setMessage('Por favor ingresa un número de tracking');
      return;
    }

    setIsUpdating(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/orders/tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          trackingNumber: trackingNumber.trim(),
          shippingUrl: shippingUrl.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Número de seguimiento actualizado y cliente notificado');
        onUpdate?.(true, 'Tracking actualizado exitosamente');
      } else {
        setMessage(`❌ Error: ${data.error}`);
        onUpdate?.(false, data.error);
      }
    } catch (error) {
      const errorMsg = 'Error al actualizar el tracking';
      setMessage(`❌ ${errorMsg}`);
      onUpdate?.(false, errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyTrackingNumber = () => {
    if (trackingNumber) {
      const copyText = shippingUrl 
        ? `${trackingNumber}\n${shippingUrl}` 
        : trackingNumber;
      navigator.clipboard.writeText(copyText);
      setMessage('📋 Información de tracking copiada al portapapeles');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">Información de Envío</span>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">MercadoPago</span>
        </div>
        {(currentTracking || currentShippingUrl) && (
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle className="h-3 w-3" />
            Configurado
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la Empresa de Envíos
            </label>
            <input
              type="url"
              value={shippingUrl}
              onChange={(e) => setShippingUrl(e.target.value)}
              placeholder="https://ejemplo-empresa-envios.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUpdating}
            />
            <p className="text-xs text-gray-500 mt-1">
              URL principal de la empresa de envíos para referencia del cliente
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Seguimiento
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ingresa el código de seguimiento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating || !trackingNumber.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </div>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>

        {trackingNumber && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyTrackingNumber}
              className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Copy className="h-3 w-3" />
              Copiar
            </button>
            {shippingUrl && (
              <button
                type="button"
                onClick={() => window.open(shippingUrl, '_blank')}
                className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir Sitio Web
              </button>
            )}
          </div>
        )}
        
        {message && (
          <div className={`flex items-start gap-2 text-sm p-3 rounded-md ${
            message.includes('❌') 
              ? 'text-red-700 bg-red-50 border border-red-200' 
              : message.includes('✅')
              ? 'text-green-700 bg-green-50 border border-green-200'
              : 'text-blue-700 bg-blue-50 border border-blue-200'
          }`}>
            {message.includes('❌') ? (
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : message.includes('✅') ? (
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Package className="h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}
      </form>

      {customerEmail && (
        <div className="border-t border-gray-200 pt-3">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Cliente: <span className="font-medium text-gray-700">{customerName}</span></div>
            <div>Email: <span className="font-medium text-gray-700">{customerEmail}</span></div>
            <div className="text-gray-400">
              ℹ️ Al guardar el tracking se enviará automáticamente un email al cliente
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
