import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, customerName, orderId, trackingNumber } = await request.json();
    
    if (!to || !customerName || !orderId || !trackingNumber) {
      return NextResponse.json({ 
        error: 'Faltan datos requeridos para el email' 
      }, { status: 400 });
    }
    
    const subject = `📦 Tu pedido ${orderId} está en camino - Número de seguimiento`;
    const html = generateTrackingEmailTemplate(customerName, orderId, trackingNumber);
    
    await sendEmail({ to, subject, html });
    
    console.log('📧 Email de tracking enviado a:', to);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email de tracking enviado exitosamente'
    });
    
  } catch (error) {
    console.error('Error enviando email de tracking:', error);
    return NextResponse.json({ 
      error: 'Error enviando email de tracking' 
    }, { status: 500 });
  }
}

function generateTrackingEmailTemplate(
  customerName: string, 
  orderId: string, 
  trackingNumber: string
) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu pedido está en camino</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .title {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 25px;
        }
        .tracking-box {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          margin: 25px 0;
        }
        .tracking-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .tracking-number {
          font-size: 24px;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
          word-break: break-all;
        }
        .order-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .order-info h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 18px;
        }
        .order-detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .order-detail .label {
          color: #6b7280;
        }
        .order-detail .value {
          color: #1f2937;
          font-weight: 500;
        }
        .instructions {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 25px 0;
          border-radius: 0 8px 8px 0;
        }
        .instructions h4 {
          margin: 0 0 10px 0;
          color: #92400e;
          font-size: 16px;
        }
        .instructions p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          border-top: 1px solid #e9ecef;
          padding-top: 20px;
          margin-top: 30px;
          color: #6b7280;
          font-size: 14px;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          color: #3b82f6;
          text-decoration: none;
          margin: 0 10px;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .container {
            padding: 20px;
          }
          .tracking-number {
            font-size: 18px;
            letter-spacing: 1px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Tu Tienda Online</div>
          <div class="icon">📦</div>
        </div>
        
        <h1 class="title">¡Tu pedido está en camino!</h1>
        <p class="subtitle">
          Hola <strong>${customerName}</strong>, 
          tenemos excelentes noticias: tu pedido ha sido enviado y está en camino hacia ti.
        </p>
        
        <div class="tracking-box">
          <div class="tracking-label">Número de Seguimiento</div>
          <div class="tracking-number">${trackingNumber}</div>
        </div>
        
        <div class="order-info">
          <h3>📋 Información del Pedido</h3>
          <div class="order-detail">
            <span class="label">Número de Pedido:</span>
            <span class="value">${orderId}</span>
          </div>
          <div class="order-detail">
            <span class="label">Estado:</span>
            <span class="value">En tránsito 🚚</span>
          </div>
          <div class="order-detail">
            <span class="label">Fecha de envío:</span>
            <span class="value">${new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </div>
        
        <div class="instructions">
          <h4>📍 ¿Cómo rastrear tu pedido?</h4>
          <p>
            <strong>1.</strong> Copia el número de seguimiento de arriba<br>
            <strong>2.</strong> Visita el sitio web de la empresa de envíos<br>
            <strong>3.</strong> Ingresa el número en el buscador de rastreo<br>
            <strong>4.</strong> ¡Sigue tu paquete en tiempo real!
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 15px; color: #6b7280;">
            ¿Tienes alguna pregunta sobre tu pedido?
          </p>
          <a href="mailto:soporte@tutienda.com" 
             style="background: #3b82f6; color: white; padding: 12px 25px; 
                    text-decoration: none; border-radius: 6px; font-weight: 500;">
            Contactar Soporte
          </a>
        </div>
        
        <div class="footer">
          <p>
            <strong>¡Gracias por tu compra!</strong><br>
            Tu satisfacción es nuestra prioridad.
          </p>
          <div class="social-links">
            <a href="#">Facebook</a> |
            <a href="#">Instagram</a> |
            <a href="#">WhatsApp</a>
          </div>
          <p style="font-size: 12px; color: #9ca3af;">
            Este es un email automático, por favor no responder directamente a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
