'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (session) {
      const adminEmails = ['d86webs@gmail.com', 'coderflixarg@gmail.com'];
      const userEmail = session.user?.email || '';
      
      setDebugInfo({
        session: session,
        checks: {
          hasEmail: !!userEmail,
          email: userEmail,
          isInAdminList: adminEmails.includes(userEmail),
          adminEmails: adminEmails,
          comparison: adminEmails.map(admin => ({
            admin,
            matches: admin === userEmail,
            exactMatch: admin.toLowerCase() === userEmail.toLowerCase()
          }))
        }
      });
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="p-4">Cargando sesión...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="p-4">No estás logueado</div>;
  }

  const adminEmails = ['d86webs@gmail.com', 'coderflixarg@gmail.com'];
  const hasAccess = adminEmails.includes(session?.user?.email || '');

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug de Sesión</h1>
      
      <div className="space-y-6">
        {/* Estado de acceso */}
        <div className={`p-4 rounded-lg border ${hasAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h2 className="font-bold text-lg mb-2">
            {hasAccess ? '✅ ACCESO PERMITIDO' : '❌ ACCESO DENEGADO'}
          </h2>
          <p>Estado: {hasAccess ? 'Deberías poder acceder a las páginas de admin' : 'No tienes acceso a páginas de admin'}</p>
        </div>

        {/* Información de sesión */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">📋 Información de Sesión</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Email:</strong> {session?.user?.email || 'NO EMAIL'}</p>
            <p><strong>Nombre:</strong> {session?.user?.name || 'NO NAME'}</p>
            <p><strong>ID:</strong> {session?.user?.id || 'NO ID'}</p>
            <p><strong>Rol:</strong> {session?.user?.role || 'NO ROLE'}</p>
            <p><strong>Status:</strong> {status}</p>
          </div>
        </div>

        {/* Verificación de emails admin */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">👥 Verificación de Emails Admin</h3>
          <div className="space-y-2">
            <p><strong>Tu email:</strong> <code>{session?.user?.email || 'NO EMAIL'}</code></p>
            <p><strong>Emails admin permitidos:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              {adminEmails.map((email, index) => {
                const matches = email === session?.user?.email;
                return (
                  <li key={index} className={matches ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                    <code>{email}</code> {matches && '← ¡COINCIDE!'}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Links de prueba */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">🔗 Prueba estas páginas</h3>
          <div className="space-y-2">
            <a href="/debug/email" className="block text-blue-600 hover:underline">
              📧 /debug/email - Debug de emails
            </a>
            <a href="/config/email" className="block text-blue-600 hover:underline">
              ⚙️ /config/email - Configuración de emails
            </a>
            <a href="/config/notification-email" className="block text-blue-600 hover:underline">
              📬 /config/notification-email - Configuración de notificaciones
            </a>
          </div>
        </div>

        {/* JSON completo */}
        {debugInfo && (
          <details className="bg-white border border-gray-200 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">🔍 Información Completa (JSON)</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
