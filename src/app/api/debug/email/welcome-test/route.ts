import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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

    console.log(`📧 Enviando email de bienvenida de prueba a ${testEmail}...`);

    const result = await sendWelcomeEmail({
      userName: 'Usuario de Prueba',
      userEmail: testEmail
    });

    if (result.success) {
      console.log('✅ Email de bienvenida enviado exitosamente');
      return NextResponse.json({
        success: true,
        message: `Email de bienvenida enviado exitosamente a ${testEmail}`,
        messageId: result.messageId
      });
    } else {
      console.error('❌ Error enviando email de bienvenida:', result.error);
      return NextResponse.json({
        error: 'Error enviando email de bienvenida',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en test de email de bienvenida:', error);
    return NextResponse.json({ 
      error: 'Error en test de email de bienvenida',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
