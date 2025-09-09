import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminEmailsFromSheets, verifyAdminAccess, invalidateAdminCache } from '@/lib/admin-config';
import { getUserFromSheets } from '@/lib/users-sheets';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'No hay sesión activa'
      }, { status: 401 });
    }

    // Obtener información completa del sistema de administradores
    const adminEmails = await getAdminEmailsFromSheets();
    const isAdmin = await verifyAdminAccess(session.user.email);
    const user = await getUserFromSheets(session.user.email);
    
    return NextResponse.json({
      success: true,
      systemInfo: {
        dynamicAdminSystem: true,
        cacheEnabled: true,
        fallbackEnabled: true
      },
      currentUser: {
        email: session.user.email,
        name: session.user.name,
        isAdmin,
        roleFromSheets: user?.role || 'not_found'
      },
      adminSystem: {
        totalAdmins: adminEmails.length,
        adminEmails,
        userIsInAdminList: adminEmails.includes(session.user.email)
      },
      googleSheetsStatus: {
        userFound: !!user,
        userRole: user?.role,
        userCreatedAt: user?.createdAt
      },
      testResults: {
        canAccessAdminPanel: isAdmin,
        canManageUsers: isAdmin,
        canModifyRoles: isAdmin
      },
      recommendations: isAdmin ? [
        '✅ Usuario configurado correctamente como administrador',
        '✅ Tiene acceso completo al panel de administración',
        '✅ Puede gestionar usuarios y roles'
      ] : [
        '❌ Usuario no es administrador',
        '💡 Para ser admin, debe tener rol "admin" en Google Sheets',
        '📞 Contacta al administrador principal para asignar permisos'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error en test del sistema dinámico:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error al probar sistema dinámico',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 });
    }

    // Solo administradores pueden invalidar cache
    const isAdmin = await verifyAdminAccess(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Solo administradores pueden invalidar el cache'
      }, { status: 403 });
    }

    const { action } = await request.json();
    
    if (action === 'invalidate_cache') {
      invalidateAdminCache();
      
      return NextResponse.json({
        success: true,
        message: 'Cache de administradores invalidado exitosamente',
        action: 'cache_invalidated',
        by: session.user.email,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Acción no válida'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Error en POST test dinámico:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
