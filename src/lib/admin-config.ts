// Lista de emails de administradores del sistema
export const ADMIN_EMAILS = [
  'd86webs@gmail.com',
  // Agrega más emails de administradores aquí:
  // 'otro-admin@example.com',
  // 'admin@empresa.com',
];

// Función para verificar si un email es de administrador
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};

// Función para verificar si una sesión tiene permisos de admin
export const isAdminUser = (session: any): boolean => {
  return isAdminEmail(session?.user?.email);
};
