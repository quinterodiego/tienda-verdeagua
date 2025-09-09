import React from 'react';

export default function DynamicAdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              🔧 Test Sistema Dinámico de Administradores
            </h1>
            <p className="mt-2 text-gray-600">
              Página para probar y verificar el funcionamiento del sistema dinámico de administradores
            </p>
          </div>
          
          <div className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sistema Dinámico Implementado
              </h2>
              
              <p className="text-gray-600 mb-8">
                El sistema de administradores ahora obtiene la información dinámicamente desde Google Sheets
                en lugar de usar emails hardcodeados en el código.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Características Implementadas</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Administradores obtenidos desde Google Sheets</li>
                    <li>• Cache para optimizar consultas (5 minutos)</li>
                    <li>• Fallback en caso de errores de API</li>
                    <li>• Invalidación automática de cache</li>
                    <li>• Endpoints de debug actualizados</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">🔧 Para Probar el Sistema</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Visita /api/debug/dynamic-admin-test</li>
                    <li>• Verifica /api/debug/access-check</li>
                    <li>• Usa /api/debug/session-check</li>
                    <li>• Prueba el panel de administración</li>
                    <li>• Cambia roles en Google Sheets y verifica</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">📋 Gestión de Administradores</h3>
                <p className="text-sm text-yellow-700">
                  Para agregar o quitar administradores, simplemente edita el rol del usuario en la hoja 
                  &quot;Usuarios&quot; de Google Sheets. Los cambios se reflejarán automáticamente (cache de 5 minutos).
                </p>
              </div>
              
              <div className="mt-6">
                <a 
                  href="/api/debug/dynamic-admin-test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🧪 Probar Sistema Dinámico
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
