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

    // Verificar que las variables estén configuradas
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json({
        error: 'Configuración SMTP incompleta',
        details: 'Faltan variables de entorno: EMAIL_HOST, EMAIL_USER, o EMAIL_PASSWORD',
        emailConfig: {
          host: process.env.EMAIL_HOST || 'NO CONFIGURADO',
          port: process.env.EMAIL_PORT || 'NO CONFIGURADO',
          user: process.env.EMAIL_USER ? 'CONFIGURADO' : 'NO CONFIGURADO',
          from: process.env.EMAIL_FROM || 'NO CONFIGURADO'
        }
      }, { status: 400 });
    }

    console.log('🔧 Probando configuración SMTP básica...');

    // Primero probar configuración original
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        }
      });

      // Verificar conexión SMTP
      console.log('🔗 Verificando conexión SMTP...');
      await transporter.verify();
      console.log('✅ Conexión SMTP verificada exitosamente');

      // Enviar email de prueba
      console.log(`📧 Enviando email de prueba a ${testEmail}...`);
      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Verde Agua'}" <${process.env.EMAIL_FROM}>`,
        to: testEmail,
        subject: '🧪 Test SMTP - Verde Agua Personalizados',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">✅ Test SMTP Exitoso</h2>
            
            <p>Este es un email de prueba básico para verificar la conexión SMTP.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📊 Configuración SMTP:</h3>
              <ul>
                <li><strong>Servidor:</strong> ${process.env.EMAIL_HOST}</li>
                <li><strong>Puerto:</strong> ${process.env.EMAIL_PORT}</li>
                <li><strong>Seguro:</strong> ${process.env.EMAIL_SECURE === 'true' ? 'Sí' : 'No'}</li>
                <li><strong>Usuario:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>Email FROM:</strong> ${process.env.EMAIL_FROM}</li>
              </ul>
            </div>
            
            <p><strong>✅ Resultado:</strong> La configuración SMTP está funcionando correctamente.</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Email de prueba enviado desde: Verde Agua Personalizados<br>
              Fecha: ${new Date().toLocaleString('es-AR')}
            </p>
          </div>
        `
      });

      console.log('✅ Email de prueba enviado exitosamente:', info.messageId);

      return NextResponse.json({
        success: true,
        message: `Email SMTP de prueba enviado exitosamente a ${testEmail}`,
        messageId: info.messageId,
        configUsed: 'Configuración original (587 + TLS)',
        emailConfig: {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE,
          from: process.env.EMAIL_FROM,
          admin: process.env.EMAIL_ADMIN
        }
      });

    } catch (originalError) {
      console.error('❌ Error con configuración original:', originalError);
      
      // Si falla, probar configuración alternativa (puerto 465 SSL)
      console.log('🔄 Probando configuración alternativa (puerto 465 SSL)...');
      
      try {
        const transporterAlt = nodemailer.createTransport({
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
        });

        await transporterAlt.verify();
        console.log('✅ Conexión alternativa verificada');

        const info = await transporterAlt.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME || 'Verde Agua'}" <${process.env.EMAIL_FROM}>`,
          to: testEmail,
          subject: '🧪 Test SMTP (Config Alternativa) - Verde Agua',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10b981;">✅ Test SMTP Exitoso (Configuración Alternativa)</h2>
              
              <p>La configuración original falló, pero esta configuración alternativa funcionó.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>📊 Configuración que funcionó:</h3>
                <ul>
                  <li><strong>Servidor:</strong> ${process.env.EMAIL_HOST}</li>
                  <li><strong>Puerto:</strong> 465 (SSL directo)</li>
                  <li><strong>Seguro:</strong> Sí</li>
                  <li><strong>Usuario:</strong> ${process.env.EMAIL_USER}</li>
                </ul>
              </div>
              
              <p><strong>✅ Solución:</strong> Actualiza tu configuración para usar puerto 465 con SSL.</p>
              
              <hr style="margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Email enviado con configuración alternativa<br>
                Fecha: ${new Date().toLocaleString('es-AR')}
              </p>
            </div>
          `
        });

        return NextResponse.json({
          success: true,
          message: `Email enviado con configuración alternativa (puerto 465)`,
          messageId: info.messageId,
          configUsed: 'Puerto 465 SSL (alternativo)',
          originalError: originalError instanceof Error ? originalError.message : 'Error desconocido',
          suggestion: 'Considera cambiar EMAIL_PORT=465 y EMAIL_SECURE=true en tus variables de entorno'
        });

      } catch (altError) {
        console.error('❌ Error con configuración alternativa:', altError);
        
        // Si ambas fallan, devolver el error completo
        let errorMessage = 'Error desconocido';
        let details = '';

        if (originalError instanceof Error) {
          errorMessage = originalError.message;
          
          // Errores específicos de SMTP
          if (originalError.message.includes('Invalid login')) {
            details = 'Credenciales SMTP incorrectas. Verifica EMAIL_USER y EMAIL_PASSWORD.';
          } else if (originalError.message.includes('ENOTFOUND')) {
            details = 'No se pudo conectar al servidor SMTP. Verifica EMAIL_HOST.';
          } else if (originalError.message.includes('ECONNREFUSED')) {
            details = 'Conexión rechazada. Verifica EMAIL_PORT y EMAIL_SECURE.';
          } else if (originalError.message.includes('Missing credentials')) {
            details = 'Faltan credenciales. Configura EMAIL_USER y EMAIL_PASSWORD.';
          } else if (originalError.message.includes('certificate')) {
            details = 'Problema de certificado SSL. Intenta cambiar a puerto 465 con EMAIL_SECURE=true.';
          }
        }

        return NextResponse.json({ 
          error: 'Ambas configuraciones SMTP fallaron',
          originalError: errorMessage,
          alternativeError: altError instanceof Error ? altError.message : 'Error desconocido',
          details: details || errorMessage,
          suggestions: [
            'Verifica que EMAIL_USER y EMAIL_PASSWORD sean correctos',
            'Para Gmail, usa contraseña de aplicación, no la contraseña normal',
            'Intenta cambiar EMAIL_PORT=465 y EMAIL_SECURE=true',
            'Verifica que tengas habilitada la verificación en 2 pasos en Gmail'
          ],
          emailConfig: {
            host: process.env.EMAIL_HOST || 'NO CONFIGURADO',
            port: process.env.EMAIL_PORT || 'NO CONFIGURADO',
            user: process.env.EMAIL_USER ? 'CONFIGURADO' : 'NO CONFIGURADO',
            from: process.env.EMAIL_FROM || 'NO CONFIGURADO'
          }
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('❌ Error en test SMTP:', error);
    
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
      error: 'Error en test SMTP',
      details: details || errorMessage,
      emailConfig: {
        host: process.env.EMAIL_HOST || 'NO CONFIGURADO',
        port: process.env.EMAIL_PORT || 'NO CONFIGURADO',
        user: process.env.EMAIL_USER ? 'CONFIGURADO' : 'NO CONFIGURADO',
        from: process.env.EMAIL_FROM || 'NO CONFIGURADO'
      }
    }, { status: 500 });
  }
}
