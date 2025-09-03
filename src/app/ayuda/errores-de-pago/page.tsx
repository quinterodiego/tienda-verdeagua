'use client';

import { AlertCircle, CreditCard, HelpCircle, Shield, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ErroresDePagoPage() {
  const errorTypes = [
    {
      code: 'cc_rejected_insufficient_amount',
      title: 'Fondos insuficientes',
      description: 'Tu tarjeta no tiene fondos suficientes para realizar la compra.',
      solutions: [
        'Verifica el saldo disponible en tu tarjeta',
        'Usa una tarjeta diferente con fondos suficientes',
        'Contacta a tu banco para verificar límites de compra'
      ]
    },
    {
      code: 'cc_rejected_bad_filled_card_number',
      title: 'Número de tarjeta incorrecto',
      description: 'El número de tarjeta ingresado no es válido.',
      solutions: [
        'Verifica que hayas ingresado todos los 16 dígitos',
        'Revisa que no haya espacios o caracteres extra',
        'Confirma que el número coincida con el de tu tarjeta física'
      ]
    },
    {
      code: 'cc_rejected_bad_filled_security_code',
      title: 'Código de seguridad incorrecto',
      description: 'El CVV/CVC ingresado no coincide con el de tu tarjeta.',
      solutions: [
        'Verifica el código de 3 dígitos en el reverso de tu tarjeta',
        'Para American Express, usa los 4 dígitos del frente',
        'Asegúrate de no confundir el código con otros números'
      ]
    },
    {
      code: 'cc_rejected_card_expired',
      title: 'Tarjeta vencida',
      description: 'La fecha de vencimiento de tu tarjeta ya pasó.',
      solutions: [
        'Solicita una nueva tarjeta a tu banco',
        'Usa una tarjeta diferente que esté vigente',
        'Contacta a tu banco para renovar tu tarjeta'
      ]
    },
    {
      code: 'cc_rejected_call_for_authorize',
      title: 'Autorización requerida',
      description: 'Tu banco requiere autorización adicional para esta compra.',
      solutions: [
        'Llama al número de atención al cliente de tu banco',
        'Autoriza la compra cuando te lo soliciten',
        'Intenta realizar el pago nuevamente después de la autorización'
      ]
    },
    {
      code: 'cc_rejected_card_disabled',
      title: 'Tarjeta deshabilitada',
      description: 'Tu tarjeta está temporalmente deshabilitada o bloqueada.',
      solutions: [
        'Contacta a tu banco para verificar el estado de la tarjeta',
        'Solicita la reactivación si es necesario',
        'Usa una tarjeta diferente mientras tanto'
      ]
    }
  ];

  const generalTips = [
    {
      icon: <Shield className="w-5 h-5 text-green-600" />,
      title: 'Verifica tu información',
      description: 'Asegúrate de que todos los datos sean correctos antes de enviar'
    },
    {
      icon: <CreditCard className="w-5 h-5 text-blue-600" />,
      title: 'Prueba con otra tarjeta',
      description: 'Si una tarjeta no funciona, intenta con otra diferente'
    },
    {
      icon: <Phone className="w-5 h-5 text-purple-600" />,
      title: 'Contacta a tu banco',
      description: 'Tu banco puede ayudarte a resolver problemas específicos'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ayuda con Errores de Pago
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Si tuviste problemas al procesar tu pago, aquí encontrarás las soluciones más comunes
          </p>
        </div>

        {/* Consejos generales */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            Consejos Generales
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {generalTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{tip.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Errores específicos */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Errores Específicos y Sus Soluciones
          </h2>
          <div className="space-y-6">
            {errorTypes.map((error, index) => (
              <div key={index} className="border-l-4 border-red-400 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{error.title}</h3>
                <p className="text-gray-600 mb-3">{error.description}</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Soluciones:</p>
                  <ul className="space-y-1">
                    {error.solutions.map((solution, sIndex) => (
                      <li key={sIndex} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 text-blue-600 mr-2" />
            ¿Necesitas más ayuda?
          </h2>
          <p className="text-gray-600 mb-4">
            Si ninguna de estas soluciones funciona, no dudes en contactarnos
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              href="/contacto"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Contactar Soporte
            </Link>
            <Link
              href="/checkout"
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Intentar Pago Nuevamente
            </Link>
          </div>
        </div>

        {/* Breadcrumb para volver */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
