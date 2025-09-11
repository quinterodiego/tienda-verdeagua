import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST() {
  try {
    console.log('🔍 Test SMTP directo iniciado...');
    
    // 1. Verificar variables de entorno
    const config = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      hasPassword: !!process.env.EMAIL_PASSWORD
    };
    
    console.log('📋 Configuración detectada:', config);
    
    if (!config.host || !config.user || !process.env.EMAIL_PASSWORD) {
      throw new Error('Variables de entorno faltantes');
    }
    
    // 2. Crear transporter con configuración específica para Gmail
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Habilitar debug
      logger: true // Habilitar logging
    });
    
    console.log('⚙️ Transporter creado');
    
    // 3. Test de verificación de conexión
    console.log('🔗 Verificando conexión SMTP...');
    const verification = await transporter.verify();
    console.log('✅ Verificación exitosa:', verification);
    
    // 4. Test de envío real
    console.log('📧 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: config.from,
      to: config.user, // Enviar a nosotros mismos
      subject: '🧪 Test SMTP Directo - ' + new Date().toISOString(),
      html: `
        <h2>✅ Test SMTP Exitoso</h2>
        <p>Este email confirma que la configuración SMTP está funcionando correctamente.</p>
        <hr>
        <p><strong>Configuración utilizada:</strong></p>
        <ul>
          <li>Host: ${config.host}</li>
          <li>Port: ${config.port}</li>
          <li>User: ${config.user}</li>
          <li>From: ${config.from}</li>
          <li>Timestamp: ${new Date().toISOString()}</li>
        </ul>
      `
    });
    
    console.log('✅ Email enviado exitosamente:', info.messageId);
    
    return NextResponse.json({
      success: true,
      message: 'Test SMTP exitoso',
      config: {
        ...config,
        hasPassword: true // No mostrar la contraseña
      },
      verification,
      emailInfo: {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en test SMTP directo:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
        hasPassword: !!process.env.EMAIL_PASSWORD
      },
      timestamp: new Date().toISOString(),
      recommendations: [
        'Verificar que la contraseña de aplicación de Gmail sea correcta',
        'Confirmar que la verificación en 2 pasos esté habilitada en Gmail',
        'Verificar que no haya restricciones de seguridad en la cuenta',
        'Intentar generar una nueva contraseña de aplicación'
      ]
    }, { status: 500 });
  }
}
