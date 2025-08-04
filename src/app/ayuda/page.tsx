'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle, CreditCard, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AyudaPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'estados-pedido': false, // Expandir por defecto la sección de estados
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Centro de Ayuda</h1>
          <p className="text-lg text-gray-600">
            Encuentra respuestas a las preguntas más frecuentes sobre tu experiencia de compra
          </p>
        </div>

        {/* Navegación rápida */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Navegación rápida</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => toggleSection('estados-pedido')}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5 text-[#68c3b7] mr-3" />
              <span className="text-sm font-medium text-gray-600">Estados del Pedido</span>
            </button>
            <button
              onClick={() => toggleSection('pagos')}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="w-5 h-5 text-[#68c3b7] mr-3" />
              <span className="text-sm font-medium text-gray-600">Pagos y Facturación</span>
            </button>
            <button
              onClick={() => toggleSection('envios')}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Truck className="w-5 h-5 text-[#68c3b7] mr-3" />
              <span className="text-sm font-medium text-gray-600">Envíos y Entregas</span>
            </button>
          </div>
        </div> */}

        {/* Contenido de ayuda */}
        <div className="space-y-6">
          
          {/* Estados del Pedido */}
          <div className="bg-white rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection('estados-pedido')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center">
                <Package className="w-6 h-6 text-[#68c3b7] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Estados del Pedido</h2>
              </div>
              {expandedSections['estados-pedido'] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections['estados-pedido'] && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <p className="text-gray-600 mb-6">
                  Conoce qué significa cada estado de tu pedido y qué puedes esperar en cada etapa del proceso.
                </p>

                <div className="space-y-6">
                  {/* Pending */}
                  <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pendiente</h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        <strong>¿Qué significa?</strong> Tu pedido ha sido recibido y está esperando confirmación de pago.
                      </p>
                      <ul className="text-yellow-700 text-sm space-y-1">
                        <li>• El pago está siendo procesado</li>
                        <li>• Verificando disponibilidad de stock</li>
                        <li>• Puedes cancelar el pedido sin restricciones</li>
                      </ul>
                    </div>
                  </div>

                  {/* Confirmed */}
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Confirmado</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        <strong>¿Qué significa?</strong> Tu pago ha sido verificado y el pedido está confirmado.
                      </p>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Pago aprobado exitosamente</li>
                        <li>• Stock reservado para tu pedido</li>
                        <li>• Pronto comenzaremos a prepararlo</li>
                      </ul>
                    </div>
                  </div>

                  {/* Processing */}
                  <div className="flex items-start space-x-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-teal-800 mb-2">Procesando</h3>
                      <p className="text-teal-700 text-sm mb-3">
                        <strong>¿Qué significa?</strong> Estamos preparando y empaquetando tu pedido.
                      </p>
                      <ul className="text-teal-700 text-sm space-y-1">
                        <li>• Productos siendo empaquetados</li>
                        <li>• Preparación para envío</li>
                        <li>• Ya no es posible cancelar fácilmente</li>
                      </ul>
                    </div>
                  </div>

                  {/* Shipped */}
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-purple-800 mb-2">Enviado</h3>
                      <p className="text-purple-700 text-sm mb-3">
                        <strong>¿Qué significa?</strong> Tu pedido está en camino hacia tu dirección.
                      </p>
                      <ul className="text-purple-700 text-sm space-y-1">
                        <li>• Paquete entregado al transportista</li>
                        <li>• Recibirás un código de seguimiento</li>
                        <li>• Puedes rastrear tu envío</li>
                      </ul>
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Entregado</h3>
                      <p className="text-green-700 text-sm mb-3">
                        <strong>¿Qué significa?</strong> ¡Tu pedido ha sido entregado exitosamente!
                      </p>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Pedido completado exitosamente</li>
                        <li>• Puedes calificar tu experiencia</li>
                        <li>• Opción de "volver a comprar" disponible</li>
                      </ul>
                    </div>
                  </div>

                  {/* Cancelled */}
                  <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">Cancelado</h3>
                      <p className="text-red-700 text-sm mb-3">
                        <strong>¿Qué significa?</strong> El pedido ha sido cancelado por alguna razón.
                      </p>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>• Puede ser por cancelación del cliente</li>
                        <li>• Problemas con el pago</li>
                        <li>• Falta de stock</li>
                        <li>• Si fue por pago fallido, puedes recomprar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Flujo típico */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">🔄 Flujo típico de un pedido:</h4>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 overflow-x-auto">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded whitespace-nowrap">Pendiente</span>
                    <span>→</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">Confirmado</span>
                    <span>→</span>
                    <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded whitespace-nowrap">Procesando</span>
                    <span>→</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded whitespace-nowrap">Enviado</span>
                    <span>→</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">Entregado</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    * Los pedidos pueden cancelarse desde cualquier estado antes de "Enviado"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagos y Facturación */}
          <div className="bg-white rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection('pagos')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center">
                <CreditCard className="w-6 h-6 text-[#68c3b7] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Pagos y Facturación</h2>
              </div>
              {expandedSections['pagos'] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections['pagos'] && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Métodos de pago aceptados</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>• MercadoPago (tarjetas de crédito y débito)</li>
                      <li>• Pago en efectivo al retirar</li>
                      <li>• Transferencia bancaria</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Qué hacer si mi pago fue rechazado?</h3>
                    <p className="text-gray-600 mb-2">
                      Si tu pago fue rechazado, puedes:
                    </p>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Verificar los datos de tu tarjeta</li>
                      <li>• Intentar con otro método de pago</li>
                      <li>• Contactar a tu banco</li>
                      <li>• <Link href="/ayuda/errores-de-pago" className="text-[#68c3b7] hover:underline">Ver guía detallada de errores de pago</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Envíos y Entregas */}
          <div className="bg-white rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection('envios')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center">
                <Truck className="w-6 h-6 text-[#68c3b7] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Envíos y Entregas</h2>
              </div>
              {expandedSections['envios'] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections['envios'] && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Opciones de entrega</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>• <strong>Retiro en local:</strong> Sin costo adicional</li>
                      <li>• <strong>Envío a domicilio:</strong> Costo según zona</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tiempos de entrega</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Procesamiento: 24-48 horas</li>
                      <li>• Envío: 2-5 días hábiles</li>
                      <li>• Retiro en local: 2-4 horas después de la confirmación</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection('contacto')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center">
                <Mail className="w-6 h-6 text-[#68c3b7] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">¿Necesitas más ayuda?</h2>
              </div>
              {expandedSections['contacto'] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections['contacto'] && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <p className="text-gray-600 mb-4">
                  Si no encontraste la respuesta que buscabas, no dudes en contactarnos:
                </p>
                <div className="space-y-3">
                  <Link 
                    href="/contacto"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#68c3b7] mr-3" />
                    <span className="text-gray-900">Enviar mensaje</span>
                  </Link>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <Phone className="w-5 h-5 text-[#68c3b7] mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Teléfono</p>
                        <p className="text-sm text-gray-600">+54 9 11 1234-5678</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <MapPin className="w-5 h-5 text-[#68c3b7] mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Horarios</p>
                        <p className="text-sm text-gray-600">Lun-Vie 9:00-18:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer de ayuda */}
        <div className="mt-12 text-center">
          <div className="bg-[#68c3b7] bg-opacity-10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Esta información te fue útil?</h3>
            <p className="text-gray-600 mb-4">
              Estamos constantemente mejorando nuestro centro de ayuda
            </p>
            <Link 
              href="/contacto"
              className="inline-flex items-center px-6 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#64b7ac] transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Sugerir mejoras
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
