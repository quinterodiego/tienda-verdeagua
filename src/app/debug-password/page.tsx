'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DebugPasswordPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const checkUser = async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/debug-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'check_user', 
          email: email || session.user.email 
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error de red' });
    } finally {
      setLoading(false);
    }
  };

  const testPasswordUpdate = async () => {
    if (!email || !newPassword) {
      alert('Email y contraseña son requeridos');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/debug-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'test_password_update', 
          email,
          newPassword
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error de red' });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className="p-4">Necesitas estar logueado para ver esta página</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug de Reset de Contraseña</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p><strong>Usuario logueado:</strong> {session.user?.email}</p>
        <p><strong>Nombre:</strong> {session.user?.name}</p>
      </div>

      <div className="space-y-6">
        {/* Check User */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">1. Verificar Usuario en Google Sheets</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email a verificar:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={session.user?.email || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <button
              onClick={checkUser}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : '🔍 Verificar Usuario'}
            </button>
          </div>
        </div>

        {/* Test Password Update */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">2. Probar Actualización de Contraseña</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nueva contraseña (test):</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña de prueba"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <button
              onClick={testPasswordUpdate}
              disabled={loading || !email || !newPassword}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : '🧪 Probar Actualización'}
            </button>
            
            <p className="text-sm text-gray-600">
              ⚠️ Esto realmente cambiará la contraseña en Google Sheets. Solo usar para debug.
            </p>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Resultados</h2>
            
            {result.userExists !== undefined && (
              <div className="mb-4">
                <h3 className="font-semibold">Estado del Usuario:</h3>
                <p className={`p-2 rounded ${result.userExists ? 'bg-green-100' : 'bg-red-100'}`}>
                  {result.userExists ? '✅ Usuario existe en Google Sheets' : '❌ Usuario NO existe en Google Sheets'}
                </p>
                
                {result.user && (
                  <div className="mt-2 bg-gray-50 p-4 rounded">
                    <p><strong>ID:</strong> {result.user.id}</p>
                    <p><strong>Email:</strong> {result.user.email}</p>
                    <p><strong>Nombre:</strong> {result.user.name}</p>
                    <p><strong>Rol:</strong> {result.user.role}</p>
                    <p><strong>Tiene Password:</strong> {result.user.hasPassword ? '✅ Sí' : '❌ No'}</p>
                    <p><strong>Creado:</strong> {result.user.createdAt}</p>
                    <p><strong>Actualizado:</strong> {result.user.updatedAt}</p>
                  </div>
                )}
              </div>
            )}
            
            {result.success !== undefined && (
              <div className="mb-4">
                <h3 className="font-semibold">Resultado de Actualización:</h3>
                <p className={`p-2 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  {result.success ? '✅ Contraseña actualizada exitosamente' : '❌ Error al actualizar contraseña'}
                </p>
                
                {result.passwordWorks !== undefined && (
                  <p className={`p-2 rounded mt-2 ${result.passwordWorks ? 'bg-green-100' : 'bg-red-100'}`}>
                    {result.passwordWorks ? '✅ Nueva contraseña funciona correctamente' : '❌ Nueva contraseña NO funciona'}
                  </p>
                )}
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold">Antes:</h4>
                    {result.userBefore && (
                      <>
                        <p>Tiene password: {result.userBefore.hasPassword ? 'Sí' : 'No'}</p>
                        <p>Actualizado: {result.userBefore.updatedAt}</p>
                      </>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold">Después:</h4>
                    {result.userAfter && (
                      <>
                        <p>Tiene password: {result.userAfter.hasPassword ? 'Sí' : 'No'}</p>
                        <p>Actualizado: {result.userAfter.updatedAt}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">🔍 Datos Raw</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
