import { UserRole } from '@/types';

// Lista de emails de administradores predeterminados (fallback en caso de error)
const FALLBACK_ADMIN_EMAILS = [
  'd86webs@gmail.com',
  'coderflixarg@gmail.com', 
  'sebastianperez6@hotmail.com',
];

// Función para obtener administradores dinámicamente desde Google Sheets (solo servidor)
export async function getAdminEmailsFromSheets(): Promise<string[]> {
  // Solo ejecutar en el servidor
  if (typeof window !== 'undefined') {
    console.warn('getAdminEmailsFromSheets llamada en el cliente, usando fallback');
    return FALLBACK_ADMIN_EMAILS;
  }

  try {
    // Importación dinámica para evitar problemas de client-side
    const { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } = await import('./google-sheets');
    const { sheetsCache, generateCacheKey } = await import('./sheets-cache');
    const { withRateLimit } = await import('./rate-limiter');

    // Intentar obtener del caché primero
    const cacheKey = generateCacheKey('admin', 'getAdminEmails', 'all');
    const cachedAdmins = sheetsCache.get<string[]>(cacheKey);
    
    if (cachedAdmins) {
      console.log('🎯 Cache HIT para administradores');
      return cachedAdmins;
    }

    console.log('📡 Cache MISS para administradores - consultando Google Sheets');
    
    const sheets = await getGoogleSheetsAuth();
    
    const response = await withRateLimit(async () => {
      return sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.USERS}!A2:E`, // ID, Nombre, Email, Rol, Fecha
      });
    });

    const rows = response.data.values || [];
    
    // Filtrar usuarios con rol 'admin'
    const adminEmails = rows
      .filter(row => row[3] === 'admin') // Columna D es el rol
      .map(row => row[2]) // Columna C es el email
      .filter(email => email && email.trim() !== ''); // Filtrar emails válidos

    console.log('✅ Administradores obtenidos desde Sheets:', adminEmails.length);
    
    // Cachear por 5 minutos
    sheetsCache.set(cacheKey, adminEmails, 5);
    
    return adminEmails;
  } catch (error) {
    console.error('❌ Error al obtener administradores desde Sheets:', error);
    console.log('🔄 Usando lista de fallback');
    return FALLBACK_ADMIN_EMAILS;
  }
}

// Función para verificar si un email es de administrador (dinámico)
export const isAdminEmail = async (email: string | null | undefined): Promise<boolean> => {
  if (!email) return false;
  
  try {
    const adminEmails = await getAdminEmailsFromSheets();
    return adminEmails.includes(email.toLowerCase());
  } catch (error) {
    console.error('❌ Error al verificar admin dinámico, usando fallback:', error);
    return FALLBACK_ADMIN_EMAILS.includes(email.toLowerCase());
  }
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

// Función para verificar si una sesión tiene permisos de admin (completamente dinámico)
export const isAdminUser = async (session: { user?: { email?: string | null } } | null): Promise<boolean> => {
  if (!session?.user?.email) return false;
  
  try {
    // Usar la función dinámica que consulta Google Sheets
    return await isAdminEmail(session.user.email);
  } catch (error) {
    console.error('Error al verificar admin, usando fallback:', error);
    // Fallback: usar la lista de emails de admin
    return isAdminEmailSync(session.user.email);
  }
};

// Función para verificar si un usuario tiene un rol específico
export const userHasRole = async (session: { user?: { email?: string | null } } | null, role: UserRole): Promise<boolean> => {
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
export const getUserRole = async (session: { user?: { email?: string | null } } | null): Promise<UserRole> => {
  if (!session?.user?.email) return 'user';
  
  try {
    const roleInfo = await getUserRoleInfo();
    return roleInfo.role;
  } catch (error) {
    console.error('Error al obtener rol:', error);
    return (await isAdminEmail(session.user.email)) ? 'admin' : 'user';
  }
};

// Función para invalidar el cache de administradores (útil cuando se actualizan roles)
export const invalidateAdminCache = async (): Promise<void> => {
  // Solo ejecutar en el servidor
  if (typeof window !== 'undefined') {
    console.warn('invalidateAdminCache llamada en el cliente, ignorando');
    return;
  }

  try {
    const { sheetsCache, generateCacheKey } = await import('./sheets-cache');
    const cacheKey = generateCacheKey('admin', 'getAdminEmails', 'all');
    sheetsCache.delete(cacheKey);
    console.log('🗑️ Cache de administradores invalidado');
  } catch (error) {
    console.error('Error al invalidar cache:', error);
  }
};

// Función para verificar acceso administrativo (para usar en API routes)
export const verifyAdminAccess = async (userEmail: string | null | undefined): Promise<boolean> => {
  if (!userEmail) return false;
  
  try {
    return await isAdminEmail(userEmail);
  } catch (error) {
    console.error('Error al verificar acceso admin:', error);
    return false;
  }
};
