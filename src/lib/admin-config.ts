import { User, UserRole } from '@/types';
import { getUserFromSheets, hasRole, isAdmin as checkIsAdmin } from './users-sheets';

// Lista de emails de administradores predeterminados (fallback)
export const ADMIN_EMAILS = [
  'd86webs@gmail.com',
  // Agrega más emails de administradores aquí:
  // 'otro-admin@example.com',
  // 'admin@empresa.com',
];

// Función para verificar si un email es de administrador (fallback)
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};

// Función para verificar si una sesión tiene permisos de admin usando el sistema de roles
export const isAdminUser = async (session: any): Promise<boolean> => {
  if (!session?.user?.email) return false;
  
  try {
    // Intentar obtener el usuario desde Google Sheets con su rol
    const user = await getUserFromSheets(session.user.email);
    
    if (user) {
      // Usar el sistema de roles de la base de datos
      return checkIsAdmin(user);
    }
    
    // Fallback: usar la lista de emails de admin
    return isAdminEmail(session.user.email);
  } catch (error) {
    console.error('Error al verificar admin desde Sheets, usando fallback:', error);
    // Fallback: usar la lista de emails de admin
    return isAdminEmail(session.user.email);
  }
};

// Función sincrónica para verificar admin (para compatibilidad con componentes existentes)
export const isAdminUserSync = (session: any): boolean => {
  return isAdminEmail(session?.user?.email);
};

// Función para verificar si un usuario tiene un rol específico
export const userHasRole = async (session: any, role: UserRole): Promise<boolean> => {
  if (!session?.user?.email) return false;
  
  try {
    const user = await getUserFromSheets(session.user.email);
    return user ? hasRole(user, role) : false;
  } catch (error) {
    console.error('Error al verificar rol desde Sheets:', error);
    return false;
  }
};

// Función para obtener el rol de un usuario
export const getUserRole = async (session: any): Promise<UserRole> => {
  if (!session?.user?.email) return 'user';
  
  try {
    const user = await getUserFromSheets(session.user.email);
    return user?.role || 'user';
  } catch (error) {
    console.error('Error al obtener rol desde Sheets:', error);
    return isAdminEmail(session.user.email) ? 'admin' : 'user';
  }
};
