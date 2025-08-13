'use client';

import React from 'react';
import { HelpCircle, Package, CreditCard, Truck, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-[#68c3b7] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
          </div>
          <p className="text-lg text-gray-600">
            Encuentra respuestas a las preguntas más frecuentes sobre tu experiencia de compra
          </p>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-6">
          {/* Estados del Pedido */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-[#68c3b7] mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Estados del Pedido</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Pendiente</h3>
                  <p className="text-sm text-gray-600">Tu pedido ha sido recibido y está siendo procesado.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-blue-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Procesando</h3>
                  <p className="text-sm text-gray-600">Estamos preparando tu pedido para el envío.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-purple-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Enviado</h3>
                  <p className="text-sm text-gray-600">Tu pedido está en camino hacia tu dirección.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-green-400 rounded-full mt-2 mr-3"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Entregado</h3>
                  <p className="text-sm text-gray-600">Tu pedido ha sido entregado exitosamente.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pagos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-6 h-6 text-[#68c3b7] mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Pagos y Facturación</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">¿Qué métodos de pago aceptan?</h3>
                <p className="text-sm text-gray-600">Aceptamos MercadoPago con todas las opciones disponibles: tarjetas de crédito, débito, efectivo y transferencias.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">¿Cuándo se procesa el pago?</h3>
                <p className="text-sm text-gray-600">El pago se procesa inmediatamente al confirmar tu pedido a través de MercadoPago.</p>
              </div>
            </div>
          </div>

          {/* Envíos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Truck className="w-6 h-6 text-[#68c3b7] mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Envíos y Entregas</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">¿Cuánto tiempo tarda el envío?</h3>
                <p className="text-sm text-gray-600">Los envíos dentro de la ciudad tardan de 24 a 48 horas. Envíos a otras ciudades pueden tardar de 3 a 5 días hábiles.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">¿Puedo rastrear mi pedido?</h3>
                <p className="text-sm text-gray-600">Sí, puedes consultar el estado de tu pedido en la sección "Mis Pedidos" de tu cuenta.</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">¿No encuentras lo que buscas?</h2>
            <p className="text-gray-600 mb-4">Contáctanos directamente y te ayudaremos con cualquier consulta:</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <Phone className="w-5 h-5 text-[#68c3b7] mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Teléfono</div>
                  <div className="text-sm text-gray-600">+57 123 456 7890</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <Mail className="w-5 h-5 text-[#68c3b7] mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">ayuda@tienda.com</div>
                </div>
              </div>
              
              <Link 
                href="/contacto"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPin className="w-5 h-5 text-[#68c3b7] mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Formulario</div>
                  <div className="text-sm text-gray-600">Contáctanos aquí</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Enlace específico para errores de pago */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">¿Problemas con el pago?</h3>
            <p className="text-red-700 mb-4">
              Si experimentas dificultades durante el proceso de pago, tenemos una guía específica para ayudarte.
            </p>
            <Link 
              href="/ayuda/errores-de-pago"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Ver guía de errores de pago
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
