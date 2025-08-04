'use client';

import { useState, useEffect } from 'react';
import { Eye, Send, Smartphone, Monitor, RefreshCw, Mail, Settings } from 'lucide-react';
import type { WelcomeEmailData, OrderEmailData, TestEmailData } from '@/types/email';

interface EmailPreviewPanelProps {
  onSendTest?: (result: { success: boolean; message: string }) => void;
}

interface PreviewData {
  welcome: WelcomeEmailData;
  order: OrderEmailData;
  custom: {
    subject: string;
    message: string;
  };
}

export default function EmailPreviewPanel({ onSendTest }: EmailPreviewPanelProps) {
  const [activeTemplate, setActiveTemplate] = useState<'welcome' | 'order' | 'custom'>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  // Datos de prueba editables
  const [previewData, setPreviewData] = useState<PreviewData>({
    welcome: {
      userName: 'María González',
      userEmail: 'maria@ejemplo.com',
    },
    order: {
      orderId: 'VA-' + Date.now(),
      customerName: 'Carlos Rodríguez',
      customerEmail: 'carlos@ejemplo.com',
      items: [
        { productName: 'Taza Personalizada "Mejor Papá"', quantity: 2, price: 899.99 },
        { productName: 'Remera Premium con Diseño', quantity: 1, price: 1499.99 },
        { productName: 'Mouse Pad Personalizado', quantity: 3, price: 599.99 },
      ],
      total: 4799.95,
      orderDate: new Date().toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    },
    custom: {
      subject: '¡Nueva Colección Disponible!',
      message: 'Te invitamos a descubrir nuestra nueva colección de productos personalizados. Diseños únicos y calidad premium te están esperando.',
    }
  });

  // Generar preview del email actual
  const generatePreview = async () => {
    try {
      setIsLoading(true);
      
      let testData: TestEmailData;
      
      if (activeTemplate === 'custom') {
        testData = {
          recipientEmail: 'preview@ejemplo.com',
          testType: 'custom',
          customSubject: previewData.custom.subject,
          customMessage: previewData.custom.message,
        };
      } else {
        testData = {
          recipientEmail: 'preview@ejemplo.com',
          testType: activeTemplate === 'welcome' ? 'welcome' : 'order_confirmation',
        };
      }

      const response = await fetch('/api/notifications/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testData,
          previewData: activeTemplate !== 'custom' ? previewData[activeTemplate] : undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPreviewHtml(result.html);
      } else {
        console.error('Error generando preview');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar email de prueba
  const handleSendTest = async () => {
    if (!recipientEmail) {
      onSendTest?.({ success: false, message: 'Ingresa un email para enviar la prueba' });
      return;
    }

    setIsLoading(true);
    try {
      let testData: TestEmailData;
      
      if (activeTemplate === 'custom') {
        testData = {
          recipientEmail,
          testType: 'custom',
          customSubject: previewData.custom.subject,
          customMessage: previewData.custom.message,
        };
      } else {
        testData = {
          recipientEmail,
          testType: activeTemplate === 'welcome' ? 'welcome' : 'order_confirmation',
        };
      }

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testData,
          previewData: activeTemplate !== 'custom' ? previewData[activeTemplate] : undefined,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        onSendTest?.({ 
          success: true, 
          message: `Email de prueba enviado a ${recipientEmail}` 
        });
      } else {
        onSendTest?.({ 
          success: false, 
          message: result.error || 'Error al enviar email de prueba' 
        });
      }
    } catch (error) {
      onSendTest?.({ 
        success: false, 
        message: 'Error de conexión al enviar email' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar datos de prueba
  const updatePreviewData = (template: keyof PreviewData, field: string, value: any) => {
    setPreviewData(prev => ({
      ...prev,
      [template]: {
        ...prev[template],
        [field]: value,
      }
    }));
  };

  // Actualizar item del pedido
  const updateOrderItem = (index: number, field: string, value: any) => {
    setPreviewData(prev => ({
      ...prev,
      order: {
        ...prev.order,
        items: prev.order.items.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        ),
      }
    }));
  };

  // Recalcular total del pedido
  useEffect(() => {
    const total = previewData.order.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    setPreviewData(prev => ({
      ...prev,
      order: {
        ...prev.order,
        total,
      }
    }));
  }, [previewData.order.items]);

  // Generar preview al cambiar template o datos
  useEffect(() => {
    generatePreview();
  }, [activeTemplate, previewData]);

  const templates = [
    { id: 'welcome', label: 'Bienvenida', icon: '👋' },
    { id: 'order', label: 'Confirmación de Pedido', icon: '📦' },
    { id: 'custom', label: 'Personalizado', icon: '✨' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Vista Previa de Emails</h3>
        </div>
        <p className="text-blue-100 mt-2">
          Personaliza y prueba tus templates de email en tiempo real
        </p>
      </div>

      <div className="flex flex-col lg:flex-row h-[800px]">
        {/* Panel de Control */}
        <div className="w-full lg:w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Selector de Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Email
              </label>
              <div className="grid grid-cols-1 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setActiveTemplate(template.id as any)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      activeTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <span className="font-medium">{template.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor de Datos según Template */}
            {activeTemplate === 'welcome' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Datos de Bienvenida</h4>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre del Usuario</label>
                  <input
                    type="text"
                    value={previewData.welcome.userName}
                    onChange={(e) => updatePreviewData('welcome', 'userName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email del Usuario</label>
                  <input
                    type="email"
                    value={previewData.welcome.userEmail}
                    onChange={(e) => updatePreviewData('welcome', 'userEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  />
                </div>
              </div>
            )}

            {activeTemplate === 'order' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Datos del Pedido</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">ID Pedido</label>
                    <input
                      type="text"
                      value={previewData.order.orderId}
                      onChange={(e) => updatePreviewData('order', 'orderId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cliente</label>
                    <input
                      type="text"
                      value={previewData.order.customerName}
                      onChange={(e) => updatePreviewData('order', 'customerName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Productos</label>
                  {previewData.order.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg mb-3">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => updateOrderItem(index, 'productName', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                        placeholder="Nombre del producto"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Cant."
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Precio"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewData(prev => ({
                        ...prev,
                        order: {
                          ...prev.order,
                          items: [...prev.order.items, { productName: 'Producto Nuevo', quantity: 1, price: 299.99 }]
                        }
                      }));
                    }}
                    className="w-full bg-gray-100 text-gray-600 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm border border-dashed border-gray-300"
                  >
                    + Agregar Producto
                  </button>
                </div>
              </div>
            )}

            {activeTemplate === 'custom' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Email Personalizado</h4>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Asunto</label>
                  <input
                    type="text"
                    value={previewData.custom.subject}
                    onChange={(e) => updatePreviewData('custom', 'subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mensaje</label>
                  <textarea
                    rows={4}
                    value={previewData.custom.message}
                    onChange={(e) => updatePreviewData('custom', 'message', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Envío de Prueba */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Enviar Prueba</h4>
              <div className="space-y-3">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Email para enviar prueba"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                />
                <button
                  onClick={handleSendTest}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Enviar Prueba
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="flex-1 flex flex-col">
          {/* Controles de Vista */}
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Móvil
              </button>
            </div>
            
            <button
              onClick={generatePreview}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 p-4 bg-gray-50 overflow-auto">
            <div 
              className={`mx-auto bg-white shadow-lg transition-all duration-300 ${
                previewMode === 'mobile' 
                  ? 'max-w-sm' 
                  : 'max-w-2xl'
              }`}
              style={{ minHeight: '600px' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Generando vista previa...</p>
                  </div>
                </div>
              ) : (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full min-h-[600px] border-0"
                  title="Vista previa del email"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
