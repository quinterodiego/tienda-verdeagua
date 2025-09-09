// Lista de emails de administradores predeterminados (fallback para cliente)
const FALLBACK_ADMIN_EMAILS = [
  'd86webs@gmail.com',
  'coderflixarg@gmail.com', 
  'sebastianperez6@hotmail.com',
];

// Función sincrónica para verificar admin (fallback para componentes cliente)
export const isAdminEmailSync = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return FALLBACK_ADMIN_EMAILS.includes(email.toLowerCase());
};

// Función para verificar si una sesión es de admin (sincrónica, para componentes cliente)
export const isAdminUserSync = (session: { user?: { email?: string | null } } | null): boolean => {
  return isAdminEmailSync(session?.user?.email);
};
