'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';
import { 
  CheckCircleIcon,
  BanknotesIcon,
  CopyIcon,
  ArrowLeftIcon,
  MailIcon,
  WhatsAppIcon,
  ClockIcon
} from '@/components/Icons';
import { useNotifications } from '@/lib/store';

// Datos bancarios para transferencia (estos deberían venir de configuración)
const BANK_INFO = {
  bankName: "Banco de Galicia",
  accountType: "Cuenta Corriente",
  cbu: "0070161330004063153197",
  alias: "verdeagua.julieta",
  holder: "Julieta Florencia Parrilla",
  cuit: "27-35862699-3"
};

const CONTACT_INFO = {
  whatsapp: "+5491123456789",
  email: "pagos@tienda-verdeagua.com.ar",
  phone: "+5491123456789"
};

// Componente que usa useSearchParams - debe estar dentro de Suspense
function TransferPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addNotification = useNotifications((state) => state.addNotification);
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentSent, setPaymentSent] = useState(false);

  useEffect(() => {
    // Verificar que tenemos los parámetros necesarios
    if (!orderId || !amount) {
      // Redirigir si no hay información del pedido
      window.location.href = '/cart';
    }
  }, [orderId, amount]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      addNotification(`${field} copiado al portapapeles`, 'success');
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      addNotification('Error al copiar al portapapeles', 'error');
    }
  };

  const handlePaymentSent = async () => {
    try {
      // Notificar que se envió el comprobante
      const response = await fetch('/api/orders/payment-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod: 'transfer'
        })
      });

      if (response.ok) {
        setPaymentSent(true);
        addNotification('¡Perfecto! Hemos recibido tu notificación de pago', 'success');
      } else {
        addNotification('Error al procesar la notificación', 'error');
      }
    } catch {
      addNotification('Error al procesar la notificación', 'error');
    }
  };

  const openWhatsApp = () => {
    const message = `Hola! Acabo de realizar una transferencia para el pedido ${orderId} por ${formatCurrency(Number(amount))}. Te envío el comprobante.`;
    const url = `https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!orderId || !amount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Información de pedido no encontrada
          </h2>
          <button
            onClick={() => router.push('/cart')}
            className="inline-flex items-center px-6 py-3 bg-[#68c3b7] text-white rounded-lg hover:bg-[#5ab3a7] transition-colors"
          >
            Volver al carrito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="inline-flex items-center text-[#68c3b7] hover:text-[#5ab3a7] mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver al carrito
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-gray-600">
              Pedido #{orderId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información de transferencia */}
          <div className="space-y-6">
            {/* Resumen del pago */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <BanknotesIcon className="h-6 w-6 text-[#68c3b7] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Transferencia Bancaria
                </h2>
              </div>
              
              <div className="bg-[#68c3b7]/10 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Monto a transferir</p>
                  <p className="text-3xl font-bold text-[#68c3b7]">
                    {formatCurrency(Number(amount))}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Banco</span>
                  <span className="font-medium">{BANK_INFO.bankName}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Titular</span>
                  <span className="font-medium">{BANK_INFO.holder}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">CUIT</span>
                  <span className="font-medium">{BANK_INFO.cuit}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tipo de cuenta</span>
                  <span className="font-medium">{BANK_INFO.accountType}</span>
                </div>
              </div>
            </div>

            {/* Datos para transferir */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Datos para la transferencia
              </h3>
              
              <div className="space-y-4">
                {/* CBU */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CBU
                      </label>
                      <p className="text-lg font-mono font-semibold text-gray-900">
                        {BANK_INFO.cbu}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BANK_INFO.cbu, 'CBU')}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedField === 'CBU'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <CopyIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Alias */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alias
                      </label>
                      <p className="text-lg font-mono font-semibold text-gray-900">
                        {BANK_INFO.alias}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BANK_INFO.alias, 'Alias')}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedField === 'Alias'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <CopyIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instrucciones y contacto */}
          <div className="space-y-6">
            {/* Instrucciones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Instrucciones de pago
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#68c3b7] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Realiza la transferencia</p>
                    <p className="text-sm text-gray-600">
                      Utiliza los datos bancarios proporcionados para transferir el monto exacto de {formatCurrency(Number(amount))}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#68c3b7] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Envía el comprobante</p>
                    <p className="text-sm text-gray-600">
                      Toma una foto del comprobante y envíanosla por WhatsApp o email junto con tu número de pedido
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#68c3b7] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmamos tu pago</p>
                    <p className="text-sm text-gray-600">
                      Verificaremos tu transferencia y te confirmaremos el pago en un máximo de 24 horas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Enviar comprobante
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={openWhatsApp}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <WhatsAppIcon className="h-5 w-5 mr-2" />
                  Enviar por WhatsApp
                </button>
                
                <a
                  href={`mailto:${CONTACT_INFO.email}?subject=Comprobante de transferencia - Pedido ${orderId}&body=Adjunto comprobante de transferencia para el pedido ${orderId} por ${formatCurrency(Number(amount))}`}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MailIcon className="h-5 w-5 mr-2" />
                  Enviar por Email
                </a>
              </div>
            </div>

            {/* Confirmación de envío */}
            {!paymentSent && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ¿Ya enviaste el comprobante?
                </h3>
                
                <button
                  onClick={handlePaymentSent}
                  className="w-full px-4 py-3 bg-[#68c3b7] text-white rounded-lg hover:bg-[#5ab3a7] transition-colors"
                >
                  Sí, ya envié el comprobante
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Esto nos ayuda a procesar tu pedido más rápido
                </p>
              </div>
            )}

            {/* Confirmación enviada */}
            {paymentSent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      ¡Comprobante recibido!
                    </h3>
                    <p className="text-sm text-green-700">
                      Procesaremos tu pago en las próximas 24 horas y te notificaremos por email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tiempo de procesamiento */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Tiempo de procesamiento
                  </h3>
                  <p className="text-sm text-blue-700">
                    Los pagos se procesan de lunes a viernes de 9:00 a 18:00 hs. 
                    Los fines de semana pueden tardar hasta el siguiente día hábil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente Loading para Suspense
function LoadingTransferPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function TransferPage() {
  return (
    <Suspense fallback={<LoadingTransferPage />}>
      <TransferPageContent />
    </Suspense>
  );
}
