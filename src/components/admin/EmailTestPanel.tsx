'use client';

import { useState } from 'react';
import type { TestEmailData } from '@/types/email';

interface EmailTestPanelProps {
  onSendTest?: (result: { success: boolean; message: string }) => void;
}

export default function EmailTestPanel({ onSendTest }: EmailTestPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TestEmailData>({
    recipientEmail: '',
    testType: 'welcome',
    customSubject: '',
    customMessage: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientEmail) {
      onSendTest?.({ success: false, message: 'El email del destinatario es requerido' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok) {
        onSendTest?.({ 
          success: true, 
          message: `Email de prueba enviado exitosamente a ${formData.recipientEmail}` 
        });
        // Limpiar form solo si es exitoso
        if (formData.testType !== 'custom') {
          setFormData(prev => ({ ...prev, recipientEmail: '' }));
        }
      } else {
        onSendTest?.({ 
          success: false, 
          message: result.error || 'Error al enviar el email de prueba' 
        });
      }
    } catch (error) {
      onSendTest?.({ 
        success: false, 
        message: 'Error de conexión al enviar el email' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof TestEmailData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800">
          Panel de Pruebas de Email
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email del destinatario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email del destinatario *
          </label>
          <input
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            placeholder="destinatario@ejemplo.com"
            required
          />
        </div>

        {/* Tipo de email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de email de prueba
          </label>
          <select
            value={formData.testType}
            onChange={(e) => handleInputChange('testType', e.target.value as TestEmailData['testType'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          >
            <option value="welcome">Email de Bienvenida</option>
            <option value="order_confirmation">Confirmación de Pedido</option>
            <option value="custom">Email Personalizado</option>
          </select>
        </div>

        {/* Campos para email personalizado */}
        {formData.testType === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto personalizado
              </label>
              <input
                type="text"
                value={formData.customSubject || ''}
                onChange={(e) => handleInputChange('customSubject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Asunto del email..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje personalizado
              </label>
              <textarea
                value={formData.customMessage || ''}
                onChange={(e) => handleInputChange('customMessage', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mensaje del email..."
              />
            </div>
          </>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </span>
          ) : (
            'Enviar Email de Prueba'
          )}
        </button>
      </form>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Información:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Bienvenida:</strong> Simula el email que reciben los nuevos usuarios</li>
          <li>• <strong>Confirmación:</strong> Simula el email de confirmación de pedido</li>
          <li>• <strong>Personalizado:</strong> Permite crear un mensaje personalizado</li>
        </ul>
      </div>
    </div>
  );
}
