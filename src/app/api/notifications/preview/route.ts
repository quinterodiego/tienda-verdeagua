import { NextRequest, NextResponse } from 'next/server';
import { createWelcomeEmail, createOrderConfirmationEmail, createTestEmail } from '@/lib/email';
import type { WelcomeEmailData, OrderEmailData } from '@/types/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, customSubject, customMessage, previewData } = body;

    let emailContent: { subject: string; html: string };

    switch (testType) {
      case 'welcome':
        const welcomeData: WelcomeEmailData = previewData || {
          userName: 'Usuario de Prueba',
          userEmail: 'usuario@ejemplo.com',
        };
        emailContent = createWelcomeEmail(welcomeData);
        break;

      case 'order_confirmation':
        const orderData: OrderEmailData = previewData || {
          orderId: 'VA-' + Date.now(),
          customerName: 'Cliente de Prueba',
          customerEmail: 'cliente@ejemplo.com',
          items: [
            { productName: 'Producto de Ejemplo', quantity: 1, price: 999.99 }
          ],
          total: 999.99,
          orderDate: new Date().toLocaleDateString('es-AR'),
        };
        emailContent = createOrderConfirmationEmail(orderData);
        break;

      case 'custom':
        emailContent = createTestEmail({
          recipientEmail: 'preview@ejemplo.com',
          testType: 'custom',
          customSubject: customSubject || 'Email Personalizado',
          customMessage: customMessage || 'Mensaje de prueba personalizado.',
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de email no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      html: emailContent.html,
      subject: emailContent.subject,
      message: 'Vista previa generada correctamente' 
    });

  } catch (error) {
    console.error('Error generando vista previa:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de vista previa de emails - Verde Agua',
    availableTypes: ['welcome', 'order_confirmation', 'custom'],
    methods: ['POST'],
  });
}
