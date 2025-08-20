'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function EmailNotificationConfig() {
  const { data: session } = useSession();
  const [adminEmail, setAdminEmail] = useState('');
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const updateNotificationEmail = async () => {
    if (!adminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      setResult({ error: 'Por favor ingresa un email válido' });
      return;
    }

    setLoading(true);
    try {
      setResult({
        success: true,
        message: `✅ Configuración lista para actualizar:\n\n1. Ve a Vercel: https://vercel.com/dashboard\n2. Selecciona tu proyecto\n3. Ve a Settings > Environment Variables\n4. Actualiza la variable EMAIL_ADMIN con: ${adminEmail}\n5. Redeploy el proyecto\n\nUna vez hecho esto, todas las notificaciones de pedidos se enviarán a: ${adminEmail}`
      });
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error al procesar la solicitud' });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Necesitas estar logueado para ver esta página</p>
        </div>
      </div>
    );
  }

  // Solo permitir al admin principal
  if (session.user?.email !== 'd86webs@gmail.com') {
    return (
      <div className="max-w-md mx-auto p-6 mt-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Solo el administrador principal puede acceder a esta configuración</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          📧 Configurar Email de Notificaciones
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Usuario actual:</strong> {session.user?.email}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            ℹ️ Cambia el email donde recibes las notificaciones de nuevos pedidos y estados de pago.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Email para Notificaciones:
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="ejemplo: admin@tutienda.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              Este email recibirá las notificaciones cuando:
            </p>
            <ul className="text-xs text-gray-500 mt-1 ml-4 list-disc">
              <li>Se cree un nuevo pedido</li>
              <li>Se confirme un pago</li>
              <li>Haya algún problema con un pago</li>
            </ul>
          </div>

          <button
            onClick={updateNotificationEmail}
            disabled={loading || !adminEmail}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Procesando...' : '💾 Configurar Email de Notificaciones'}
          </button>

          {result && (
            <div className="mt-6">
              {result.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-green-800 whitespace-pre-line">
                    {result.message}
                  </div>
                </div>
              )}
              
              {result.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">❌ {result.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📝 Pasos a seguir:</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Ingresa el nuevo email arriba</li>
              <li>Haz clic en &quot;Configurar Email&quot;</li>
              <li>Sigue las instrucciones para actualizar en Vercel</li>
              <li>¡Listo! Empezarás a recibir notificaciones en el nuevo email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
