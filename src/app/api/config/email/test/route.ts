import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'd86webs@gmail.com') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { testEmail } = await request.json();

    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return NextResponse.json({ 
        error: 'Email de prueba inválido' 
      }, { status: 400 });
    }

    // Configurar transporter con variables de entorno actuales
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verificar conexión
    await transporter.verify();

    // Enviar email de prueba
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Verde Agua'}" <${process.env.EMAIL_FROM}>`,
      to: testEmail,
      subject: '🧪 Email de Prueba - Verde Agua Configuración',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Configuración de Email Funcionando</h2>
          
          <p>Este es un email de prueba para verificar que la configuración de emails está funcionando correctamente.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📊 Configuración Actual:</h3>
            <ul>
              <li><strong>Servidor:</strong> ${process.env.EMAIL_HOST}</li>
              <li><strong>Puerto:</strong> ${process.env.EMAIL_PORT}</li>
              <li><strong>Seguro:</strong> ${process.env.EMAIL_SECURE === 'true' ? 'Sí' : 'No'}</li>
              <li><strong>Usuario:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>Email FROM:</strong> ${process.env.EMAIL_FROM}</li>
              <li><strong>Email ADMIN:</strong> ${process.env.EMAIL_ADMIN}</li>
            </ul>
          </div>
          
          <p>Si recibiste este email, significa que:</p>
          <ul>
            <li>✅ La configuración SMTP está correcta</li>
            <li>✅ Las credenciales son válidas</li>
            <li>✅ El servidor puede enviar emails</li>
          </ul>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Email enviado desde: Verde Agua Personalizados<br>
            Fecha: ${new Date().toLocaleString('es-AR')}
          </p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado exitosamente a ${testEmail}`,
      messageId: info.messageId,
      emailConfig: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        from: process.env.EMAIL_FROM,
        admin: process.env.EMAIL_ADMIN
      }
    });

  } catch (error) {
    console.error('Error al enviar email de prueba:', error);
    
    let errorMessage = 'Error desconocido';
    let details = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Errores específicos de SMTP
      if (error.message.includes('Invalid login')) {
        details = 'Credenciales SMTP incorrectas. Verifica EMAIL_USER y EMAIL_PASSWORD.';
      } else if (error.message.includes('ENOTFOUND')) {
        details = 'No se pudo conectar al servidor SMTP. Verifica EMAIL_HOST.';
      } else if (error.message.includes('ECONNREFUSED')) {
        details = 'Conexión rechazada. Verifica EMAIL_PORT y EMAIL_SECURE.';
      } else if (error.message.includes('Missing credentials')) {
        details = 'Faltan credenciales. Configura EMAIL_USER y EMAIL_PASSWORD.';
      }
    }

    return NextResponse.json({ 
      error: 'Error al enviar email de prueba',
      details: details || errorMessage,
      currentConfig: {
        EMAIL_HOST: process.env.EMAIL_HOST || 'NO CONFIGURADO',
        EMAIL_PORT: process.env.EMAIL_PORT || 'NO CONFIGURADO',
        EMAIL_USER: process.env.EMAIL_USER ? 'CONFIGURADO' : 'NO CONFIGURADO',
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'CONFIGURADO' : 'NO CONFIGURADO',
        EMAIL_FROM: process.env.EMAIL_FROM || 'NO CONFIGURADO'
      }
    }, { status: 500 });
  }
}
