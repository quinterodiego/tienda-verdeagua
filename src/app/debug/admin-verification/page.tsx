'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeftIcon as ArrowLeft, ShieldIcon as Shield, CheckCircleIcon2 as CheckCircle, XCircleIcon2 as XCircle } from '@/components/HeroIcons';

interface DebugData {
  success: boolean;
  timestamp: string;
  session: {
    hasSession: boolean;
    userEmail: string;
    userName: string;
  };
  adminVerifications: {
    syncCheck: {
      result: boolean;
      description: string;
    };
    dynamicCheck: {
      result: boolean;
      error: string | null;
      description: string;
    };
    userRoleEndpoint: {
      result: Record<string, unknown> | null;
      error: string | null;
      description: string;
    };
  };
  adminData: {
    adminEmailsFromSheets: string[];
    sheetsError: string | null;
    totalAdmins: number;
  };
  recommendations: {
    shouldHaveAccess: boolean;
    primaryMethod: string;
    issues: string[];
  };
}

export default function AdminVerificationDebugPage() {
  const { status } = useSession();
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/debug/admin-verification');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDebugData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchDebugData();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#68c3b7]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error al cargar debug</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!debugData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">No hay datos de debug</h3>
                <p className="text-yellow-700">No se pudieron obtener los datos de verificación de admin.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = ({ success }: { success: boolean }) => (
    success ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-[#68c3b7] hover:text-[#64b7ac] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel de Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug de Verificación de Admin</h1>
          <p className="text-gray-600">
            Diagnóstico completo del sistema de verificación de administradores
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Última actualización: {new Date(debugData.timestamp).toLocaleString('es-ES')}
          </p>
        </div>

        {/* Resumen General */}
        <div className={`mb-6 p-6 rounded-lg border-l-4 ${
          debugData.recommendations.shouldHaveAccess 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center mb-3">
            <StatusIcon success={debugData.recommendations.shouldHaveAccess} />
            <h2 className="text-lg font-semibold ml-2">
              {debugData.recommendations.shouldHaveAccess 
                ? 'Usuario tiene permisos de admin' 
                : 'Usuario NO tiene permisos de admin'
              }
            </h2>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Método principal: <strong>{debugData.recommendations.primaryMethod}</strong>
          </p>
          {debugData.recommendations.issues.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-800 mb-2">Problemas detectados:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {debugData.recommendations.issues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Información de Sesión */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Información de Sesión
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Sesión Activa</p>
              <div className="flex items-center mt-1">
                <StatusIcon success={debugData.session.hasSession} />
                <span className="ml-2 text-sm">{debugData.session.hasSession ? 'Sí' : 'No'}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-sm text-gray-900 mt-1">{debugData.session.userEmail || 'No disponible'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Nombre</p>
              <p className="text-sm text-gray-900 mt-1">{debugData.session.userName || 'No disponible'}</p>
            </div>
          </div>
        </div>

        {/* Verificaciones de Admin */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificaciones de Admin</h3>
          <div className="space-y-4">
            {/* Verificación Sincrónica */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Verificación Sincrónica (Fallback)</h4>
                <StatusIcon success={debugData.adminVerifications.syncCheck.result} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{debugData.adminVerifications.syncCheck.description}</p>
              <p className="text-sm">
                Resultado: <strong>{debugData.adminVerifications.syncCheck.result ? 'Admin' : 'No admin'}</strong>
              </p>
            </div>

            {/* Verificación Dinámica */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Verificación Dinámica</h4>
                <StatusIcon success={debugData.adminVerifications.dynamicCheck.result} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{debugData.adminVerifications.dynamicCheck.description}</p>
              <p className="text-sm mb-2">
                Resultado: <strong>{debugData.adminVerifications.dynamicCheck.result ? 'Admin' : 'No admin'}</strong>
              </p>
              {debugData.adminVerifications.dynamicCheck.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {debugData.adminVerifications.dynamicCheck.error}
                  </p>
                </div>
              )}
            </div>

            {/* Endpoint User-Role */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Endpoint /api/auth/user-role</h4>
                <StatusIcon success={!!debugData.adminVerifications.userRoleEndpoint.result && !debugData.adminVerifications.userRoleEndpoint.error} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{debugData.adminVerifications.userRoleEndpoint.description}</p>
              
              {debugData.adminVerifications.userRoleEndpoint.result && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-2">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(debugData.adminVerifications.userRoleEndpoint.result, null, 2)}
                  </pre>
                </div>
              )}
              
              {debugData.adminVerifications.userRoleEndpoint.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {debugData.adminVerifications.userRoleEndpoint.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Datos de Google Sheets */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de Google Sheets</h3>
          
          {debugData.adminData.sheetsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h4 className="font-medium text-red-800">Error al acceder a Google Sheets</h4>
                  <p className="text-sm text-red-700 mt-1">{debugData.adminData.sheetsError}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-900">
                  {debugData.adminData.totalAdmins} administradores encontrados en Google Sheets
                </span>
              </div>
              
              {debugData.adminData.adminEmailsFromSheets.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Lista de Administradores:</h4>
                  <ul className="space-y-1">
                    {debugData.adminData.adminEmailsFromSheets.map((email, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {email}
                        {email === debugData.session.userEmail && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            (Tu email)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
