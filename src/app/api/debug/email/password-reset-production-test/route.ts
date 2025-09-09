import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userName } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email es requerido'
      }, { status: 400 });
    }

    // Crear URL de reset de prueba
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.vercel.app'}/auth/reset-password?token=test-token-123`;
    
    console.log('🧪 Enviando email de test de password reset:', {
      email,
      userName: userName || 'Usuario de Prueba',
      resetUrl,
      timestamp: new Date().toISOString()
    });

    // Intentar enviar el email
    const result = await sendPasswordResetEmail({
      to: email,
      resetUrl,
      userName: userName || 'Usuario de Prueba'
    });

    console.log('📧 Resultado del envío:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de reset de contraseña enviado exitosamente',
        details: {
          messageId: result.messageId,
          emailId: result.emailId,
          to: email,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Error al enviar email de reset de contraseña',
        details: {
          error: result.error,
          emailId: result.emailId,
          to: email,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error crítico en test de password reset:', error);
    return NextResponse.json({
      success: false,
      error: 'Error crítico en el servidor',
      details: {
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para test de password reset',
    usage: 'POST con { "email": "test@example.com", "userName": "Nombre" }',
    example: {
      method: 'POST',
      body: {
        email: 'test@example.com',
        userName: 'Usuario de Prueba'
      }
    }
  });
}
