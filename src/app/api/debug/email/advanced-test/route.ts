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

    console.log('🔧 Probando diferentes configuraciones SMTP...');

    // Configuración 1: Con TLS más permisivo
    const config1 = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // Forzar a false para usar STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
        servername: process.env.EMAIL_HOST
      }
    };

    // Configuración 2: Sin TLS
    const config2 = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      ignoreTLS: true
    };

    // Configuración 3: Puerto 465 con SSL
    const config3 = {
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    const configs = [
      { name: 'STARTTLS con TLS permisivo (587)', config: config1 },
      { name: 'Sin TLS (587)', config: config2 },
      { name: 'SSL directo (465)', config: config3 }
    ];

    const results = [];

    for (const { name, config } of configs) {
      try {
        console.log(`📡 Probando configuración: ${name}`);
        
        const transporter = nodemailer.createTransport(config);
        
        // Verificar conexión
        await transporter.verify();
        console.log(`✅ Conexión verificada: ${name}`);
        
        // Enviar email de prueba
        const info = await transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME || 'Verde Agua'}" <${process.env.EMAIL_FROM}>`,
          to: testEmail,
          subject: `🧪 Test SMTP - ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10b981;">✅ Test SMTP Exitoso</h2>
              
              <p>Configuración que funcionó: <strong>${name}</strong></p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>📊 Detalles de la configuración:</h3>
                <ul>
                  <li><strong>Servidor:</strong> ${config.host}</li>
                  <li><strong>Puerto:</strong> ${config.port}</li>
                  <li><strong>Seguro:</strong> ${config.secure ? 'Sí' : 'No'}</li>
                  <li><strong>TLS:</strong> ${'tls' in config ? 'Configurado' : 'No'}</li>
                  <li><strong>Ignore TLS:</strong> ${'ignoreTLS' in config ? 'Sí' : 'No'}</li>
                </ul>
              </div>
              
              <p><strong>✅ Esta configuración funciona correctamente.</strong></p>
              
              <hr style="margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Test enviado desde: Verde Agua Personalizados<br>
                Fecha: ${new Date().toLocaleString('es-AR')}
              </p>
            </div>
          `
        });

        console.log(`✅ Email enviado exitosamente con ${name}: ${info.messageId}`);
        
        results.push({
          config: name,
          success: true,
          messageId: info.messageId,
          details: 'Email enviado exitosamente'
        });

        // Si una configuración funciona, usar esa
        return NextResponse.json({
          success: true,
          message: `Email enviado exitosamente usando: ${name}`,
          messageId: info.messageId,
          workingConfig: name,
          configDetails: config,
          allResults: results
        });

      } catch (error) {
        console.error(`❌ Error con configuración ${name}:`, error);
        results.push({
          config: name,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    // Si ninguna configuración funcionó
    return NextResponse.json({
      error: 'Ninguna configuración SMTP funcionó',
      details: 'Se probaron múltiples configuraciones pero todas fallaron',
      allResults: results,
      suggestions: [
        'Verifica que EMAIL_USER y EMAIL_PASSWORD sean correctos',
        'Asegúrate de usar contraseña de aplicación para Gmail',
        'Verifica que la cuenta tenga habilitada la verificación en 2 pasos',
        'Intenta generar una nueva contraseña de aplicación'
      ]
    }, { status: 500 });

  } catch (error) {
    console.error('❌ Error en test avanzado SMTP:', error);
    return NextResponse.json({ 
      error: 'Error en test avanzado SMTP',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
