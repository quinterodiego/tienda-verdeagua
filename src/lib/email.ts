import nodemailer from 'nodemailer';
import type { 
  EmailConfig, 
  SendEmailParams, 
  OrderEmailData, 
  WelcomeEmailData,
  TestEmailData,
  OrderStatusUpdateEmailData 
} from '@/types/email';
import { addEmailLog, updateEmailLogStatus, type EmailLog } from './google-sheets';
import { v4 as uuidv4 } from 'uuid';

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
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });
};

// Función principal para enviar emails con logging
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const emailId = uuidv4();
  
  try {
    // Crear log inicial
    const emailLog: EmailLog = {
      id: emailId,
      timestamp: new Date().toISOString(),
      type: 'admin_notification', // Tipo por defecto
      to,
      subject,
      status: 'pending'
    };

    // Registrar log inicial
    try {
      await addEmailLog(emailLog);
      console.log(`Email log creado: ${emailId}`);
    } catch (logError) {
      console.warn('Error al crear email log, continuando con envío:', logError);
    }

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

    // Actualizar log a exitoso
    try {
      await updateEmailLogStatus(emailId, 'sent');
      console.log(`Email enviado y log actualizado: ${emailId} -> ${result.messageId}`);
    } catch (logError) {
      console.warn('Error al actualizar email log (email se envió correctamente):', logError);
    }

    return { success: true, messageId: result.messageId, emailId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Actualizar log a fallido
    try {
      await updateEmailLogStatus(emailId, 'failed', errorMessage);
      console.log(`Email log actualizado a failed: ${emailId}`);
    } catch (logError) {
      console.warn('Error al actualizar email log para fallo:', logError);
    }

    console.error('Error enviando email:', error);
    return { success: false, error: errorMessage, emailId };
  }
}

