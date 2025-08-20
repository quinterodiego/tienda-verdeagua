import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFromSheets, updateUserPassword } from '@/lib/users-sheets-new';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { action, email, newPassword } = await request.json();

    if (action === 'check_user') {
      // Verificar si el usuario existe en Google Sheets
      const user = await getUserFromSheets(email || session.user.email);
      
      return NextResponse.json({
        userExists: !!user,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasPassword: !!user.password,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        } : null
      });
    }

    if (action === 'test_password_update') {
      if (!email || !newPassword) {
        return NextResponse.json({ error: 'Email y password requeridos' }, { status: 400 });
      }

      // Solo permitir al admin o al mismo usuario
      if (session.user.email !== email && session.user.email !== 'd86webs@gmail.com') {
        return NextResponse.json({ error: 'No autorizado para este usuario' }, { status: 403 });
      }

      console.log('🧪 TEST: Actualizando password para:', email);
      
      // Verificar usuario antes
      const userBefore = await getUserFromSheets(email);
      if (!userBefore) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Actualizar contraseña
      const updateResult = await updateUserPassword(email, hashedPassword);
      
      // Verificar usuario después
      const userAfter = await getUserFromSheets(email);
      
      // Verificar si la nueva contraseña funciona
      let passwordWorks = false;
      if (userAfter?.password) {
        try {
          passwordWorks = await bcrypt.compare(newPassword, userAfter.password);
        } catch (error) {
          console.error('Error comparando passwords:', error);
        }
      }

      return NextResponse.json({
        success: updateResult,
        userBefore: userBefore ? {
          id: userBefore.id,
          email: userBefore.email,
          hasPassword: !!userBefore.password,
          updatedAt: userBefore.updatedAt
        } : null,
        userAfter: userAfter ? {
          id: userAfter.id,
          email: userAfter.email,
          hasPassword: !!userAfter.password,
          updatedAt: userAfter.updatedAt
        } : null,
        passwordWorks,
        hashedPassword: hashedPassword.substring(0, 20) + '...' // Mostrar solo parte del hash
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error en debug-password:', error);
    return NextResponse.json({
      error: 'Error interno',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
