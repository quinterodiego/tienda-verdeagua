import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllUsersFromSheets, updateUserRoleInSheets } from '@/lib/users-sheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar si el usuario es admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de admin
    const adminEmails = ['d86webs@gmail.com'];
    const isAdmin = adminEmails.includes(session.user.email);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const users = await getAllUsersFromSheets();
    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar si el usuario es admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos de admin
    const adminEmails = ['d86webs@gmail.com'];
    const isAdmin = adminEmails.includes(session.user.email);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email y rol son requeridos' }, { status: 400 });
    }

    const success = await updateUserRoleInSheets(email, role);
    
    if (success) {
      return NextResponse.json({ message: 'Rol actualizado exitosamente' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Error al actualizar el rol' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error al actualizar rol de usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
