import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSheets } from '@/lib/users-sheets-new';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateResetToken, saveResetToken } from '@/lib/password-reset';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Solicitando reset de contraseña para:', email);

    // Verificar si el usuario existe
    const user = await getUserFromSheets(email);
    
    if (!user) {
      // Por seguridad, siempre retornamos éxito aunque el usuario no exista
      console.log('⚠️ Usuario no encontrado, pero retornando éxito por seguridad');
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación'
      });
    }

    // Generar token de reset
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    console.log('🔑 Token de reset generado:', resetToken);

    // Guardar token en Google Sheets
    await saveResetToken(email, resetToken, expiresAt);

    // Enviar email de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;
    
    await sendPasswordResetEmail({
      to: email,
      resetUrl,
      userName: user.name || 'Usuario'
    });

    console.log('✅ Email de reset enviado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación'
    });

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