// Función avanzada para enviar emails con metadata completa
export async function sendEmailWithMetadata({
  to,
  subject,
  html,
  text,
  type,
  orderId,
  userId,
  metadata
}: SendEmailParams & {
  type?: EmailLog['type'];
  orderId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}) {
  const emailId = uuidv4();
  
  try {
    // Crear log inicial con metadata completa
    const emailLog: EmailLog = {
      id: emailId,
      timestamp: new Date().toISOString(),
      type: type || 'admin_notification',
      to,
      subject,
      status: 'pending',
      orderId,
      userId,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    };

    // Registrar log inicial
    try {
      await addEmailLog(emailLog);
      console.log(`Email log con metadata creado: ${emailId}`);
    } catch (logError) {
      console.warn('Error al crear email log, continuando con envío:', logError);
    }

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

    // Actualizar log a exitoso
    try {
      await updateEmailLogStatus(emailId, 'sent');
      console.log(`Email enviado y log actualizado: ${emailId} -> ${result.messageId}`);
    } catch (logError) {
      console.warn('Error al actualizar email log (email se envió correctamente):', logError);
    }

    return { success: true, messageId: result.messageId, emailId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Actualizar log a fallido
    try {
      await updateEmailLogStatus(emailId, 'failed', errorMessage);
      console.log(`Email log actualizado a failed: ${emailId}`);
    } catch (logError) {
      console.warn('Error al actualizar email log para fallo:', logError);
    }

    console.error('Error enviando email:', error);
    return { success: false, error: errorMessage, emailId };
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
  const { orderId, customerName, customerEmail, items, total, orderDate, isPending } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  const statusText = isPending ? 'Pendiente de Pago' : 'Confirmado';
  const statusColor = isPending ? '#f59e0b' : '#10b981';
  const messageText = isPending 
    ? 'Hemos recibido tu pedido y está pendiente de pago. Te enviaremos una confirmación una vez que procesemos el pago.'
    : 'Tu pedido ha sido confirmado y está siendo procesado.';
  
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
          <h1>${isPending ? '📄 Pedido Recibido' : '✅ ¡Pedido Confirmado!'}</h1>
          <div class="order-number">Pedido #${orderId}</div>
          ${isPending ? `<div style="background: ${statusColor}; color: white; padding: 6px 12px; border-radius: 15px; font-size: 12px; font-weight: 500; margin-top: 8px; display: inline-block;">${statusText}</div>` : ''}
        </div>
        
        <div class="content">
          <div class="greeting">
            <h2>¡Hola ${customerName}!</h2>
            <div class="status-badge" style="background: ${isPending ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #48bb78, #38a169)'}">
              ${isPending ? '⏳ Pendiente de Pago' : '✓ Pedido Recibido'}
            </div>
            <p style="color: #4a5568; font-size: 16px; margin-top: 15px;">
              ${messageText}
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
    subject: isPending ? `⏳ Pedido Recibido #${orderId} - Verde Agua Personalizados` : `✅ Confirmación de Pedido #${orderId} - Verde Agua Personalizados`,
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
  return sendEmailWithMetadata({
    to: data.userEmail,
    subject: template.subject,
    html: template.html,
    type: 'welcome',
    userId: data.userEmail, // Usar email como ID de usuario temporalmente
    metadata: {
      userName: data.userName,
      registrationDate: new Date().toISOString()
    }
  });
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const template = createOrderConfirmationEmail(data);
  return sendEmailWithMetadata({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
    type: 'order_status',
    orderId: data.orderId,
    userId: data.customerEmail,
    metadata: {
      customerName: data.customerName,
      total: data.total,
      itemCount: data.items.length,
      orderDate: data.orderDate
    }
  });
}

export async function sendTestEmail(data: TestEmailData) {
  const template = createTestEmail(data);
  return sendEmailWithMetadata({
    to: data.recipientEmail,
    subject: template.subject,
    html: template.html,
    type: 'admin_notification',
    metadata: {
      testType: data.testType,
      testDate: new Date().toISOString()
    }
  });
}

// Template para notificaciones de cambio de estado
export function createOrderStatusUpdateEmail(data: OrderStatusUpdateEmailData) {
  const { orderId, customerName, customerEmail, newStatus, items, total, orderDate, trackingNumber, estimatedDelivery, cancellationReason } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  // Configuración específica para cada estado
  const statusConfig = {
    pending: {
      title: '⏳ Tu pedido está pendiente',
      message: 'Estamos verificando tu pago y la disponibilidad de productos.',
      description: 'Tu pedido está siendo procesado. Te notificaremos cuando esté confirmado.',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      actionText: 'No necesitas hacer nada por ahora. Te contactaremos si necesitamos información adicional.',
    },
    payment_pending: {
      title: '💳 Esperando confirmación de pago',
      message: 'Hemos recibido tu pedido y estamos esperando la confirmación de tu pago.',
      description: 'Una vez que recibamos y verifiquemos tu pago, confirmaremos tu pedido.',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      actionText: 'Por favor, envíanos el comprobante de pago para procesar tu pedido.',
    },
    pending_transfer: {
      title: '🏦 Esperando comprobante de transferencia',
      message: 'Tu pedido está pendiente de confirmación de transferencia.',
      description: 'Por favor, envíanos el comprobante de tu transferencia bancaria.',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      actionText: 'Envía tu comprobante de transferencia para que podamos procesar tu pedido.',
    },
    confirmed: {
      title: '✅ ¡Tu pedido ha sido confirmado!',
      message: 'Tu pago ha sido verificado y tu pedido está confirmado.',
      description: 'Estamos preparando tu pedido para comenzar el proceso de producción.',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      actionText: 'Pronto comenzaremos a procesar tu pedido. Te notificaremos cuando esté listo.',
    },
    processing: {
      title: '📦 Tu pedido está siendo procesado',
      message: '¡Buenas noticias! Estamos preparando tu pedido.',
      description: 'Nuestro equipo está empaquetando cuidadosamente tus productos.',
      color: '#14b8a6',
      bgColor: '#ccfbf1',
      actionText: 'Tu pedido estará listo para envío muy pronto. Te notificaremos cuando sea despachado.',
    },
    shipped: {
      title: '🚚 ¡Tu pedido está en camino!',
      message: 'Tu pedido ha sido enviado y está en camino hacia ti.',
      description: trackingNumber ? `Código de seguimiento: ${trackingNumber}` : 'Pronto recibirás el código de seguimiento.',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      actionText: trackingNumber ? 'Puedes rastrear tu envío con el código proporcionado.' : 'Te enviaremos el código de seguimiento pronto.',
    },
    delivered: {
      title: '🎉 ¡Tu pedido ha sido entregado!',
      message: '¡Esperamos que disfrutes tus productos!',
      description: 'Tu pedido ha sido entregado exitosamente. ¡Gracias por tu compra!',
      color: '#10b981',
      bgColor: '#d1fae5',
      actionText: '¿Te gustó tu experiencia? Nos encantaría conocer tu opinión.',
    },
    cancelled: {
      title: '❌ Tu pedido ha sido cancelado',
      message: cancellationReason || 'Tu pedido ha sido cancelado.',
      description: 'Si este cancelamiento fue inesperado, no dudes en contactarnos.',
      color: '#ef4444',
      bgColor: '#fee2e2',
      actionText: 'Si tienes preguntas sobre esta cancelación, contáctanos y te ayudaremos.',
    }
  };

  const config = statusConfig[newStatus];
  
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px; font-weight: 500; color: #2d3748;">${item.productName}</td>
      <td style="padding: 12px 8px; text-align: center; color: #4a5568;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; color: #2d3748; font-weight: 500;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Pedido #${orderId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { 
          background: linear-gradient(135deg, #ffffff, #f8fffe); 
          color: #2d3748; 
          padding: 30px 40px; 
          text-align: center;
          border-bottom: 3px solid #68c3b7;
        }
        .logo { margin-bottom: 20px; }
        .logo img { max-width: 200px; height: auto; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; color: #2d3748; }
        .status-badge {
          display: inline-block;
          background: ${config.color};
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin-top: 10px;
        }
        .content { padding: 40px; background-color: white; }
        .status-section {
          background: ${config.bgColor};
          border: 1px solid ${config.color};
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
          text-align: center;
        }
        .status-section h2 { 
          color: ${config.color}; 
          font-size: 24px; 
          margin-bottom: 15px;
          font-weight: 600;
        }
        .status-section p { 
          color: #4a5568; 
          font-size: 16px; 
          margin-bottom: 10px;
        }
        .order-details { 
          background-color: #f8f9fa; 
          padding: 25px; 
          border-radius: 12px; 
          margin: 25px 0;
        }
        .order-details h3 { 
          color: #2d3748; 
          font-size: 20px; 
          margin-bottom: 20px;
          font-weight: 600;
        }
        .order-info { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 20px; 
          margin-bottom: 20px;
        }
        .order-info-item { 
          flex: 1; 
          min-width: 200px;
        }
        .order-info-label { 
          font-weight: 600; 
          color: #4a5568; 
          font-size: 14px; 
          margin-bottom: 5px;
        }
        .order-info-value { 
          color: #2d3748; 
          font-size: 16px; 
          font-weight: 500;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .items-table th { 
          background: #68c3b7; 
          color: white; 
          font-weight: 600; 
          padding: 15px 10px; 
          text-align: left;
        }
        .items-table th:last-child { text-align: right; }
        .total-row { background-color: #f1f5f9; font-weight: bold; }
        .total-row td { padding: 15px 10px !important; }
        .action-section {
          background: #f8fffe;
          border: 1px solid #68c3b7;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }
        .action-section h4 { 
          color: #68c3b7; 
          font-size: 18px; 
          margin-bottom: 10px;
          font-weight: 600;
        }
        .track-button {
          display: inline-block;
          background: #68c3b7;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin-top: 15px;
        }
        .footer { 
          background-color: #f7fafc; 
          color: #4a5568; 
          text-align: center; 
          padding: 30px 40px;
          border-top: 1px solid #e2e8f0;
        }
        .footer-logo { margin-bottom: 15px; }
        .footer-logo img { max-width: 150px; height: auto; opacity: 0.7; }
        .footer p { margin: 8px 0; font-size: 14px; color: #718096; }
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
          <h1>Actualización de Pedido</h1>
          <div class="status-badge">Pedido #${orderId}</div>
        </div>
        
        <div class="content">
          <div class="status-section">
            <h2>${config.title}</h2>
            <p><strong>${config.message}</strong></p>
            <p>${config.description}</p>
          </div>

          <div class="order-details">
            <h3>📋 Resumen del Pedido</h3>
            <div class="order-info">
              <div class="order-info-item">
                <div class="order-info-label">Número de Pedido:</div>
                <div class="order-info-value">#${orderId}</div>
              </div>
              <div class="order-info-item">
                <div class="order-info-label">Cliente:</div>
                <div class="order-info-value">${customerName}</div>
              </div>
              <div class="order-info-item">
                <div class="order-info-label">Fecha del Pedido:</div>
                <div class="order-info-value">${orderDate}</div>
              </div>
              <div class="order-info-item">
                <div class="order-info-label">Estado Actual:</div>
                <div class="order-info-value" style="color: ${config.color}; font-weight: 600;">
                  ${getStatusDisplayName(newStatus)}
                </div>
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Precio</th>
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

          ${trackingNumber ? `
          <div class="action-section">
            <h4>📦 Información de Seguimiento</h4>
            <p><strong>Código de seguimiento:</strong> ${trackingNumber}</p>
            ${estimatedDelivery ? `<p><strong>Entrega estimada:</strong> ${estimatedDelivery}</p>` : ''}
            <a href="/mis-pedidos" class="track-button">Ver Detalles del Pedido</a>
          </div>
          ` : ''}

          <div class="action-section">
            <h4>💬 ¿Qué sigue ahora?</h4>
            <p>${config.actionText}</p>
            <a href="/mis-pedidos" class="track-button">Ver Mis Pedidos</a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
            <p style="margin: 0; color: #4a5568;">¿Tienes alguna pregunta sobre tu pedido?</p>
            <p style="margin: 5px 0 0 0;">
              <a href="/contacto" style="color: #68c3b7; text-decoration: none; font-weight: 500;">
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
    subject: `${getStatusDisplayName(newStatus)} - Pedido #${orderId} - Verde Agua Personalizados`,
    html,
  };
}

// Función helper para obtener el nombre del estado en español
function getStatusDisplayName(status: string): string {
  const statusNames: Record<string, string> = {
    pending: 'Pendiente',
    payment_pending: 'Pendiente de Pago',
    pending_transfer: 'Pendiente Transferencia',
    confirmed: 'Confirmado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };
  return statusNames[status] || status;
}

// Template para notificación de pedido al admin/vendedor
export function createOrderNotificationAdminEmail(data: OrderEmailData) {
  const { orderId, customerName, customerEmail, items, total, orderDate, isPending } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  const statusText = isPending ? 'Pendiente de Pago' : 'Confirmado';
  const statusColor = isPending ? '#f59e0b' : '#10b981';
  const headerTitle = isPending ? 'Nuevo Pedido Pendiente' : 'Nuevo Pedido Recibido';

  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px; font-weight: 500; color: #2d3748;">${item.productName}</td>
      <td style="padding: 12px 8px; text-align: center; color: #4a5568;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; color: #2d3748; font-weight: 500;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Pedido #${orderId} - Verde Agua Personalizados</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fffe; color: #333; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ffffff, #f8fffe); color: #2d3748; padding: 30px 40px; text-align: center; border-bottom: 3px solid #68c3b7; }
        .logo { margin-bottom: 20px; }
        .logo img { max-width: 200px; height: auto; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 400; color: #2d3748; }
        .order-number { background: rgba(104,195,183,0.1); color: #68c3b7; border: 1px solid #68c3b7; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; margin-top: 10px; display: inline-block; }
        .content { padding: 40px; background-color: white; }
        .order-details { background: #f7fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0; }
        .order-details h3 { color: #2d3748; margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 500; }
        .order-info { margin-bottom: 20px; }
        .order-info-label { font-weight: 500; color: #4a5568; font-size: 14px; }
        .order-info-value { color: #2d3748; font-size: 16px; margin-top: 2px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
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
          .email-container { 
            margin: 0 10px; 
            box-shadow: none;
          } 
          .content { 
            padding: 30px 20px; 
          } 
          .header { 
            padding: 25px 20px; 
          } 
          .order-details { 
            padding: 20px; 
            margin: 15px 0;
            border-radius: 8px;
          } 
          .order-details h3 {
            font-size: 16px;
            text-align: center;
            word-break: break-word;
          }
          .footer { 
            padding: 25px 20px; 
          }
          .items-table th,
          .items-table td {
            padding: 10px 8px;
            font-size: 12px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <h1>${headerTitle}</h1>
          <div class="order-number">Pedido #${orderId}</div>
          ${isPending ? `<div style="background: ${statusColor}; color: white; padding: 6px 12px; border-radius: 15px; font-size: 12px; font-weight: 500; margin-top: 8px; display: inline-block;">${statusText}</div>` : ''}
        </div>
        <div class="content">
          <div class="order-details">
            <h3>📋 Detalles del Pedido</h3>
            <div class="order-info">
              <div class="order-info-label">Cliente:</div>
              <div class="order-info-value">${customerName} (${customerEmail})</div>
              <div class="order-info-label">Fecha del Pedido:</div>
              <div class="order-info-value">${orderDate}</div>
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
        </div>
        <div class="footer">
          <div class="footer-logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <p><strong>Verde Agua Personalizados</strong></p>
          <p>Notificación automática de nuevo pedido</p>
          <p style="margin-top: 20px; font-size: 12px;">Este email fue enviado al administrador</p>
          <p style="font-size: 12px; margin: 5px 0 0 0;">© 2025 Verde Agua Personalizados. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: isPending ? `⏳ Pedido Pendiente #${orderId} - Verde Agua Personalizados` : `🛒 Nuevo Pedido #${orderId} - Verde Agua Personalizados`,
    html,
  };
}

// Función para enviar notificación de pedido al admin/vendedor
export async function sendOrderNotificationToAdmin(data: OrderEmailData) {
  const template = createOrderNotificationAdminEmail(data);
  const adminEmail = process.env.EMAIL_ADMIN || process.env.EMAIL_FROM || '';
  
  if (!adminEmail) {
    throw new Error('No se ha configurado EMAIL_ADMIN ni EMAIL_FROM');
  }
  
  return sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
  });
}

// Template para email de recuperación de contraseña
export function createPasswordResetEmail(data: { resetUrl: string, userName: string }) {
  const { resetUrl, userName } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/logo.png`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperar Contraseña - Verde Agua Personalizados</title>
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
        .message-section {
          text-align: center;
          margin-bottom: 30px;
        }
        .message-section h2 { 
          color: #2d3748; 
          font-size: 24px; 
          margin-bottom: 15px;
          font-weight: 400;
        }
        .message-text {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .reset-button { 
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
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(104, 195, 183, 0.4);
        }
        .security-note {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .security-note h3 {
          color: #92400e;
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .security-note p {
          color: #92400e;
          margin: 8px 0;
          font-size: 14px;
        }
        .expiry-notice {
          background: #fee2e2;
          border: 1px solid #ef4444;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        .expiry-notice strong {
          color: #dc2626;
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
          <h1>🔐 Recuperar Contraseña</h1>
        </div>
        
        <div class="content">
          <div class="message-section">
            <h2>Hola ${userName},</h2>
            <div class="message-text">
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Verde Agua Personalizados.</p>
              <p>Si fuiste tú quien realizó esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña:</p>
            </div>
            <a href="${resetUrl}" class="reset-button">Restablecer Contraseña</a>
          </div>

          <div class="expiry-notice">
            <strong>⏰ Este enlace expira en 1 hora</strong><br>
            Por seguridad, debes usar este enlace antes de que expire
          </div>

          <div class="security-note">
            <h3>🛡️ Importante - Información de Seguridad</h3>
            <p><strong>• Si no solicitaste este cambio,</strong> ignora este email y tu contraseña permanecerá sin cambios.</p>
            <p><strong>• Este enlace solo puede usarse una vez</strong> y expira automáticamente en 1 hora.</p>
            <p><strong>• Nunca compartas este enlace</strong> con nadie por razones de seguridad.</p>
            <p><strong>• Si tienes problemas,</strong> contáctanos directamente desde nuestro sitio web.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
            <p style="margin: 0; color: #4a5568;">¿No puedes hacer clic en el botón?</p>
            <p style="margin: 5px 0; font-size: 14px; color: #68c3b7; word-break: break-all;">
              Copia y pega este enlace en tu navegador:<br>
              <span style="background: #e2e8f0; padding: 5px; border-radius: 4px;">${resetUrl}</span>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">
            <img src="${logoUrl}" alt="Verde Agua Personalizados" />
          </div>
          <p><strong>Verde Agua Personalizados</strong></p>
          <p>Tu tienda online de productos personalizados</p>
          <p style="margin-top: 20px; font-size: 12px;">Este email fue enviado por una solicitud de recuperación de contraseña</p>
          <p style="font-size: 12px; margin: 5px 0 0 0;">© 2025 Verde Agua Personalizados. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: '🔐 Recuperar tu contraseña - Verde Agua Personalizados',
    html,
  };
}

// Función para enviar email de recuperación de contraseña
export async function sendPasswordResetEmail(data: { to: string, resetUrl: string, userName: string }) {
  const template = createPasswordResetEmail({
    resetUrl: data.resetUrl,
    userName: data.userName
  });
  
  return sendEmailWithMetadata({
    to: data.to,
    subject: template.subject,
    html: template.html,
    type: 'password_reset',
    userId: data.to,
    metadata: {
      userName: data.userName,
      resetRequestDate: new Date().toISOString()
    }
  });
}

// Función para enviar email de actualización de estado de pedido
export async function sendOrderStatusUpdateEmail(data: OrderStatusUpdateEmailData) {
  const template = createOrderStatusUpdateEmail(data);
  
  return sendEmailWithMetadata({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
    type: 'order_status',
    orderId: data.orderId,
    userId: data.customerEmail,
    metadata: {
      customerName: data.customerName,
      newStatus: data.newStatus,
      total: data.total,
      orderDate: data.orderDate,
      trackingNumber: data.trackingNumber,
      estimatedDelivery: data.estimatedDelivery,
      cancellationReason: data.cancellationReason
    }
  });
}
