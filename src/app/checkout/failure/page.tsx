'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCheckoutContext } from '@/contexts/CheckoutContext';
import { formatCurrency } from '@/lib/currency';
import { XCircleIcon as XCircle, ArrowPathIcon as RefreshCw, ArrowLeftIcon as ArrowLeft, CreditCardIcon as CreditCard } from '@/components/HeroIcons';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

function FailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCheckoutState } = useCheckoutContext();
  const [hasRecoveryData, setHasRecoveryData] = useState(false);
  const [recoveryData, setRecoveryData] = useState<any>(null);
  const { addItem, clearCart } = useCartStore();

  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');
  const statusDetail = searchParams.get('status_detail');
  const error = searchParams.get('error'); // Para errores durante la creación
  const details = searchParams.get('details'); // Detalles del error
  const hasRecovery = searchParams.get('has_recovery'); // Si hay datos para recuperar

  // Limpiar estado de checkout al llegar a failure
  useEffect(() => {
    console.log('❌ Llegó a página de fallo, limpiando contexto de checkout');
    clearCheckoutState();
  }, [clearCheckoutState]);

  // Verificar si hay datos de recuperación en localStorage
  useEffect(() => {
    try {
      const recoveryDataStr = localStorage.getItem('checkout_failure_recovery');
      if (recoveryDataStr) {
        const data = JSON.parse(recoveryDataStr);
        setRecoveryData(data);
        setHasRecoveryData(true);
        console.log('📦 Datos de recuperación encontrados:', data);
      } else {
        console.log('📭 No hay datos de recuperación en localStorage');
      }
    } catch (error) {
      console.error('Error al recuperar datos del localStorage:', error);
    }
  }, []);

  // Función para recuperar el carrito
  const handleRecoverCart = async () => {
    if (recoveryData && recoveryData.items) {
      try {
        console.log('🔄 Restaurando carrito con', recoveryData.items.length, 'productos');
        
        // Limpiar carrito actual
        clearCart();
        
        // Agregar cada producto al carrito
        recoveryData.items.forEach((item: any) => {
          addItem(item.product, item.quantity);
        });
        
        console.log('✅ Carrito restaurado exitosamente');
        
        // Limpiar datos de recuperación
        localStorage.removeItem('checkout_failure_recovery');
        
        // Redirigir al checkout con un pequeño delay para que se vea la acción
        setTimeout(() => {
          router.push('/checkout');
        }, 500);
        
      } catch (error) {
        console.error('❌ Error al restaurar carrito:', error);
        // Fallback: ir al checkout normal
        router.push('/checkout');
      }
    }
  };

  // Función temporal para testing - crear datos de prueba
  const createTestRecoveryData = () => {
    const testData = {
      items: [
        {
          product: {
            id: 'test-1',
            name: 'Producto de Prueba',
            price: 29.99,
            category: 'Test',
            images: ['https://via.placeholder.com/300']
          },
          quantity: 2
        }
      ],
      formData: {
        name: 'Usuario Test',
        email: 'test@test.com',
        phone: '1234567890'
      },
      timestamp: new Date().toISOString(),
      total: 59.98
    };
    
    localStorage.setItem('checkout_failure_recovery', JSON.stringify(testData));
    setRecoveryData(testData);
    setHasRecoveryData(true);
    console.log('🧪 Datos de prueba creados');
  };

  // Mostrar notificación automática cuando se carga la página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Pequeño delay para que se vea la notificación después de la carga
      setTimeout(() => {
        const message = error === 'payment_creation_failed' 
          ? 'No se pudo procesar el pago. Por favor, intenta de nuevo.'
          : 'El pago fue rechazado. Revisa los datos de tu tarjeta e intenta de nuevo.';
        
        // Aquí podrías usar tu sistema de notificaciones
        console.log('Notificación:', message);
      }, 500);
    }
  }, [error, statusDetail]);

  const getErrorMessage = (detail: string | null, errorType?: string | null) => {
    // Si hay un error durante la creación del pago
    if (errorType === 'payment_creation_failed') {
      return details || 'Hubo un problema al crear el pago. Inténtalo de nuevo.';
    }
    
    // Errores específicos de MercadoPago
    switch (detail) {
      case 'cc_rejected_insufficient_amount':
        return 'Fondos insuficientes en la tarjeta';
      case 'cc_rejected_bad_filled_card_number':
        return 'Número de tarjeta incorrecto';
      case 'cc_rejected_bad_filled_date':
        return 'Fecha de vencimiento incorrecta';
      case 'cc_rejected_bad_filled_security_code':
        return 'Código de seguridad incorrecto';
      case 'cc_rejected_call_for_authorize':
        return 'Debes autorizar el pago con tu banco';
      case 'cc_rejected_card_disabled':
        return 'Tarjeta deshabilitada';
      case 'cc_rejected_duplicated_payment':
        return 'Pago duplicado';
      case 'cc_rejected_high_risk':
        return 'Pago rechazado por seguridad';
      case 'cc_rejected_blacklist':
        return 'Tarjeta en lista negra';
      case 'cc_rejected_card_expired':
        return 'Tarjeta vencida';
      case 'cc_rejected_invalid_installments':
        return 'Número de cuotas inválido';
      case 'cc_rejected_max_attempts':
        return 'Demasiados intentos fallidos';
      default:
        return 'Hubo un problema procesando tu pago';
    }
  };

  const getErrorTitle = (errorType?: string | null) => {
    if (errorType === 'payment_creation_failed') {
      return 'Error al crear el pago';
    }
    return 'Pago no procesado';
  };

  const getSuggestions = (errorType?: string | null, detail?: string | null) => {
    if (errorType === 'payment_creation_failed') {
      return [
        '• Verifica tu conexión a internet',
        '• Asegúrate de haber llenado todos los campos',
        '• Intenta recargar la página',
        '• Si persiste, contacta al soporte técnico'
      ];
    }
    
    // Sugerencias específicas para errores de MercadoPago
    const specificSuggestions: { [key: string]: string[] } = {
      'cc_rejected_insufficient_amount': [
        '• Verifica que tengas fondos suficientes',
        '• Consulta con tu banco el límite disponible',
        '• Intenta con otra tarjeta'
      ],
      'cc_rejected_call_for_authorize': [
        '• Llama a tu banco para autorizar el pago',
        '• Verifica que la tarjeta esté habilitada para compras online',
        '• Intenta de nuevo después de la autorización'
      ],
      'cc_rejected_high_risk': [
        '• Contacta a tu banco para verificar la transacción',
        '• Intenta con otra tarjeta',
        '• Usa un método de pago alternativo'
      ]
    };
    
    if (detail && specificSuggestions[detail]) {
      return specificSuggestions[detail];
    }
    
    return [
      '• Verifica los datos de tu tarjeta',
      '• Asegúrate de tener fondos suficientes',
      '• Intenta con otra tarjeta',
      '• Contacta a tu banco si persiste el problema'
    ];
  };

  const handleRetry = () => {
    // Volver al checkout para intentar de nuevo
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icono de error */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getErrorTitle(error)}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {getErrorMessage(statusDetail, error)}
        </p>

        {/* Detalles del error */}
        {(orderId || error) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Información del intento
            </h3>
            
            <div className="space-y-1 text-sm text-gray-600">
              {orderId && (
                <div className="flex justify-between">
                  <span>Pedido:</span>
                  <span className="font-mono">{orderId}</span>
                </div>
              )}
              
              {status && (
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span>{status}</span>
                </div>
              )}
              
              {error && (
                <div className="flex justify-between">
                  <span>Tipo de error:</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sugerencias */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-8">
          <h4 className="font-medium text-yellow-800 mb-2">Qué puedes hacer:</h4>
          <ul className="text-yellow-700 text-sm text-left space-y-1">
            {getSuggestions(error, statusDetail).map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>

        {/* Botón temporal para testing */}
        {!hasRecoveryData && (
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-gray-700 text-sm mb-2">🧪 Modo testing:</p>
            <button
              onClick={createTestRecoveryData}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            >
              Simular datos de recuperación
            </button>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          {/* Si hay un orderId, priorizar ir a Mis Pedidos para reintentar */}
          {orderId ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm font-medium mb-2">
                📋 Tu pedido fue registrado
              </p>
              <p className="text-blue-700 text-xs mb-3">
                Aunque el pago no se completó, tu pedido #{orderId.slice(-8)} está guardado. 
                Puedes reintentar el pago desde &quot;Mis Pedidos&quot;.
              </p>
              <button
                onClick={() => router.push('/mis-pedidos')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ir a Mis Pedidos y Reintentar Pago
              </button>
            </div>
          ) : (
            /* Botón especial de recuperación si hay datos guardados pero no orderId */
            hasRecoveryData && recoveryData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  📦 Tus datos fueron guardados automáticamente
                </p>
                <p className="text-blue-700 text-xs mb-3">
                  Podemos restaurar tu carrito con {recoveryData.items?.length || 0} producto(s) 
                  por un total de {formatCurrency(recoveryData.total || 0)}
                </p>
                <button
                  onClick={handleRecoverCart}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Restaurar Carrito y Continuar
                </button>
              </div>
            )
          )}

          {/* Resto de botones siempre disponibles */}
          <button 
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </button>
          
          <Link 
            href="/cart"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al carrito
          </Link>
          
          <Link 
            href="/ayuda/errores-de-pago"
            className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Ver guía de errores de pago
          </Link>
          
          <Link 
            href="/"
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <FailureContent />
    </Suspense>
  );
}
