import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ContactTestPanelProps {
  onTestResult?: (result: { success: boolean; message: string }) => void;
}

export default function ContactTestPanel({ onTestResult }: ContactTestPanelProps) {
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const getCurrentContactEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact/config');
      const data = await response.json();
      
      if (data.success) {
        setCurrentEmail(data.contactFormEmail);
        setTestResult({ 
          success: true, 
          message: `Email actual: ${data.contactFormEmail}` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: 'Error al obtener la configuración' 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Error de conexión' 
      });
    } finally {
      setLoading(false);
    }
    
    onTestResult?.(testResult || { success: false, message: 'Error desconocido' });
  };

  const sendTestMessage = async () => {
    try {
      setLoading(true);
      const testData = {
        nombre: 'Test Admin',
        email: 'admin@test.com',
        telefono: '+54 11 1234-5678',
        asunto: 'test-configuracion',
        mensaje: 'Este es un mensaje de prueba desde el panel de administración para verificar que la configuración de email está funcionando correctamente.'
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({ 
          success: true, 
          message: `✅ Mensaje de prueba enviado exitosamente a: ${currentEmail || 'email configurado'}` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: `❌ Error: ${result.error}` 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: '❌ Error de conexión al enviar mensaje de prueba' 
      });
    } finally {
      setLoading(false);
    }

    onTestResult?.(testResult || { success: false, message: 'Error desconocido' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-[#68c3b7]" />
        <h3 className="text-lg font-semibold text-gray-900">Prueba de Configuración de Contacto</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Email Actual Configurado:</h4>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-white px-2 py-1 rounded border text-gray-600">
              {currentEmail || 'No cargado'}
            </code>
            <button
              onClick={getCurrentContactEmail}
              disabled={loading}
              className="text-sm text-[#68c3b7] hover:text-[#5ab3a7] disabled:opacity-50"
            >
              {loading ? 'Cargando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={getCurrentContactEmail}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#68c3b7] text-[#68c3b7] rounded-lg hover:bg-[#68c3b7] hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Verificar Email
          </button>

          <button
            onClick={sendTestMessage}
            disabled={loading || !currentEmail}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#5ab3a7] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar Prueba
          </button>
        </div>

        {testResult && (
          <div className={`rounded-lg p-4 flex items-start gap-3 ${
            testResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </p>
              {testResult.success && (
                <p className="text-xs text-green-600 mt-1">
                  Revisa tu bandeja de entrada en la dirección configurada.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-xs font-medium text-blue-800 mb-1">💡 Instrucciones:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Verificar Email:</strong> Muestra la dirección actual configurada</li>
            <li>• <strong>Enviar Prueba:</strong> Envía un mensaje de prueba para verificar que funciona</li>
            <li>• Primero guarda cualquier cambio en configuración antes de probar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
