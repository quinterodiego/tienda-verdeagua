import { NextRequest, NextResponse } from 'next/server';
import { verifyDebugAdminAccess } from '@/lib/debug-admin-helper';
import { getUserFromSheets, updateUserRoleByEmailInSheets } from '@/lib/users-sheets';
import { invalidateAdminCache } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Corrección de rol de admin iniciada');
    
    // Verificar acceso de debug
    const hasDebugAccess = await verifyDebugAdminAccess(request);
    if (!hasDebugAccess) {
      return NextResponse.json(
        { error: 'Acceso denegado para debug' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, newRole } = body;

    if (!email || !newRole) {
      return NextResponse.json(
        { error: 'Email y newRole son requeridos' },
        { status: 400 }
      );
    }

    if (!['admin', 'user', 'moderator'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Rol inválido. Debe ser: admin, user, o moderator' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const userFromSheets = await getUserFromSheets(email);
    if (!userFromSheets) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en Google Sheets' },
        { status: 404 }
      );
    }

    console.log('👤 Usuario encontrado:', {
      email: userFromSheets.email,
      currentRole: userFromSheets.role,
      newRole: newRole
    });

    // Actualizar el rol
    const updateResult = await updateUserRoleByEmailInSheets(email, newRole);
    
    if (updateResult) {
      // Invalidar cache de administradores si el rol cambió a/desde admin
      if (newRole === 'admin' || userFromSheets.role === 'admin') {
        await invalidateAdminCache();
        console.log('🗑️ Cache de administradores invalidado');
      }

      console.log('✅ Rol actualizado exitosamente');
      return NextResponse.json({
        success: true,
        message: `Rol actualizado de '${userFromSheets.role}' a '${newRole}'`,
        user: {
          email: email,
          previousRole: userFromSheets.role,
          newRole: newRole
        },
        cacheInvalidated: newRole === 'admin' || userFromSheets.role === 'admin'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al actualizar el rol en Google Sheets'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error en corrección de rol:', error);
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

// GET para mostrar información de ayuda
export async function GET(request: NextRequest) {
  try {
    // Verificar acceso de debug
    const hasDebugAccess = await verifyDebugAdminAccess(request);
    if (!hasDebugAccess) {
      return NextResponse.json(
        { error: 'Acceso denegado para debug' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      endpoint: '/api/debug/fix-user-role',
      description: 'Actualiza el rol de un usuario en Google Sheets',
      method: 'POST',
      body: {
        email: 'string (requerido)',
        newRole: 'string (admin|user|moderator) (requerido)'
      },
      example: {
        email: 'coderflixarg@gmail.com',
        newRole: 'admin'
      }
    });
  } catch (error) {
    console.error('❌ Error en GET de fix-user-role:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
