'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function EmailConfigPage() {
  const { data: session } = useSession();
  const [config, setConfig] = useState({
    EMAIL_FROM: '',
    EMAIL_FROM_NAME: '',
    EMAIL_ADMIN: '',
    EMAIL_HOST: '',
    EMAIL_PORT: '',
    EMAIL_USER: '',
    EMAIL_PASSWORD: '',
    EMAIL_SECURE: 'true'
  });
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    message?: string;
    details?: string;
    [key: string]: unknown;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCurrentConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/email');
      const data = await response.json();
      setConfig(data);
      setResult({ success: true, message: 'Configuración cargada exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error al cargar configuración' });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error al actualizar configuración' });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: config.EMAIL_ADMIN || config.EMAIL_FROM })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error al enviar email de prueba' });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className="p-4">Necesitas estar logueado para ver esta página</div>;
  }

  // Solo permitir al admin principal
  const adminEmails = ['d86webs@gmail.com', 'coderflixarg@gmail.com'];
  if (!adminEmails.includes(session.user?.email || '')) {
    return <div className="p-4">Solo el administrador principal puede acceder a esta configuración</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">⚙️ Configuración de Emails</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p><strong>Usuario:</strong> {session.user?.email}</p>
        <p className="text-sm text-gray-600 mt-2">
          ⚠️ Estos cambios afectan las variables de entorno de Vercel. 
          Los emails de notificaciones y recuperación de contraseña usarán esta configuración.
        </p>
      </div>

      <div className="space-y-6">
        {/* Cargar configuración actual */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">1. Cargar Configuración Actual</h2>
          <button
            onClick={fetchCurrentConfig}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : '📥 Cargar Configuración'}
          </button>
        </div>

        {/* Configuración de emails */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">2. Configuración de Emails</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Remitente (FROM):</label>
              <input
                type="email"
                value={config.EMAIL_FROM}
                onChange={(e) => setConfig({...config, EMAIL_FROM: e.target.value})}
                placeholder="info@tutienda.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Email que aparece como remitente</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nombre Remitente:</label>
              <input
                type="text"
                value={config.EMAIL_FROM_NAME}
                onChange={(e) => setConfig({...config, EMAIL_FROM_NAME: e.target.value})}
                placeholder="Verde Agua Personalizados"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Admin (notificaciones):</label>
              <input
                type="email"
                value={config.EMAIL_ADMIN}
                onChange={(e) => setConfig({...config, EMAIL_ADMIN: e.target.value})}
                placeholder="admin@tutienda.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Email que recibe notificaciones de pedidos</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Servidor SMTP:</label>
              <input
                type="text"
                value={config.EMAIL_HOST}
                onChange={(e) => setConfig({...config, EMAIL_HOST: e.target.value})}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Puerto SMTP:</label>
              <input
                type="text"
                value={config.EMAIL_PORT}
                onChange={(e) => setConfig({...config, EMAIL_PORT: e.target.value})}
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Usuario SMTP:</label>
              <input
                type="email"
                value={config.EMAIL_USER}
                onChange={(e) => setConfig({...config, EMAIL_USER: e.target.value})}
                placeholder="tu-email@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Contraseña SMTP:</label>
              <input
                type="password"
                value={config.EMAIL_PASSWORD}
                onChange={(e) => setConfig({...config, EMAIL_PASSWORD: e.target.value})}
                placeholder="tu-contraseña-de-aplicación"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Para Gmail usar contraseña de aplicación</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Conexión Segura:</label>
              <select
                value={config.EMAIL_SECURE}
                onChange={(e) => setConfig({...config, EMAIL_SECURE: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="false">No (puerto 587)</option>
                <option value="true">Sí (puerto 465)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 space-x-4">
            <button
              onClick={updateConfig}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : '💾 Guardar Configuración'}
            </button>
            
            <button
              onClick={sendTestEmail}
              disabled={loading || !config.EMAIL_ADMIN}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : '📧 Enviar Email de Prueba'}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {result && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Resultado</h2>
            
            {result.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-green-800">✅ {result.message}</p>
              </div>
            )}
            
            {result.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-800">❌ {result.error}</p>
                {result.details && (
                  <p className="text-red-600 text-sm mt-2">{result.details}</p>
                )}
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">🔍 Datos Raw</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
