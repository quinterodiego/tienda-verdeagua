'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface TestResult {
  success?: boolean;
  error?: string;
  message?: string;
  messageId?: string;
  details?: string;
  emailConfig?: {
    host?: string;
    port?: string;
    secure?: string;
    user?: string;
    from?: string;
    admin?: string;
  };
}

export default function EmailDebugPage() {
  const { data: session } = useSession();
  const [testEmail, setTestEmail] = useState('');
  const [testType, setTestType] = useState<'smtp' | 'advanced' | 'welcome' | 'order' | 'admin_notification'>('smtp');
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runEmailTest = async () => {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      setResult({ error: 'Por favor ingresa un email válido' });
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (testType === 'smtp') {
        // Test básico SMTP
        response = await fetch('/api/debug/email/smtp-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testEmail })
        });
      } else if (testType === 'advanced') {
        // Test avanzado SMTP con múltiples configuraciones
        response = await fetch('/api/debug/email/advanced-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testEmail })
        });
      } else if (testType === 'welcome') {
        // Test email de bienvenida
        response = await fetch('/api/debug/email/welcome-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testEmail })
        });
      } else if (testType === 'order') {
        // Test email de confirmación de pedido
        response = await fetch('/api/debug/email/order-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testEmail })
        });
      } else if (testType === 'admin_notification') {
        // Test notificación al admin
        response = await fetch('/api/debug/email/admin-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testEmail })
        });
      }

      const data = await response?.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error al ejecutar la prueba' });
    } finally {
      setLoading(false);
    }
  };

  const checkEmailConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/email/config');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error al verificar configuración' });
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
          <p className="text-red-800">Solo el administrador principal puede acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          🧪 Debug del Sistema de Emails v2
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Usuario:</strong> {session.user?.email}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            🔧 Herramientas para probar y diagnosticar el sistema de emails
          </p>
        </div>

        <div className="space-y-6">
          {/* Verificar configuración */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. Verificar Configuración SMTP</h2>
            <p className="text-gray-600 mb-4">
              Verifica que las variables de entorno para SMTP estén configuradas correctamente.
            </p>
            <button
              onClick={checkEmailConfig}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : '🔍 Verificar Configuración'}
            </button>
          </div>

          {/* Configurar email de prueba */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">2. Configurar Test</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email de Prueba:</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Test:</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as 'smtp' | 'advanced' | 'welcome' | 'order' | 'admin_notification')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="smtp">🔧 Test Básico SMTP</option>
                  <option value="advanced">🚀 Test Avanzado SMTP (Múltiples Configs)</option>
                  <option value="welcome">👋 Email de Bienvenida</option>
                  <option value="order">📦 Confirmación de Pedido</option>
                  <option value="admin_notification">📧 Notificación Admin</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Descripción del Test:</h3>
              {testType === 'smtp' && (
                <p className="text-sm text-gray-600">
                  Envía un email básico para verificar que la conexión SMTP funciona correctamente.
                </p>
              )}
              {testType === 'advanced' && (
                <p className="text-sm text-gray-600">
                  Prueba múltiples configuraciones SMTP para encontrar la que funcione (útil para resolver problemas de certificados).
                </p>
              )}
              {testType === 'welcome' && (
                <p className="text-sm text-gray-600">
                  Envía un email de bienvenida con el template completo y diseño de la tienda.
                </p>
              )}
              {testType === 'order' && (
                <p className="text-sm text-gray-600">
                  Envía un email de confirmación de pedido con productos de ejemplo.
                </p>
              )}
              {testType === 'admin_notification' && (
                <p className="text-sm text-gray-600">
                  Envía una notificación de nuevo pedido al email admin configurado.
                </p>
              )}
            </div>
            
            <button
              onClick={runEmailTest}
              disabled={loading || !testEmail}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : '📧 Ejecutar Test de Email'}
            </button>
          </div>

          {/* Resultados */}
          {result && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Resultado del Test</h2>
              
              {result.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <div className="text-green-800">
                    <p className="font-semibold">✅ Test Exitoso</p>
                    <p>{result.message}</p>
                    {result.messageId && (
                      <p className="text-sm mt-2">Message ID: {result.messageId}</p>
                    )}
                  </div>
                </div>
              )}
              
              {result.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="text-red-800">
                    <p className="font-semibold">❌ Error en el Test</p>
                    <p>{result.error}</p>
                    {result.details && (
                      <p className="text-sm mt-2">{result.details}</p>
                    )}
                  </div>
                </div>
              )}

              {result.emailConfig && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="font-semibold text-blue-800 mb-2">📋 Configuración Actual:</p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Host:</strong> {result.emailConfig.host || 'NO CONFIGURADO'}</p>
                    <p><strong>Puerto:</strong> {result.emailConfig.port || 'NO CONFIGURADO'}</p>
                    <p><strong>Seguro:</strong> {result.emailConfig.secure}</p>
                    <p><strong>Usuario:</strong> {result.emailConfig.user || 'NO CONFIGURADO'}</p>
                    <p><strong>Email FROM:</strong> {result.emailConfig.from || 'NO CONFIGURADO'}</p>
                    <p><strong>Email ADMIN:</strong> {result.emailConfig.admin || 'NO CONFIGURADO'}</p>
                  </div>
                </div>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold">🔍 Datos Completos del Test</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Guía de Troubleshooting</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li><strong>Error de credenciales:</strong> Verifica EMAIL_USER y EMAIL_PASSWORD en Vercel</li>
            <li><strong>Error de conexión:</strong> Verifica EMAIL_HOST y EMAIL_PORT</li>
            <li><strong>Gmail:</strong> Usa contraseña de aplicación, no la contraseña normal</li>
            <li><strong>Firewall:</strong> Asegúrate que Vercel pueda conectar al puerto SMTP</li>
            <li><strong>Variables:</strong> Después de cambiar variables en Vercel, haz redeploy</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
