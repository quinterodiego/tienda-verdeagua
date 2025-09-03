'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExclamationTriangleIcon as AlertCircle, ArrowLeftIcon as ArrowLeft } from '@/components/HeroIcons';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  Configuration: 'Hay un problema con la configuración del servidor.',
  AccessDenied: 'No tienes permisos para acceder.',
  Verification: 'El token ha expirado o ya ha sido usado.',
  Default: 'Ha ocurrido un error inesperado.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Error de Autenticación
          </h2>
          <p className="text-gray-600 mb-8">
            {message}
          </p>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="block w-full bg-[#68c3b7] text-white py-3 px-4 rounded-lg hover:bg-[#64b7ac] transition-colors"
            >
              Intentar de nuevo
            </Link>
            <Link
              href="/"
              className="inline-flex items-center text-[#68c3b7] hover:text-[#64b7ac]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
