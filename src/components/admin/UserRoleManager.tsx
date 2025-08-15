'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { ShieldCheckIcon as Shield, UserGroupIcon as Users, StarIcon as Crown, PencilIcon as Edit, CheckIcon as Save, XMarkIcon as X } from '@/components/HeroIcons';

interface UserRoleManagerProps {
  onClose: () => void;
}

export default function UserRoleManager({ onClose }: UserRoleManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole>('user');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/user-roles');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Error al cargar usuarios:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: User) => {
    setEditingUserId(user.id);
    setEditingRole(user.role);
  };

  const handleSaveRole = async (userEmail: string) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/user-roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          role: editingRole,
        }),
      });

      if (response.ok) {
        // Actualizar la lista local
        setUsers(users.map(user => 
          user.email === userEmail 
            ? { ...user, role: editingRole, updatedAt: new Date().toISOString() }
            : user
        ));
        setEditingUserId(null);
      } else {
        alert('Error al actualizar el rol del usuario');
      }
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      alert('Error al actualizar el rol del usuario');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole('user');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'moderator':
        return 'Moderador';
      default:
        return 'Usuario';
    }
  };

  // Funciones auxiliares para verificar roles
  const isAdmin = (user: User): boolean => user.role === 'admin';
  const isModerator = (user: User): boolean => user.role === 'moderator';

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#68c3b7]"></div>
            <span className="ml-2">Cargando usuarios...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-[#68c3b7]" />
            <h2 className="text-2xl font-bold text-gray-900">
              Gestión de Roles de Usuario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Tipos de roles:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li><strong>Admin:</strong> Acceso completo al panel de administración</li>
            <li><strong>Moderador:</strong> Acceso limitado para gestión de contenido</li>
            <li><strong>Usuario:</strong> Acceso normal como cliente</li>
          </ul>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Usuario</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rol Actual</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Registrado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Última Actualización</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{user.email}</td>
                  <td className="py-4 px-4">
                    {editingUserId === user.id ? (
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value as UserRole)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#68c3b7] focus:border-transparent"
                      >
                        <option value="user">Usuario</option>
                        <option value="moderator">Moderador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{getRoleLabel(user.role)}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {user.updatedAt 
                      ? new Date(user.updatedAt).toLocaleDateString('es-ES')
                      : '-'
                    }
                  </td>
                  <td className="py-4 px-4">
                    {editingUserId === user.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveRole(user.email)}
                          disabled={updating}
                          className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updating}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditRole(user)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay usuarios registrados
            </h3>
            <p className="text-gray-600">
              Los usuarios aparecerán aquí cuando se registren en el sistema.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
