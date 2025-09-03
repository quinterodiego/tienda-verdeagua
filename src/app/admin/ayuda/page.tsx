'use client';

import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminAyudaPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HelpCircle className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Centro de Ayuda - Administración</h1>
                <p className="text-gray-600">Guía completa para administrar tu tienda</p>
              </div>
            </div>
            <Link 
              href="/admin"
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Admin
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-8">
            {/* Gestión de Productos */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Productos</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Añadir Productos</h3>
                  <p className="text-blue-700 text-sm">
                    Ve a la sección de productos y usa el botón "Agregar Producto" para crear nuevos elementos en tu catálogo.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Editar Productos</h3>
                  <p className="text-green-700 text-sm">
                    Haz clic en cualquier producto existente para modificar sus detalles, precios o imágenes.
                  </p>
                </div>
              </div>
            </section>

            {/* Gestión de Pedidos */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Pedidos</h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Estados de Pedidos</h3>
                  <p className="text-yellow-700 text-sm">
                    Los pedidos pueden estar en diferentes estados: Pendiente, Procesando, Enviado, Entregado.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">Actualizar Estado</h3>
                  <p className="text-purple-700 text-sm">
                    Cambia el estado de los pedidos desde la sección de administración para mantener informados a tus clientes.
                  </p>
                </div>
              </div>
            </section>

            {/* Configuración */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Ajustes Generales</h3>
                <p className="text-gray-700 text-sm">
                  Configura los aspectos generales de tu tienda desde la sección de configuración del panel de administración.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
