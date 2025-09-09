'use client';

import { useState } from 'react';

interface User {
  email: string;
  name?: string;
  role?: string;
  isActive: boolean;
  hasPassword: boolean;
}

interface Result {
  success?: boolean;
  error?: string;
  message?: string;
  details?: string;
  timestamp?: string;
  users?: User[];
}

export default function UserResetPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [resetForm, setResetForm] = useState({
    email: '',
    newPassword: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/reset-user-password');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setResult({ success: true, message: data.message });
      } else {
        setResult({ error: data.error, details: data.details });
      }
    } catch (error) {
      setResult({ error: 'Error cargando usuarios', details: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!resetForm.email || !resetForm.newPassword) {
      setResult({ error: 'Email y contraseña son requeridos' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debug/reset-user-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          email: resetForm.email,
          newPassword: resetForm.newPassword
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setResetForm({ email: '', newPassword: '' });
        // Recargar usuarios
        setTimeout(() => loadUsers(), 1000);
      }
    } catch (error) {
      setResult({ error: 'Error reseteando contraseña', details: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          🔐 Reset de Contraseñas de Usuario
        </h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>⚠️ Herramienta de emergencia:</strong> Usa esta página para resetear contraseñas cuando no puedes acceder al sistema normal.
          </p>
        </div>

        {/* Cargar usuarios */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Ver Usuarios Existentes</h2>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : '👥 Cargar Usuarios'}
          </button>
          
          {users.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Usuarios encontrados:</h3>
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Nombre:</strong> {user.name || 'Sin nombre'}</p>
                        <p><strong>Rol:</strong> {user.role || 'user'}</p>
                        <p><strong>Activo:</strong> {user.isActive ? 'Sí' : 'No'}</p>
                        <p><strong>Tiene contraseña:</strong> {user.hasPassword ? 'Sí' : 'No'}</p>
                      </div>
                      <button
                        onClick={() => setResetForm({ ...resetForm, email: user.email })}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset de contraseña */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Resetear Contraseña</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email del Usuario:</label>
              <input
                type="email"
                value={resetForm.email}
                onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                placeholder="user@ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nueva Contraseña:</label>
              <input
                type="password"
                value={resetForm.newPassword}
                onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <button
            onClick={resetPassword}
            disabled={loading || !resetForm.email || !resetForm.newPassword}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Reseteando...' : '🔄 Resetear Contraseña'}
          </button>
        </div>

        {/* Resultados */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Resultado</h2>
            
            {result.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="text-green-800">
                  <p className="font-semibold">✅ Operación Exitosa</p>
                  <p>{result.message}</p>
                  {result.timestamp && (
                    <p className="text-sm mt-2">Hora: {new Date(result.timestamp).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}
            
            {result.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="text-red-800">
                  <p className="font-semibold">❌ Error</p>
                  <p>{result.error}</p>
                  {result.details && (
                    <p className="text-sm mt-2">{result.details}</p>
                  )}
                </div>
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">🔍 Datos Completos</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Instrucciones</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Primero carga los usuarios para ver cuáles existen</li>
            <li>Selecciona el usuario que necesitas resetear (o escribe el email manualmente)</li>
            <li>Ingresa una nueva contraseña (mínimo 6 caracteres)</li>
            <li>Haz clic en &quot;Resetear Contraseña&quot;</li>
            <li>Ahora podrás loguearte con la nueva contraseña</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
