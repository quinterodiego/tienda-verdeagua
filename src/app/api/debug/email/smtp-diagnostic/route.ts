import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    console.log('🔍 Iniciando diagnóstico completo de SMTP...');
    
    // Configuración desde variables de entorno
    const emailConfig = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM,
      fromName: process.env.EMAIL_FROM_NAME,
      admin: process.env.EMAIL_ADMIN
    };

    console.log('📧 Configuración de email:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.user,
      password: emailConfig.password ? `****${emailConfig.password.slice(-4)}` : 'NO CONFIGURADO',
      from: emailConfig.from,
      fromName: emailConfig.fromName,
      admin: emailConfig.admin
    });

    // Verificar que todas las variables están configuradas
    const missingVars = [];
    if (!emailConfig.host) missingVars.push('EMAIL_HOST');
    if (!emailConfig.port) missingVars.push('EMAIL_PORT');
    if (!emailConfig.user) missingVars.push('EMAIL_USER');
    if (!emailConfig.password) missingVars.push('EMAIL_PASSWORD');
    if (!emailConfig.from) missingVars.push('EMAIL_FROM');

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Variables de entorno faltantes',
        missingVars,
        emailConfig
      }, { status: 400 });
    }

    console.log('✅ Todas las variables de entorno están configuradas');

    // Probar envío usando la función existente
    console.log('� Probando envío de email usando función existente...');
    
    const testEmailHtml = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2d5a27;">✅ Test de SMTP Exitoso</h2>
        <p>Este email confirma que la configuración SMTP está funcionando correctamente.</p>
        <div style="background: #f0f8f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>📊 Información del Test:</h3>
          <ul>
            <li><strong>Hora:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Host:</strong> ${emailConfig.host}</li>
            <li><strong>Puerto:</strong> ${emailConfig.port}</li>
            <li><strong>Usuario:</strong> ${emailConfig.user}</li>
          </ul>
        </div>
        <p style="color: #666; font-size: 14px;">
          Si recibes este email, la configuración SMTP está funcionando perfectamente.
        </p>
      </div>
    `;

    await sendEmail({
      to: emailConfig.admin || emailConfig.user || '',
      subject: '🧪 Test de Diagnóstico SMTP - ' + new Date().toLocaleString(),
      html: testEmailHtml
    });

    console.log('✅ Email enviado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico SMTP completado exitosamente',
      details: {
        configStatus: 'Todas las variables configuradas',
        emailSent: true,
        sentTo: emailConfig.admin || emailConfig.user,
        timestamp: new Date().toISOString()
      },
      emailConfig: {
        ...emailConfig,
        password: emailConfig.password ? '****' : 'NO CONFIGURADO' // Ocultar password en respuesta
      }
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico SMTP:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    let errorDetails = '';
    let suggestions: string[] = [];

    if (errorMessage.includes('Invalid login')) {
      errorDetails = 'Error de autenticación - Credenciales inválidas';
      suggestions = [
        '1. Verifica que tengas habilitada la verificación en 2 pasos en Gmail',
        '2. Genera una nueva "Contraseña de aplicación" en Gmail',
        '3. Asegúrate de usar la contraseña de aplicación, NO tu contraseña normal',
        '4. Ve a: Google Account > Security > 2-Step Verification > App passwords'
      ];
    } else if (errorMessage.includes('EAUTH')) {
      errorDetails = 'Error de autenticación SMTP';
      suggestions = [
        '1. Verifica tus credenciales de Gmail',
        '2. Asegúrate de usar una contraseña de aplicación',
        '3. Comprueba que el email y contraseña sean correctos'
      ];
    } else if (errorMessage.includes('ECONNECTION') || errorMessage.includes('ETIMEDOUT')) {
      errorDetails = 'Error de conexión al servidor SMTP';
      suggestions = [
        '1. Verifica tu conexión a internet',
        '2. Comprueba si hay firewalls bloqueando el puerto 587',
        '3. Intenta con puerto 465 (SSL) o 25'
      ];
    }

    return NextResponse.json({
      success: false,
      error: 'Error en diagnóstico SMTP',
      message: errorMessage,
      errorDetails,
      suggestions,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
