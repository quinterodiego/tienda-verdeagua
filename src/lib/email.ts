import nodemailer from 'nodemailer';
import type { 
  EmailConfig, 
  SendEmailParams, 
  OrderEmailData, 
  WelcomeEmailData,
  TestEmailData 
} from '@/types/email';

// Configuración del transportador de email
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
    from: {
      email: process.env.EMAIL_FROM || '',
      name: process.env.EMAIL_FROM_NAME || 'Verde Agua',
    }
  };

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Función principal para enviar emails
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_FROM || '';
    const fromName = process.env.EMAIL_FROM_NAME || 'Verde Agua';

    const result = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback a texto plano
    });

    console.log('Email enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Template para email de bienvenida
export function createWelcomeEmail(data: WelcomeEmailData) {
  const { userName, userEmail } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a Verde Agua Personalizados!</title>
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
          /* Logo en colores originales para el header */
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 300;
          color: #2d3748;
          text-shadow: none;
        }
        .header p { 
          margin: 10px 0 0 0; 
          font-size: 16px; 
          color: #68c3b7;
          font-weight: 500;
        }
        .content { 
          padding: 40px;
          background-color: white;
        }
        .welcome-message {
          text-align: center;
          margin-bottom: 30px;
        }
        .welcome-message h2 { 
          color: #2d3748; 
          font-size: 24px; 
          margin-bottom: 15px;
          font-weight: 400;
        }
        .welcome-text {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #68c3b7, #4fb3a6);
          color: white !important; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0;
          font-weight: 500;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(104, 195, 183, 0.3);
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(104, 195, 183, 0.4);
        }
        .features {
          display: table;
          width: 100%;
          margin: 30px 0;
        }
        .feature {
          display: table-cell;
          width: 33.33%;
          text-align: center;
          padding: 20px 10px;
        }
        .feature-icon {
          background: #f7fafc;
          border: 2px solid #68c3b7;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #68c3b7;
        }
        .feature h3 {
          font-size: 16px;
          color: #2d3748;
          margin-bottom: 8px;
        }
        .feature p {
          font-size: 14px;
          color: #718096;
          margin: 0;
        }
        .footer { 
          background-color: #f7fafc;
          padding: 30px 40px;
          text-align: center; 
          border-top: 1px solid #e2e8f0;
        }
        .footer-logo {
          margin-bottom: 15px;
        }
        .footer-logo img {
          max-width: 120px;
          height: auto;
          opacity: 0.7;
        }
        .footer p { 
          color: #718096; 
          font-size: 14px; 
          margin: 5px 0;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #68c3b7;
          text-decoration: none;
          font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
          .email-container { margin: 0 10px; }
          .content { padding: 30px 20px; }
          .header { padding: 25px 20px; }
          .features { display: block; }
          .feature { display: block; width: 100%; margin-bottom: 20px; }
          .footer { padding: 25px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <h1>¡Bienvenido a nuestra familia!</h1>
          <p>Tu tienda online de productos personalizados</p>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <h2>Hola ${userName},</h2>
            <div class="welcome-text">
              <p>¡Nos alegra mucho tenerte con nosotros! Tu cuenta ha sido creada exitosamente y ya puedes disfrutar de todos nuestros productos personalizados.</p>
              <p>En Verde Agua Personalizados encontrarás productos únicos, diseñados especialmente para ti con la mejor calidad y atención al detalle.</p>
            </div>
            <a href="${baseUrl}" class="button">Explorar Productos</a>
          </div>

          <div class="features">
            <div class="feature">
              <div class="feature-icon">🎨</div>
              <h3>Diseños Únicos</h3>
              <p>Productos personalizados con diseños exclusivos</p>
            </div>
            <div class="feature">
              <div class="feature-icon">⭐</div>
              <h3>Calidad Premium</h3>
              <p>Materiales de primera calidad en todos nuestros productos</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🚚</div>
              <h3>Envío Rápido</h3>
              <p>Entrega rápida y segura en todo el país</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
            <p style="margin: 0; color: #4a5568;">¿Tienes alguna pregunta? Estamos aquí para ayudarte.</p>
            <p style="margin: 5px 0 0 0; color: #68c3b7; font-weight: 500;">Contáctanos en cualquier momento</p>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <p><strong>Verde Agua Personalizados</strong></p>
          <p>Tu tienda online de productos personalizados</p>
          <div class="social-links">
            <a href="#">Instagram</a> • 
            <a href="#">Facebook</a> • 
            <a href="#">WhatsApp</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px;">Este email fue enviado a ${userEmail}</p>
          <p style="font-size: 12px; margin: 5px 0 0 0;">© 2025 Verde Agua Personalizados. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: '🌿 ¡Bienvenido a Verde Agua Personalizados!',
    html,
  };
}

// Template para email de confirmación de pedido
export function createOrderConfirmationEmail(data: OrderEmailData) {
  const { orderId, customerName, customerEmail, items, total, orderDate } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 15px 10px; font-weight: 500; color: #2d3748;">${item.productName}</td>
      <td style="padding: 15px 10px; text-align: center; color: #4a5568;">${item.quantity}</td>
      <td style="padding: 15px 10px; text-align: right; color: #2d3748; font-weight: 500;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido #${orderId} - Verde Agua Personalizados</title>
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
          /* Logo en colores originales */
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 300;
          color: #2d3748;
          text-shadow: none;
        }
        .order-number {
          background: rgba(104, 195, 183, 0.1);
          color: #68c3b7;
          border: 1px solid #68c3b7;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin-top: 10px;
          display: inline-block;
        }
        .content { 
          padding: 40px;
          background-color: white;
        }
        .greeting {
          text-align: center;
          margin-bottom: 30px;
        }
        .greeting h2 { 
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
        .order-details { 
          background: #f7fafc; 
          padding: 25px; 
          border-radius: 12px; 
          margin: 25px 0;
          border: 1px solid #e2e8f0;
        }
        .order-details h3 {
          color: #2d3748;
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: 500;
        }
        .order-info {
          display: table;
          width: 100%;
          margin-bottom: 20px;
        }
        .order-info-item {
          display: table-cell;
          width: 50%;
          padding: 10px 0;
        }
        .order-info-label {
          font-weight: 500;
          color: #4a5568;
          font-size: 14px;
        }
        .order-info-value {
          color: #2d3748;
          font-size: 16px;
          margin-top: 2px;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .items-table th { 
          background: #68c3b7; 
          color: white;
          padding: 15px 10px; 
          text-align: left; 
          font-weight: 500;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .items-table th:nth-child(2) { text-align: center; }
        .items-table th:nth-child(3) { text-align: right; }
        .total-row { 
          background: linear-gradient(135deg, #68c3b7, #4fb3a6);
          color: white; 
          font-weight: 600;
          font-size: 16px;
        }
        .total-row td {
          padding: 20px 10px;
        }
        .next-steps {
          background: linear-gradient(135deg, #f7fafc, #edf2f7);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          text-align: center;
          border-left: 4px solid #68c3b7;
        }
        .next-steps h3 {
          color: #2d3748;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .next-steps p {
          color: #4a5568;
          margin: 10px 0;
        }
        .tracking-info {
          background: #fff5d4;
          border: 1px solid #f6d55c;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .tracking-info strong {
          color: #8b5a00;
        }
        .footer { 
          background-color: #f7fafc;
          padding: 30px 40px;
          text-align: center; 
          border-top: 1px solid #e2e8f0;
        }
        .footer-logo {
          margin-bottom: 15px;
        }
        .footer-logo img {
          max-width: 120px;
          height: auto;
          opacity: 0.7;
        }
        .footer p { 
          color: #718096; 
          font-size: 14px; 
          margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
          .email-container { margin: 0 10px; }
          .content { padding: 30px 20px; }
          .header { padding: 25px 20px; }
          .order-details { padding: 20px; }
          .order-info { display: block; }
          .order-info-item { display: block; width: 100%; margin-bottom: 15px; }
          .footer { padding: 25px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <h1>¡Pedido Confirmado!</h1>
          <div class="order-number">Pedido #${orderId}</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            <h2>¡Hola ${customerName}!</h2>
            <div class="status-badge">✓ Pedido Recibido</div>
            <p style="color: #4a5568; font-size: 16px; margin-top: 15px;">
              ¡Gracias por tu compra! Hemos recibido tu pedido y está siendo procesado por nuestro equipo.
            </p>
          </div>
          
          <div class="order-details">
            <h3>📋 Detalles del Pedido</h3>
            <div class="order-info">
              <div class="order-info-item">
                <div class="order-info-label">Número de Pedido:</div>
                <div class="order-info-value">#${orderId}</div>
              </div>
              <div class="order-info-item">
                <div class="order-info-label">Fecha del Pedido:</div>
                <div class="order-info-value">${orderDate}</div>
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2"><strong>Total del Pedido:</strong></td>
                  <td style="text-align: right;"><strong>$${total.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="next-steps">
            <h3>🚀 ¿Qué sigue ahora?</h3>
            <p><strong>1.</strong> Procesaremos tu pedido en las próximas 24-48 horas</p>
            <p><strong>2.</strong> Te enviaremos un email cuando tu pedido esté en producción</p>
            <p><strong>3.</strong> Recibirás el código de seguimiento cuando sea enviado</p>
          </div>

          <div class="tracking-info">
            <strong>📧 Te mantendremos informado</strong><br>
            Recibirás actualizaciones por email sobre el estado de tu pedido
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
            <p style="margin: 0; color: #4a5568;">¿Tienes alguna pregunta sobre tu pedido?</p>
            <p style="margin: 5px 0 0 0;">
              <a href="mailto:${process.env.EMAIL_FROM}" style="color: #68c3b7; text-decoration: none; font-weight: 500;">
                Contáctanos aquí
              </a>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <p><strong>Verde Agua Personalizados</strong></p>
          <p>Tu tienda online de productos personalizados</p>
          <p style="margin-top: 20px; font-size: 12px;">Este email fue enviado a ${customerEmail}</p>
          <p style="font-size: 12px; margin: 5px 0 0 0;">© 2025 Verde Agua Personalizados. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `✅ Confirmación de Pedido #${orderId} - Verde Agua Personalizados`,
    html,
  };
}

// Template para email de prueba
export function createTestEmail(data: TestEmailData) {
  const { recipientEmail, testType, customSubject, customMessage } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  if (testType === 'custom') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${customSubject || 'Email de Prueba'}</title>
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
            background: linear-gradient(135deg, #fff8f0, #fef3e2); 
            color: #2d3748; 
            padding: 30px 40px; 
            text-align: center;
            border-bottom: 3px solid #f59e0b;
          }
          .logo { 
            margin-bottom: 20px;
          }
          .logo img {
            max-width: 200px;
            height: auto;
            /* Logo en colores originales */
          }
          .test-badge {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin-top: 10px;
            display: inline-block;
          }
          .content { 
            padding: 40px;
            background-color: white;
          }
          .message-content {
            background: #f7fafc;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
          .message-content h2 {
            color: #2d3748;
            margin-top: 0;
            font-size: 20px;
          }
          .message-content p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.7;
          }
          .timestamp {
            background: #fff7ed;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            border: 1px solid #fed7aa;
          }
          .timestamp strong {
            color: #9a3412;
          }
          .footer { 
            background-color: #f7fafc;
            padding: 30px 40px;
            text-align: center; 
            border-top: 1px solid #e2e8f0;
          }
          .footer-logo {
            margin-bottom: 15px;
          }
          .footer-logo img {
            max-width: 120px;
            height: auto;
            opacity: 0.7;
          }
          .footer p { 
            color: #718096; 
            font-size: 14px; 
            margin: 5px 0;
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 0 10px; }
            .content { padding: 30px 20px; }
            .header { padding: 25px 20px; }
            .footer { padding: 25px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">
              <img src="${logoUrl}" alt="Verde Agua Personalizados" />
            </div>
            <h1>🧪 Email de Prueba</h1>
            <div class="test-badge">Sistema de Notificaciones</div>
          </div>
          
          <div class="content">
            <div class="message-content">
              <h2>${customSubject || 'Mensaje de Prueba'}</h2>
              <p>${customMessage || 'Este es un email de prueba del sistema de notificaciones de Verde Agua Personalizados.'}</p>
            </div>
            
            <div class="timestamp">
              <strong>⏰ Hora de envío:</strong> ${new Date().toLocaleString('es-AR', { 
                timeZone: 'America/Argentina/Buenos_Aires',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
              <p style="margin: 0; color: #4a5568;">✅ Sistema de emails funcionando correctamente</p>
              <p style="margin: 5px 0 0 0; color: #f59e0b; font-weight: 500;">Test completado exitosamente</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-logo">
              <img src="${logoUrl}" alt="Verde Agua Personalizados" />
            </div>
            <p><strong>Verde Agua Personalizados</strong> - Sistema de Pruebas</p>
            <p style="margin-top: 20px; font-size: 12px;">Este email fue enviado a ${recipientEmail}</p>
            <p style="font-size: 12px; margin: 5px 0 0 0;">© 2025 Verde Agua Personalizados. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: customSubject || '🧪 Email de Prueba - Verde Agua Personalizados',
      html,
    };
  }

  // Para pruebas de templates existentes
  if (testType === 'welcome') {
    return createWelcomeEmail({
      userName: 'Usuario de Prueba',
      userEmail: recipientEmail,
    });
  }

  if (testType === 'order_confirmation') {
    return createOrderConfirmationEmail({
      orderId: 'TEST-' + Date.now(),
      customerName: 'Cliente de Prueba',
      customerEmail: recipientEmail,
      items: [
        { productName: 'Taza Personalizada "Mi Diseño"', quantity: 2, price: 899.99 },
        { productName: 'Remera Premium con Logo', quantity: 1, price: 1299.99 },
      ],
      total: 3099.97,
      orderDate: new Date().toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    });
  }

  throw new Error(`Tipo de email de prueba no válido: ${testType}`);
}

// Funciones de conveniencia
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const template = createWelcomeEmail(data);
  return sendEmail({
    to: data.userEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const template = createOrderConfirmationEmail(data);
  return sendEmail({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendTestEmail(data: TestEmailData) {
  const template = createTestEmail(data);
  return sendEmail({
    to: data.recipientEmail,
    subject: template.subject,
    html: template.html,
  });
}
