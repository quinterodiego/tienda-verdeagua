'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Mail, ArrowLeft, Eye, EyeOff, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationProvider';

function SignInContent() {
  const { showNotification } = useNotification();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Verificar si ya está autenticado y redirigir
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('🔄 Usuario ya autenticado, redirigiendo a:', callbackUrl);
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    console.log('🔍 Google Sign In iniciado, callbackUrl:', callbackUrl);
    try {
      const result = await signIn('google', { 
        callbackUrl,
        redirect: true // Permitir redirección automática para Google
      });
      console.log('🔍 Resultado Google Sign In:', result);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión con Google');
      showNotification('Error al iniciar sesión con Google', 'error');
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('El email es requerido');
      return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }
    
    if (!formData.password) {
      setError('La contraseña es requerida');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (!isLogin) {
      if (!formData.name) {
        setError('El nombre es requerido');
        return false;
      }
      
      if (formData.name.trim().length < 2) {
        setError('El nombre debe tener al menos 2 caracteres');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
    }
    
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('🚀 Iniciando proceso de autenticación...');
    console.log('📍 CallbackUrl:', callbackUrl);
    console.log('🔒 IsLogin:', isLogin);
    console.log('📧 Email:', formData.email);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        // Login con email/password
        const result = await signIn('credentials', {
          email: formData.email.trim(),
          password: formData.password,
          redirect: false,
        });

        console.log('🔍 Resultado del login:', result);

        if (result?.error) {
          console.log('❌ Error en login:', result.error);
          setError('Email o contraseña incorrectos');
          showNotification('Email o contraseña incorrectos', 'error');
        } else if (result?.ok) {
          console.log('✅ Login exitoso, redirigiendo a:', callbackUrl);
          showNotification(`¡Bienvenido de vuelta!`, 'success');
          
          // Intentar redirección múltiple para asegurar que funcione
          try {
            router.push(callbackUrl);
            
            // Fallback con timeout
            setTimeout(() => {
              if (window.location.pathname === '/auth/signin') {
                console.log('🔄 Fallback: usando window.location para redirección');
                window.location.href = callbackUrl;
              }
            }, 1000);
          } catch (error) {
            console.error('❌ Error en router.push, usando window.location:', error);
            window.location.href = callbackUrl;
          }
        } else {
          setError('Error al iniciar sesión');
          showNotification('Error al iniciar sesión', 'error');
        }
      } else {
        // Registro
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            name: formData.name.trim(),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Registro exitoso, hacer login automático
          showNotification('¡Cuenta creada exitosamente!', 'success');
          
          const result = await signIn('credentials', {
            email: formData.email.trim(),
            password: formData.password,
            redirect: false,
          });

          if (result?.error) {
            setError('Usuario creado, pero error al iniciar sesión automáticamente');
            showNotification('Usuario creado, pero error al iniciar sesión', 'warning');
          } else if (result?.ok) {
            console.log('✅ Registro y login exitoso, redirigiendo a:', callbackUrl);
            showNotification('¡Bienvenido a TechStore!', 'success');
            
            // Intentar redirección múltiple para asegurar que funcione
            try {
              router.push(callbackUrl);
              
              // Fallback con timeout
              setTimeout(() => {
                if (window.location.pathname === '/auth/signin') {
                  console.log('🔄 Fallback registro: usando window.location para redirección');
                  window.location.href = callbackUrl;
                }
              }, 1000);
            } catch (error) {
              console.error('❌ Error en router.push registro, usando window.location:', error);
              window.location.href = callbackUrl;
            }
          } else {
            setError('Usuario creado, pero error al iniciar sesión');
            showNotification('Usuario creado, pero error al iniciar sesión', 'warning');
          }
        } else {
          setError(data.error || 'Error al crear usuario');
          showNotification(data.error || 'Error al crear usuario', 'error');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Error de conexión. Inténtalo nuevamente.');
      showNotification('Error de conexión. Inténtalo nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Si está autenticado, mostrar pantalla de redirección
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Sesión iniciada exitosamente!</h2>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-[#68c3b7] hover:text-[#64b7ac] mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Link>
          <div className="mx-auto w-16 h-16 bg-[#68c3b7] rounded-full flex items-center justify-center mb-6">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Accede a tu cuenta para una mejor experiencia'
              : 'Crea tu cuenta para empezar a comprar'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo"
                      required={!isLogin}
                      className="text-gray-600 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    required
                    className="text-gray-600 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="text-gray-600 w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required={!isLogin}
                      minLength={6}
                      className="text-gray-600 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#68c3b7] text-white py-3 rounded-lg font-medium hover:bg-[#64b7ac] focus:ring-2 focus:ring-[#68c3b7] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...') 
                  : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')
                }
              </button>
            </form>

            {/* Forgot Password Link - Solo mostrar en login */}
            {isLogin && (
              <div className="text-center mt-6 mb-4 p-2 border-t border-gray-200 pt-4">
                <Link
                  href="/auth/forgot-password"
                  className="inline-block text-sm text-[#68c3b7] hover:text-[#64b7ac] font-medium underline px-4 py-2 rounded transition-colors hover:bg-gray-50"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            {/* Toggle Login/Register */}
            <div className="text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', name: '', confirmPassword: '' });
                }}
                className="text-sm text-[#68c3b7] hover:text-[#64b7ac]"
              >
                {isLogin 
                  ? '¿No tienes cuenta? Regístrate aquí' 
                  : '¿Ya tienes cuenta? Inicia sesión aquí'
                }
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Al continuar, aceptas nuestros{' '}
              <Link href="/terminos" className="text-[#68c3b7] hover:text-[#64b7ac]">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacidad" className="text-[#68c3b7] hover:text-[#64b7ac]">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SignInContent />
    </Suspense>
  );
}
