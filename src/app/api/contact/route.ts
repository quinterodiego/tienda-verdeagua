import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

interface ContactFormData {
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { nombre, email, telefono, asunto, mensaje } = body;

    // Validaciones básicas
    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Crear el contenido del email
    const contactEmailContent = createContactEmail({
      nombre,
      email,
      telefono,
      asunto,
      mensaje
    });

    // Enviar email al admin
    const adminEmail = process.env.EMAIL_FROM || 'info@verdeaguapersonalizados.com';
    const result = await sendEmail({
      to: adminEmail,
      subject: `💬 Nuevo mensaje de contacto: ${asunto}`,
      html: contactEmailContent,
    });

    if (!result.success) {
      console.error('Error enviando email de contacto:', result.error);
      return NextResponse.json(
        { error: 'Error al enviar el mensaje. Inténtalo nuevamente.' },
        { status: 500 }
      );
    }

    // Enviar email de confirmación al usuario
    const confirmationEmail = createContactConfirmationEmail({
      nombre,
      email,
      asunto
    });

    await sendEmail({
      to: email,
      subject: '✅ Mensaje recibido - Verde Agua Personalizados',
      html: confirmationEmail,
    });

    console.log('📧 Email de contacto enviado exitosamente desde:', email);

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente. Te contactaremos pronto.'
    });

  } catch (error) {
    console.error('Error procesando mensaje de contacto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Template para email de contacto (para el admin)
function createContactEmail(data: ContactFormData) {
  const { nombre, email, telefono, asunto, mensaje } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo mensaje de contacto</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fffe;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #ffffff, #f8fffe); 
          color: #2d3748; 
          padding: 30px 40px; 
          text-align: center;
          border-bottom: 3px solid #68c3b7;
        }
        .logo { 
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 200px;
          height: auto;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 300;
          color: #2d3748;
        }
        .content { 
          padding: 40px;
          background-color: white;
        }
        .message-info {
          background: #f7fafc;
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 4px solid #68c3b7;
        }
        .info-row {
          display: flex;
          margin-bottom: 15px;
          align-items: flex-start;
        }
        .info-label {
          font-weight: 600;
          color: #2d3748;
          min-width: 100px;
          margin-right: 15px;
        }
        .info-value {
          color: #4a5568;
          flex: 1;
        }
        .message-content {
          background: #fff5d4;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #f6d55c;
          margin-top: 20px;
        }
        .message-content h3 {
          margin-top: 0;
          color: #8b5a00;
        }
        .footer { 
          background-color: #f7fafc;
          padding: 30px 40px;
          text-align: center; 
          border-top: 1px solid #e2e8f0;
        }
        .footer p { 
          color: #718096; 
          font-size: 14px; 
          margin: 5px 0;
        }
        .priority-high {
          background: #fed7d7;
          border-left-color: #f56565;
        }
        .priority-medium {
          background: #fefcbf;
          border-left-color: #ecc94b;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <h1>💬 Nuevo Mensaje de Contacto</h1>
        </div>
        
        <div class="content">
          <div class="message-info ${getPriorityClass(asunto)}">
            <div class="info-row">
              <span class="info-label">Nombre:</span>
              <span class="info-value"><strong>${nombre}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value"><a href="mailto:${email}" style="color: #68c3b7;">${email}</a></span>
            </div>
            ${telefono ? `
            <div class="info-row">
              <span class="info-label">Teléfono:</span>
              <span class="info-value"><a href="tel:${telefono}" style="color: #68c3b7;">${telefono}</a></span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Asunto:</span>
              <span class="info-value"><strong>${getAsuntoLabel(asunto)}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha:</span>
              <span class="info-value">${new Date().toLocaleString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>

          <div class="message-content">
            <h3>📝 Mensaje:</h3>
            <p style="white-space: pre-wrap; margin: 0;">${mensaje}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
            <p style="margin: 0; color: #4a5568;">🚀 <strong>Acción requerida:</strong> Responder a este cliente</p>
            <p style="margin: 5px 0 0 0;">
              <a href="mailto:${email}?subject=Re: ${asunto}" style="color: #68c3b7; text-decoration: none; font-weight: 500;">
                Responder email →
              </a>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Verde Agua Personalizados</strong> - Sistema de Contacto</p>
          <p>© 2025 Verde Agua Personalizados. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template para email de confirmación (para el usuario)
function createContactConfirmationEmail(data: { nombre: string; email: string; asunto: string }) {
  const { nombre, asunto } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mensaje recibido - Verde Agua Personalizados</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fffe;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #ffffff, #f8fffe); 
          color: #2d3748; 
          padding: 30px 40px; 
          text-align: center;
          border-bottom: 3px solid #68c3b7;
        }
        .logo { 
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 200px;
          height: auto;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 300;
          color: #2d3748;
        }
        .content { 
          padding: 40px;
          background-color: white;
        }
        .confirmation-message {
          text-align: center;
          margin-bottom: 30px;
        }
        .confirmation-message h2 { 
          color: #2d3748; 
          font-size: 24px; 
          margin-bottom: 15px;
          font-weight: 400;
        }
        .status-badge {
          display: inline-block;
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin: 10px 0;
        }
        .info-box {
          background: #f7fafc;
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 4px solid #68c3b7;
        }
        .contact-info {
          background: #fff5d4;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        .footer { 
          background-color: #f7fafc;
          padding: 30px 40px;
          text-align: center; 
          border-top: 1px solid #e2e8f0;
        }
        .footer p { 
          color: #718096; 
          font-size: 14px; 
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <h1>✅ Mensaje Recibido</h1>
        </div>
        
        <div class="content">
          <div class="confirmation-message">
            <h2>¡Hola ${nombre}!</h2>
            <div class="status-badge">✓ Mensaje recibido correctamente</div>
            <p style="color: #4a5568; font-size: 16px; margin-top: 15px;">
              Hemos recibido tu mensaje sobre <strong>"${getAsuntoLabel(asunto)}"</strong> y nuestro equipo lo revisará pronto.
            </p>
          </div>
          
          <div class="info-box">
            <h3 style="color: #2d3748; margin-top: 0;">🚀 ¿Qué sigue ahora?</h3>
            <p style="margin: 10px 0;"><strong>1.</strong> Nuestro equipo revisará tu mensaje en las próximas horas</p>
            <p style="margin: 10px 0;"><strong>2.</strong> Te responderemos por email en menos de 24 horas</p>
            <p style="margin: 10px 0;"><strong>3.</strong> Para consultas urgentes, puedes contactarnos por WhatsApp</p>
          </div>

          <div class="contact-info">
            <h4 style="color: #8b5a00; margin-top: 0;">📞 ¿Necesitas respuesta inmediata?</h4>
            <p style="margin: 5px 0; color: #4a5568;">
              <strong>WhatsApp:</strong> +54 9 11 1234-5678<br>
              <strong>Email:</strong> info@verdeaguapersonalizados.com
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
            <p style="margin: 0; color: #4a5568;">Mientras tanto, puedes seguir explorando nuestros productos</p>
            <p style="margin: 10px 0 0 0;">
              <a href="${baseUrl}" style="color: #68c3b7; text-decoration: none; font-weight: 500;">
                Ir a la tienda →
              </a>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Verde Agua Personalizados</strong></p>
          <p>Tu tienda online de productos personalizados</p>
          <p style="margin-top: 20px; font-size: 12px;">© 2025 Verde Agua Personalizados. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Funciones auxiliares
function getAsuntoLabel(asunto: string): string {
  const asuntos: Record<string, string> = {
    'consulta-producto': 'Consulta sobre producto',
    'pedido-personalizado': 'Pedido personalizado',
    'problema-pedido': 'Problema con pedido',
    'sugerencia': 'Sugerencia',
    'otro': 'Otro'
  };
  return asuntos[asunto] || asunto;
}

function getPriorityClass(asunto: string): string {
  const highPriority = ['problema-pedido'];
  const mediumPriority = ['pedido-personalizado', 'consulta-producto'];
  
  if (highPriority.includes(asunto)) return 'priority-high';
  if (mediumPriority.includes(asunto)) return 'priority-medium';
  return '';
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de contacto funcionando',
    usage: 'POST para enviar mensajes de contacto',
  });
}
