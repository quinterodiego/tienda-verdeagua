import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { 
  getAdminUsersFromSheets, 
  updateAdminUserInSheets,
  AdminUser 
} from '@/lib/admin-users-sheets';

// GET /api/admin/users - Obtener todos los usuarios para admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const users = await getAdminUsersFromSheets();
    
    return NextResponse.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios de admin:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Actualizar un usuario
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID del usuario requerido' }, { status: 400 });
    }

    // Preparar actualizaciones
    const updates: Partial<AdminUser> = {};
    
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.role !== undefined) updates.role = body.role;
    if (body.lastLogin !== undefined) updates.lastLogin = body.lastLogin;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.ordersCount !== undefined) updates.ordersCount = parseInt(body.ordersCount);
    if (body.totalSpent !== undefined) updates.totalSpent = parseFloat(body.totalSpent);

    // Actualizar en Google Sheets
    const success = await updateAdminUserInSheets(body.id, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar el usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
