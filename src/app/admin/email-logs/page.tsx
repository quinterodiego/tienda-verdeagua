'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface EmailLog {
  id: string;
  timestamp: string;
  type: 'order_status' | 'welcome' | 'password_reset' | 'admin_notification';
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  orderId?: string;
  userId?: string;
  errorMessage?: string;
  metadata?: string;
}

export default function EmailLogsPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    limit: '50'
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(`/api/admin/email-logs?${params}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setError(null);
      } else {
        setError(data.error || 'Error al cargar logs');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeLogs = async () => {
    try {
      const response = await fetch('/api/admin/email-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      });

      const data = await response.json();
      if (data.success) {
        alert('Pestaña de Email Logs inicializada correctamente');
        fetchLogs();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (filters.type) params.append('type', filters.type);
        if (filters.status) params.append('status', filters.status);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await fetch(`/api/admin/email-logs?${params}`);
        const data = await response.json();

        if (data.success) {
          setLogs(data.logs);
          setError(null);
        } else {
          setError(data.error || 'Error al cargar logs');
        }
      } catch {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [status, filters]);

  if (status === 'loading') {
    return <div className="p-6">Cargando...</div>;
  }

  if (!session) {
    return <div className="p-6">Acceso denegado</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order_status': return 'text-blue-600 bg-blue-100';
      case 'welcome': return 'text-green-600 bg-green-100';
      case 'password_reset': return 'text-purple-600 bg-purple-100';
      case 'admin_notification': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Logs de Emails</h1>
        <p className="text-gray-600">Registro completo de todos los emails enviados desde el sistema</p>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="order_status">Estado de Pedido</option>
              <option value="welcome">Bienvenida</option>
              <option value="password_reset">Reset Contraseña</option>
              <option value="admin_notification">Notificación Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="sent">Enviado</option>
              <option value="failed">Fallido</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Límite</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>

          <button
            onClick={fetchLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>

          <button
            onClick={initializeLogs}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Inicializar Sheet
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla de logs */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinatario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asunto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {log.to}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {log.subject}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {log.orderId || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate">
                    {log.errorMessage || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron logs de emails
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 text-sm text-gray-600">
        <p>Total de logs mostrados: {logs.length}</p>
      </div>
    </div>
  );
}
