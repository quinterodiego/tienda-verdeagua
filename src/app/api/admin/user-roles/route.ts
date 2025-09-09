import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllUsersFromSheets, updateUserRoleByEmailInSheets, deleteUserByEmailFromSheets } from '@/lib/users-sheets';
import { verifyAdminAccess, invalidateAdminCache } from '@/lib/admin-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar si el usuario es admin
    if (!session?.user?.email) {
      console.log('❌ GET /api/admin/user-roles: No hay sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de admin usando el sistema dinámico
    const isAdmin = await verifyAdminAccess(session.user.email);
    
    if (!isAdmin) {
      console.log('❌ GET /api/admin/user-roles: Usuario no es admin:', session.user.email);
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    console.log('📋 GET /api/admin/user-roles: Obteniendo usuarios...');
    const users = await getAllUsersFromSheets();
    console.log('✅ GET /api/admin/user-roles: Usuarios obtenidos:', users.length);
    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error('❌ GET /api/admin/user-roles: Error interno:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar si el usuario es admin
    if (!session?.user?.email) {
      console.log('❌ PUT /api/admin/user-roles: No hay sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de admin usando el sistema dinámico
    const isAdmin = await verifyAdminAccess(session.user.email);
    
    if (!isAdmin) {
      console.log('❌ PUT /api/admin/user-roles: Usuario no es admin:', session.user.email);
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { email, role } = await request.json();
    console.log('📝 PUT /api/admin/user-roles: Actualizando rol', { email, role });

    if (!email || !role) {
      console.log('❌ PUT /api/admin/user-roles: Faltan parámetros', { email, role });
      return NextResponse.json({ error: 'Email y rol son requeridos' }, { status: 400 });
    }

    const success = await updateUserRoleByEmailInSheets(email, role);
    
    if (success) {
      // Si se actualizó el rol de admin, invalidar el cache de administradores
      if (role === 'admin' || role === 'user') {
        invalidateAdminCache();
        console.log('🔄 Cache de administradores invalidado debido a cambio de rol');
      }
      
      console.log('✅ PUT /api/admin/user-roles: Rol actualizado exitosamente');
      return NextResponse.json({ message: 'Rol actualizado exitosamente' }, { status: 200 });
    } else {
      console.log('❌ PUT /api/admin/user-roles: Error al actualizar rol en Sheets');
      return NextResponse.json({ error: 'Error al actualizar el rol' }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ PUT /api/admin/user-roles: Error interno:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar si el usuario es admin
    if (!session?.user?.email) {
      console.log('❌ DELETE /api/admin/user-roles: No hay sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de admin usando el sistema dinámico
    const isAdmin = await verifyAdminAccess(session.user.email);
    
    if (!isAdmin) {
      console.log('❌ DELETE /api/admin/user-roles: Usuario no es admin:', session.user.email);
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { email } = await request.json();
    console.log('🗑️ DELETE /api/admin/user-roles: Eliminando usuario', { email });

    if (!email) {
      console.log('❌ DELETE /api/admin/user-roles: Falta email', { email });
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    // Prevenir que un admin se elimine a sí mismo
    if (email === session.user.email) {
      console.log('❌ DELETE /api/admin/user-roles: Admin intenta eliminarse a sí mismo');
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });
    }

    const success = await deleteUserByEmailFromSheets(email);
    
    if (success) {
      // Invalidar el cache de administradores por si se eliminó un admin
      invalidateAdminCache();
      console.log('🔄 Cache invalidado después de eliminar usuario');
      
      console.log('✅ DELETE /api/admin/user-roles: Usuario eliminado exitosamente');
      return NextResponse.json({ message: 'Usuario eliminado exitosamente' }, { status: 200 });
    } else {
      console.log('❌ DELETE /api/admin/user-roles: Error al eliminar usuario de Sheets');
      return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ DELETE /api/admin/user-roles: Error interno:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}
