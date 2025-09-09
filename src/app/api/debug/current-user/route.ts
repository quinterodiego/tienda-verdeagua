import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { verifyDebugAdminAccess } from '@/lib/debug-admin-helper';
import { getUserFromSheets } from '@/lib/users-sheets';
import { getAdminEmailsFromSheets } from '@/lib/admin-config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug de usuario actual iniciado');
    
    // Verificar acceso de debug
    const hasDebugAccess = await verifyDebugAdminAccess(request);
    if (!hasDebugAccess) {
      return NextResponse.json(
        { error: 'Acceso denegado para debug' },
        { status: 403 }
      );
    }

    // Obtener sesión actual
    const session = await getServerSession(authOptions);
    console.log('👤 Sesión actual:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    });

    if (!session?.user?.email) {
      return NextResponse.json({
        success: true,
        debug: {
          hasSession: !!session,
          message: 'No hay sesión activa o email disponible'
        }
      });
    }

    const userEmail = session.user.email;

    // 1. Obtener información del usuario desde Google Sheets
    let userFromSheets = null;
    let sheetsError = null;
    try {
      userFromSheets = await getUserFromSheets(userEmail);
      console.log('📊 Usuario desde Sheets:', userFromSheets);
    } catch (error) {
      sheetsError = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error al obtener usuario desde Sheets:', error);
    }

    // 2. Obtener lista de administradores
    let adminEmails: string[] = [];
    let adminError = null;
    try {
      adminEmails = await getAdminEmailsFromSheets();
      console.log('👑 Admins desde Sheets:', adminEmails);
    } catch (error) {
      adminError = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error al obtener admins desde Sheets:', error);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      currentUser: {
        email: userEmail,
        name: session.user.name,
        image: session.user.image
      },
      userFromSheets: {
        data: userFromSheets,
        error: sheetsError,
        found: !!userFromSheets
      },
      adminVerification: {
        adminEmails: adminEmails,
        isAdminInSheets: adminEmails.includes(userEmail),
        error: adminError,
        totalAdmins: adminEmails.length
      },
      analysis: {
        hasUserRecord: !!userFromSheets,
        userRole: userFromSheets?.role || 'No encontrado',
        isAdminByEmail: adminEmails.includes(userEmail),
        isAdminByRole: userFromSheets?.role === 'admin',
        discrepancy: userFromSheets?.role !== 'admin' && adminEmails.includes(userEmail)
      }
    });

  } catch (error) {
    console.error('❌ Error en debug de usuario actual:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
