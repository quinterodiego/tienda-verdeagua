import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { verifyDebugAdminAccess } from '@/lib/debug-admin-helper';
import { isAdminEmail, getAdminEmailsFromSheets } from '@/lib/admin-config';
import { isAdminEmailSync } from '@/lib/admin-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug de verificación de admin iniciado');
    
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
          userEmail: null,
          adminVerifications: {
            syncCheck: false,
            dynamicCheck: false,
            error: 'No hay sesión o email'
          }
        }
      });
    }

    const userEmail = session.user.email;

    // 1. Verificación sincrónica (fallback)
    const syncCheck = isAdminEmailSync(userEmail);
    console.log('🔒 Verificación sincrónica:', syncCheck);

    // 2. Verificación dinámica
    let dynamicCheck = false;
    let dynamicError = null;
    try {
      dynamicCheck = await isAdminEmail(userEmail);
      console.log('🌐 Verificación dinámica:', dynamicCheck);
    } catch (error) {
      dynamicError = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en verificación dinámica:', error);
    }

    // 3. Obtener lista completa de admins
    let adminEmails: string[] = [];
    let sheetsError = null;
    try {
      adminEmails = await getAdminEmailsFromSheets();
      console.log('📊 Admins desde Sheets:', adminEmails);
    } catch (error) {
      sheetsError = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error al obtener admins desde Sheets:', error);
    }

    // 4. Verificar endpoint de user-role
    let userRoleCheck = null;
    let userRoleError = null;
    try {
      const baseUrl = request.nextUrl.origin;
      const roleResponse = await fetch(`${baseUrl}/api/auth/user-role`, {
        headers: {
          cookie: request.headers.get('cookie') || ''
        }
      });
      
      if (roleResponse.ok) {
        userRoleCheck = await roleResponse.json();
      } else {
        userRoleError = `HTTP ${roleResponse.status}`;
      }
    } catch (error) {
      userRoleError = error instanceof Error ? error.message : 'Error desconocido';
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      session: {
        hasSession: !!session,
        userEmail: userEmail,
        userName: session.user.name
      },
      adminVerifications: {
        syncCheck: {
          result: syncCheck,
          description: 'Verificación contra lista de fallback estática'
        },
        dynamicCheck: {
          result: dynamicCheck,
          error: dynamicError,
          description: 'Verificación dinámica desde Google Sheets'
        },
        userRoleEndpoint: {
          result: userRoleCheck,
          error: userRoleError,
          description: 'Resultado del endpoint /api/auth/user-role'
        }
      },
      adminData: {
        adminEmailsFromSheets: adminEmails,
        sheetsError: sheetsError,
        totalAdmins: adminEmails.length
      },
      recommendations: {
        shouldHaveAccess: dynamicCheck || syncCheck,
        primaryMethod: dynamicCheck ? 'dynamic' : syncCheck ? 'fallback' : 'none',
        issues: [
          ...(dynamicError ? [`Error en verificación dinámica: ${dynamicError}`] : []),
          ...(sheetsError ? [`Error al acceder a Google Sheets: ${sheetsError}`] : []),
          ...(userRoleError ? [`Error en endpoint user-role: ${userRoleError}`] : []),
          ...(!syncCheck && !dynamicCheck ? ['Usuario no tiene permisos de admin en ningún método'] : [])
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error en debug de verificación:', error);
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
