'use client';

import { useState } from 'react';
import { CheckCircle, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';

export default function CloudinarySetup() {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    cloudName: '',
    apiKey: '',
    apiSecret: ''
  });
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      title: "Crear cuenta en Cloudinary",
      description: "Regístrate gratis en Cloudinary para obtener 25GB de almacenamiento",
      action: (
        <a
          href="https://cloudinary.com/users/register/free"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-[#68c3b7] text-white rounded-lg hover:bg-[#64b7ac] transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Registrarse en Cloudinary
        </a>
      )
    },
    {
      title: "Obtener credenciales",
      description: "Ve al Dashboard > Settings > Access Keys y copia las credenciales",
      action: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cloud Name
            </label>
            <div className="flex">
              <input
                type="text"
                value={credentials.cloudName}
                onChange={(e) => setCredentials({...credentials, cloudName: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="tu-cloud-name"
              />
              <button
                onClick={() => copyToClipboard(credentials.cloudName, 'cloudName')}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
              >
                {copied === 'cloudName' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="flex">
              <input
                type="text"
                value={credentials.apiKey}
                onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="123456789012345"
              />
              <button
                onClick={() => copyToClipboard(credentials.apiKey, 'apiKey')}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
              >
                {copied === 'apiKey' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Secret
            </label>
            <div className="flex">
              <input
                type={showSecret ? "text" : "password"}
                value={credentials.apiSecret}
                onChange={(e) => setCredentials({...credentials, apiSecret: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                placeholder="abcd1234567890"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 hover:bg-gray-200"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(credentials.apiSecret, 'apiSecret')}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
              >
                {copied === 'apiSecret' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Configurar variables de entorno",
      description: "Agrega las credenciales a tu archivo .env.local",
      action: (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
          <pre className="text-sm">
{`# Agregar a .env.local
CLOUDINARY_CLOUD_NAME=${credentials.cloudName || 'tu-cloud-name'}
CLOUDINARY_API_KEY=${credentials.apiKey || 'tu-api-key'}
CLOUDINARY_API_SECRET=${credentials.apiSecret || 'tu-api-secret'}`}
          </pre>
          <button
            onClick={() => copyToClipboard(
              `CLOUDINARY_CLOUD_NAME=${credentials.cloudName || 'tu-cloud-name'}\nCLOUDINARY_API_KEY=${credentials.apiKey || 'tu-api-key'}\nCLOUDINARY_API_SECRET=${credentials.apiSecret || 'tu-api-secret'}`,
              'env'
            )}
            className="mt-2 inline-flex items-center px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            {copied === 'env' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            Copiar configuración
          </button>
        </div>
      )
    },
    {
      title: "Reiniciar servidor",
      description: "Reinicia el servidor de desarrollo para aplicar los cambios",
      action: (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
          <pre className="text-sm">npm run dev</pre>
          <p className="text-sm text-gray-400 mt-2">
            Presiona Ctrl+C para detener y luego ejecuta el comando nuevamente
          </p>
        </div>
      )
    }
  ];

  const allCredentialsFilled = credentials.cloudName && credentials.apiKey && credentials.apiSecret;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Configuración de Cloudinary
          </h1>
          <p className="text-lg text-gray-600">
            Sigue estos pasos para configurar el hosting profesional de imágenes
          </p>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < step ? 'bg-green-500 text-white' : 
                  index === step - 1 ? 'bg-[#68c3b7] text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index < step ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 ${
                    index < step - 1 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Paso {step}: {steps[step - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[step - 1].description}
            </p>
          </div>

          <div className="mb-8">
            {steps[step - 1].action}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {step < steps.length ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 2 && !allCredentialsFilled}
                className="px-6 py-2 bg-[#68c3b7] text-white rounded-lg hover:bg-[#64b7ac] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/admin'}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Ir al Admin
              </button>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">CDN Global</h3>
            <p className="text-sm text-gray-600">Entrega ultrarrápida desde 200+ ubicaciones mundiales</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Optimización Automática</h3>
            <p className="text-sm text-gray-600">WebP, AVIF y compresión inteligente sin configuración</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Plan Gratuito Generoso</h3>
            <p className="text-sm text-gray-600">25GB de almacenamiento + 25GB de ancho de banda</p>
          </div>
        </div>
      </div>
    </div>
  );
}
