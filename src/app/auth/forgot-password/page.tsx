'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationProvider';

export default function ForgotPasswordPage() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showNotification('Email de recuperación enviado', 'success');
      } else {
        setError(data.error || 'Error al enviar email de recuperación');
        showNotification(data.error || 'Error al enviar email', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
      showNotification('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Email Enviado!
              </h1>
              <p className="text-gray-600">
                Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                📧 Revisa tu email
              </h3>
              <p className="text-sm text-blue-800">
                El enlace de recuperación expira en <strong>1 hora</strong>. Si no encuentras el email, revisa tu carpeta de spam.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="w-full bg-[#68c3b7] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#64b7ac] transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio de sesión
              </Link>
              
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Enviar a otro email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-gray-600">
              Ingresa tu email y te enviaremos un enlace para restablecerla
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-all text-gray-900"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#68c3b7] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#64b7ac] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar enlace de recuperación
                </>
              )}
            </button>
          </form>

          {/* Enlaces */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center space-y-2">
              <Link
                href="/auth/signin"
                className="text-[#68c3b7] hover:text-[#64b7ac] font-medium flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al inicio de sesión
              </Link>
              
              <p className="text-sm text-gray-500">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/signin" className="text-[#68c3b7] hover:text-[#64b7ac] font-medium">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>

          {/* Nota de seguridad */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              🔒 Política de seguridad
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• El enlace expira en 1 hora por seguridad</li>
              <li>• Solo se puede usar una vez</li>
              <li>• No respondemos si el email no está registrado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
