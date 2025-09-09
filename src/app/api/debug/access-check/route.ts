import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminEmailsFromSheets, verifyAdminAccess } from '@/lib/admin-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No hay sesión activa'
      });
    }

    const userEmail = session.user?.email;
    
    // Obtener administradores dinámicamente desde Google Sheets
    const adminEmails = await getAdminEmailsFromSheets();
    const isAdmin = await verifyAdminAccess(userEmail);
    
    // Verificar acceso a cada página
    const pageChecks = {
      '/debug/email': {
        hasAccess: isAdmin,
        description: 'Debug de emails (requiere admin)'
      },
      '/config/email': {
        hasAccess: isAdmin,
        description: 'Configuración de emails (requiere admin)'
      },
      '/config/notification-email': {
        hasAccess: isAdmin,
        description: 'Configuración de notificaciones (requiere admin)'
      },
      '/debug/reset-user': {
        hasAccess: true, // Sin autenticación
        description: 'Reset de usuarios (sin auth)'
      },
      '/admin/user-roles': {
        hasAccess: isAdmin,
        description: 'Gestión de roles de usuario (requiere admin)'
      }
    };
    
    const totalPages = Object.keys(pageChecks).length;
    const accessiblePages = Object.values(pageChecks).filter(page => page.hasAccess).length;
    
    return NextResponse.json({
      success: true,
      session: {
        email: userEmail,
        name: session.user?.name,
        role: session.user?.role
      },
      adminCheck: {
        isAdmin,
        adminEmails,
        userInAdminList: adminEmails.includes(userEmail || ''),
        dynamicSystemEnabled: true // Indica que usa sistema dinámico
      },
      pageAccess: pageChecks,
      summary: {
        totalPages,
        accessiblePages,
        hasFullAccess: accessiblePages === totalPages
      },
      recommendations: accessiblePages < totalPages ? [
        'Verifica que tu usuario tenga rol "admin" en Google Sheets',
        'El sistema ahora obtiene administradores dinámicamente desde la base de datos',
        'Contacta soporte para asignar rol de administrador',
        'Haz logout y login nuevamente si cambiaste el rol recientemente'
      ] : [
        'Tienes acceso completo a todas las páginas de administración',
        'Sistema dinámico de administradores funcionando correctamente'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico de acceso:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error verificando acceso',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
