import { NextRequest, NextResponse } from 'next/server';
import { validateResetToken, deleteResetToken } from '@/lib/password-reset';
import { updateUserPassword } from '@/lib/users-sheets';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    console.log('🔑 Validando token de reset:', token);

    // Validar token
    const tokenData = await validateResetToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    console.log('✅ Token válido para usuario:', tokenData.email);

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña en Google Sheets
    await updateUserPassword(tokenData.email, hashedPassword);

    // Eliminar token usado
    await deleteResetToken(token);

    console.log('✅ Contraseña actualizada exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
