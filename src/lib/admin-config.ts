import { User, UserRole } from '@/types';

// Lista de emails de administradores predeterminados (fallback)
export const ADMIN_EMAILS = [
  'd86webs@gmail.com',
  'sebastianperez6@hotmail.com',
  // Agrega más emails de administradores aquí:
  // 'otro-admin@example.com',
  // 'admin@empresa.com',
];

// Función para verificar si un email es de administrador (fallback)
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};

// Función sincrónica para verificar admin (para compatibilidad con componentes existentes)
export const isAdminUserSync = (session: any): boolean => {
  return isAdminEmail(session?.user?.email);
};

// Función para obtener información de rol del usuario usando la API
export const getUserRoleInfo = async (): Promise<{
  role: UserRole;
  isAdmin: boolean;
  hasModeratorRole: boolean;
  email: string | null;
}> => {
  try {
    const response = await fetch('/api/auth/user-role', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    }

    // Fallback en caso de error
    return {
      role: 'user',
      isAdmin: false,
      hasModeratorRole: false,
      email: null
    };
  } catch (error) {
    console.error('Error al obtener información de rol:', error);
    return {
      role: 'user',
      isAdmin: false,
      hasModeratorRole: false,
      email: null
    };
  }
};

// Función para verificar si una sesión tiene permisos de admin (ahora async usando API)
export const isAdminUser = async (session: any): Promise<boolean> => {
  if (!session?.user?.email) return false;
  
  try {
    const roleInfo = await getUserRoleInfo();
    return roleInfo.isAdmin;
  } catch (error) {
    console.error('Error al verificar admin, usando fallback:', error);
    // Fallback: usar la lista de emails de admin
    return isAdminEmail(session.user.email);
  }
};

// Función para verificar si un usuario tiene un rol específico
export const userHasRole = async (session: any, role: UserRole): Promise<boolean> => {
  if (!session?.user?.email) return false;
  
  try {
    const roleInfo = await getUserRoleInfo();
    return roleInfo.role === role || (role === 'admin' && roleInfo.isAdmin) || (role === 'moderator' && roleInfo.hasModeratorRole);
  } catch (error) {
    console.error('Error al verificar rol:', error);
    return false;
  }
};

// Función para obtener el rol de un usuario
export const getUserRole = async (session: any): Promise<UserRole> => {
  if (!session?.user?.email) return 'user';
  
  try {
    const roleInfo = await getUserRoleInfo();
    return roleInfo.role;
  } catch (error) {
    console.error('Error al obtener rol:', error);
    return isAdminEmail(session.user.email) ? 'admin' : 'user';
  }
};
