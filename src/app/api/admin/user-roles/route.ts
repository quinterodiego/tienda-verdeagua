import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllUsersFromSheets, updateUserRoleByEmailInSheets } from '@/lib/users-sheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar si el usuario es admin
    if (!session?.user?.email) {
      console.log('❌ GET /api/admin/user-roles: No hay sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de admin
    const adminEmails = ['d86webs@gmail.com'];
    const isAdmin = adminEmails.includes(session.user.email);
    
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

    // Verificar permisos de admin
    const adminEmails = ['d86webs@gmail.com'];
    const isAdmin = adminEmails.includes(session.user.email);
    
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
