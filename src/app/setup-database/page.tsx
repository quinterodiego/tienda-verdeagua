'use client';

import { useState } from 'react';

export default function DatabaseSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMigration = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage('¡Migración completada exitosamente! Los productos han sido copiados a Google Sheets.');
      } else {
        setError(data.message || 'Error en la migración');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Configuración de Base de Datos
          </h1>

          <div className="space-y-8">
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">
                📋 Instrucciones para configurar Google Sheets
              </h2>
              <div className="space-y-3 text-blue-700">
                <p>1. <strong>Lee el archivo GOOGLE_SHEETS_SETUP.md</strong> para configurar las credenciales</p>
                <p>2. <strong>Crea un Google Sheet</strong> llamado "Verde Agua DB"</p>
                <p>3. <strong>Configura las variables de entorno</strong> en .env.local</p>
                <p>4. <strong>Ejecuta la migración</strong> usando el botón de abajo</p>
              </div>
            </div>

            {/* Estado de configuración */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-4">
                ⚙️ Estado de Configuración
              </h2>
              <div className="space-y-2 text-yellow-700">
                <p>• Google Sheet ID: {process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID ? '✅ Configurado' : '❌ No configurado'}</p>
                <p>• Service Account: {process.env.GOOGLE_CLIENT_EMAIL ? '✅ Configurado' : '❌ No configurado'}</p>
                <p>• Variables necesitas: GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, etc.</p>
              </div>
            </div>

            {/* Migración */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-800 mb-4">
                🚀 Migrar Datos a Google Sheets
              </h2>
              <p className="text-green-700 mb-4">
                Esto copiará todos tus productos actuales a Google Sheets y configurará las pestañas necesarias.
              </p>
              
              <button
                onClick={handleMigration}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {isLoading ? 'Migrando...' : 'Ejecutar Migración'}
              </button>
            </div>

            {/* Mensajes */}
            {message && (
              <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Datos actuales */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                📊 Datos Actuales
              </h2>
              <div className="space-y-2 text-gray-600">
                <p>• Productos en el catálogo: 10</p>
                <p>• Categorías: Agendas, Tazas, Llaveros, Stickers, etc.</p>
                <p>• Una vez migrado, los datos se sincronizarán con Google Sheets</p>
              </div>
            </div>

            {/* Qué se incluye */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-800 mb-4">
                📦 Qué se incluye en la migración
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-700">
                <div>
                  <h3 className="font-semibold">Productos</h3>
                  <ul className="text-sm space-y-1">
                    <li>• ID y nombre</li>
                    <li>• Descripción</li>
                    <li>• Precio y stock</li>
                    <li>• Categoría</li>
                    <li>• Imagen</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Pedidos</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Información del cliente</li>
                    <li>• Items del pedido</li>
                    <li>• Estado del pedido</li>
                    <li>• Dirección de envío</li>
                    <li>• Información de pago</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Usuarios</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Nombre y email</li>
                    <li>• Fecha de registro</li>
                    <li>• Historial de pedidos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
