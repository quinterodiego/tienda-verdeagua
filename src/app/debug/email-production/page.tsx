'use client';

import { useState, useEffect } from 'react';

interface DiagnosticResult {
  success: boolean;
  timestamp: string;
  environment: Record<string, string>;
  emailConfig: Record<string, string>;
  sheetsConfig: Record<string, string>;
  detailedCheck: Record<string, string | number>;
  transporterTest: string;
  recommendations: string[];
  error?: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  error?: string;
}

export default function EmailDiagnosticPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const runDiagnostic = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/email/production-check');
      const data = await response.json();
      setDiagnostic(data);
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      setDiagnostic({
        success: false,
        error: 'Error de conexión',
        timestamp: new Date().toISOString(),
        environment: {},
        emailConfig: {},
        sheetsConfig: {},
        detailedCheck: {},
        transporterTest: 'Error',
        recommendations: []
      });
    } finally {
      setLoading(false);
    }
  };

  const testPasswordReset = async () => {
    if (!testEmail) {
      alert('Por favor ingresa un email');
      return;
    }

    try {
      setTestLoading(true);
      const response = await fetch('/api/debug/email/password-reset-production-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          userName: 'Usuario de Prueba Producción'
        })
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Error en test:', error);
      setTestResult({
        success: false,
        message: 'Error de conexión',
        error: 'No se pudo conectar con el servidor'
      });
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusColor = (status: string) => {
    if (status.includes('✅')) return 'text-green-600 bg-green-50';
    if (status.includes('❌')) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              🔧 Diagnóstico de Emails en Producción
            </h1>
            <button
              onClick={runDiagnostic}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar Configuración'}
            </button>
          </div>

          {diagnostic && (
            <div className="space-y-6">
              {/* Entorno */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">🌍 Entorno</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(diagnostic.environment).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-500">{key}</div>
                      <div className="text-sm text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración de Email */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">📧 Configuración de Email</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(diagnostic.emailConfig).map(([key, value]) => (
                    <div key={key} className={`p-3 rounded flex justify-between items-center ${getStatusColor(value)}`}>
                      <span className="font-medium">{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test de Transporte */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">🔌 Test de Conexión SMTP</h3>
                <div className={`p-4 rounded text-center ${getStatusColor(diagnostic.transporterTest)}`}>
                  <div className="text-lg font-medium">{diagnostic.transporterTest}</div>
                </div>
              </div>

              {/* Configuración Detallada */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">🔍 Detalles de Configuración</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(diagnostic.detailedCheck).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-500">{key}</div>
                      <div className="text-sm text-gray-900">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recomendaciones */}
              {diagnostic.recommendations.length > 0 && (
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-800">⚠️ Recomendaciones</h3>
                  <ul className="space-y-2">
                    {diagnostic.recommendations.map((rec, index) => (
                      <li key={index} className="text-yellow-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test de Envío */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🧪 Test de Envío de Password Reset
          </h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Email para prueba"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
            <button
              onClick={testPasswordReset}
              disabled={testLoading || !testEmail}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {testLoading ? 'Enviando...' : 'Enviar Test'}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`text-lg font-medium mb-2 ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.success ? '✅ Email enviado exitosamente' : '❌ Error al enviar email'}
              </div>
              <div className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.message}
              </div>
              {testResult.details && (
                <pre className="mt-3 text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Instrucciones de Uso</h3>
          <ul className="space-y-2 text-blue-700">
            <li>• <strong>Verificar Configuración:</strong> Revisa que todas las variables estén configuradas</li>
            <li>• <strong>Test de Conexión:</strong> Asegúrate que la conexión SMTP sea exitosa</li>
            <li>• <strong>Test de Envío:</strong> Envía un email de prueba para verificar funcionalidad completa</li>
            <li>• <strong>Si hay errores:</strong> Verifica las credenciales en Vercel Dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
