import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar autorización (permitir admin emails)
    const adminEmails = ['d86webs@gmail.com', 'coderflixarg@gmail.com'];
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { testEmail } = await request.json();

    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return NextResponse.json({ 
        error: 'Email de prueba inválido' 
      }, { status: 400 });
    }

    console.log('🔐 Probando email de reset de contraseña...');

    // Generar URL de reset de prueba
    const resetToken = 'test-token-' + Date.now();
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;

    console.log(`🔗 URL de reset generada: ${resetUrl}`);
    console.log(`📧 Enviando email de reset a: ${testEmail}`);

    // Enviar email de reset de prueba
    await sendPasswordResetEmail({
      to: testEmail,
      resetUrl,
      userName: 'Usuario de Prueba'
    });

    console.log('✅ Email de reset de contraseña enviado exitosamente');

    return NextResponse.json({
      success: true,
      message: `Email de reset de contraseña enviado exitosamente a ${testEmail}`,
      resetUrl: resetUrl,
      emailSent: true,
      testInfo: {
        to: testEmail,
        userName: 'Usuario de Prueba',
        resetToken: resetToken,
        expiresIn: '1 hora'
      }
    });

  } catch (error) {
    console.error('❌ Error enviando email de reset:', error);
    
    let errorMessage = 'Error desconocido';
    let details = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Errores específicos de email
      if (error.message.includes('Invalid login')) {
        details = 'Credenciales SMTP incorrectas. Verifica EMAIL_USER y EMAIL_PASSWORD.';
      } else if (error.message.includes('ENOTFOUND')) {
        details = 'No se pudo conectar al servidor SMTP. Verifica EMAIL_HOST.';
      } else if (error.message.includes('ECONNREFUSED')) {
        details = 'Conexión rechazada. Verifica EMAIL_PORT y EMAIL_SECURE.';
      } else if (error.message.includes('Missing credentials')) {
        details = 'Faltan credenciales SMTP. Configura EMAIL_USER y EMAIL_PASSWORD.';
      }
    }

    return NextResponse.json({ 
      error: 'Error enviando email de reset',
      details: details || errorMessage,
      suggestions: [
        'Verifica la configuración SMTP',
        'Ejecuta primero el test básico SMTP',
        'Revisa los logs del servidor',
        'Verifica que EMAIL_FROM esté configurado correctamente'
      ]
    }, { status: 500 });
  }
}
