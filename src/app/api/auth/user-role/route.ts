import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFromSheets, hasRole, isAdmin } from '@/lib/users-sheets';
import { getAdminEmailsFromSheets } from '@/lib/admin-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ role: 'user', isAdmin: false }, { status: 200 });
    }

    const user = await getUserFromSheets(session.user.email);
    
    if (user) {
      return NextResponse.json({
        role: user.role,
        isAdmin: isAdmin(user),
        hasModeratorRole: hasRole(user, 'moderator'),
        email: user.email
      }, { status: 200 });
    }

    // Fallback: verificar si es admin dinámicamente desde Google Sheets
    try {
      const adminEmails = await getAdminEmailsFromSheets();
      const isAdminByEmail = adminEmails.includes(session.user.email);
      
      return NextResponse.json({
        role: isAdminByEmail ? 'admin' : 'user',
        isAdmin: isAdminByEmail,
        hasModeratorRole: false,
        email: session.user.email
      }, { status: 200 });
    } catch (adminError) {
      console.error('Error al obtener administradores dinámicos:', adminError);
      
      // Último fallback: lista estática (solo para emergencias)
      const fallbackAdminEmails = ['d86webs@gmail.com', 'coderflixarg@gmail.com', 'sebastianperez6@hotmail.com'];
      const isAdminByEmail = fallbackAdminEmails.includes(session.user.email);
      
      return NextResponse.json({
        role: isAdminByEmail ? 'admin' : 'user',
        isAdmin: isAdminByEmail,
        hasModeratorRole: false,
        email: session.user.email
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Error al verificar rol de usuario:', error);
    
    // En caso de error completo, devolver info básica con fallback
    const session = await getServerSession(authOptions);
    const fallbackAdminEmails = ['d86webs@gmail.com', 'coderflixarg@gmail.com', 'sebastianperez6@hotmail.com'];
    const isAdminByEmail = session?.user?.email ? fallbackAdminEmails.includes(session.user.email) : false;
    
    return NextResponse.json({
      role: isAdminByEmail ? 'admin' : 'user',
      isAdmin: isAdminByEmail,
      hasModeratorRole: false,
      email: session?.user?.email || null
    }, { status: 200 });
  }
}
