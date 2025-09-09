import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar variables de entorno críticas para emails
    const emailConfig = {
      EMAIL_HOST: process.env.EMAIL_HOST ? '✅ Configurado' : '❌ Faltante',
      EMAIL_PORT: process.env.EMAIL_PORT ? '✅ Configurado' : '❌ Faltante',
      EMAIL_SECURE: process.env.EMAIL_SECURE ? '✅ Configurado' : '❌ Faltante',
      EMAIL_USER: process.env.EMAIL_USER ? '✅ Configurado' : '❌ Faltante',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ Faltante',
      EMAIL_FROM: process.env.EMAIL_FROM ? '✅ Configurado' : '❌ Faltante',
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME ? '✅ Configurado' : '❌ Faltante',
    };

    // Verificar Google Sheets (para logs)
    const sheetsConfig = {
      GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? '✅ Configurado' : '❌ Faltante',
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? '✅ Configurado' : '❌ Faltante',
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? '✅ Configurado' : '❌ Faltante',
    };

    // Verificar configuración detallada (sin exponer credenciales)
    const detailedCheck = {
      emailHost: process.env.EMAIL_HOST || 'No configurado',
      emailPort: process.env.EMAIL_PORT || 'No configurado',
      emailSecure: process.env.EMAIL_SECURE || 'No configurado',
      emailUserLength: process.env.EMAIL_USER ? process.env.EMAIL_USER.length : 0,
      emailPasswordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0,
      emailFromLength: process.env.EMAIL_FROM ? process.env.EMAIL_FROM.length : 0,
    };

    // Test básico de configuración de nodemailer
    let transporterTest = '❌ Error';
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASSWORD || '',
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        }
      });
      
      // Intentar verificar la conexión (timeout corto para no bloquear)
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      transporterTest = '✅ Conexión exitosa';
    } catch (error) {
      transporterTest = `❌ Error: ${error instanceof Error ? error.message : 'Desconocido'}`;
    }

    // Información del entorno
    const environment = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      VERCEL_ENV: process.env.VERCEL_ENV || 'No configurado',
      VERCEL_URL: process.env.VERCEL_URL || 'No configurado',
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment,
      emailConfig,
      sheetsConfig,
      detailedCheck,
      transporterTest,
      recommendations: [
        emailConfig.EMAIL_HOST === '❌ Faltante' ? 'Configurar EMAIL_HOST en Vercel' : null,
        emailConfig.EMAIL_USER === '❌ Faltante' ? 'Configurar EMAIL_USER en Vercel' : null,
        emailConfig.EMAIL_PASSWORD === '❌ Faltante' ? 'Configurar EMAIL_PASSWORD en Vercel' : null,
        emailConfig.EMAIL_FROM === '❌ Faltante' ? 'Configurar EMAIL_FROM en Vercel' : null,
        transporterTest.includes('❌') ? 'Verificar credenciales de email y configuración SMTP' : null,
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('Error en diagnóstico de email:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
