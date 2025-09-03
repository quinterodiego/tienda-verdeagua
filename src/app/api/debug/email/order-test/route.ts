import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';

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

    console.log(`📧 Enviando email de confirmación de pedido de prueba a ${testEmail}...`);

    const result = await sendOrderConfirmationEmail({
      orderId: `TEST-${Date.now()}`,
      customerName: 'Cliente de Prueba',
      customerEmail: testEmail,
      items: [
        { productName: 'Taza Personalizada "Mi Diseño"', quantity: 2, price: 899.99 },
        { productName: 'Remera Premium con Logo', quantity: 1, price: 1299.99 },
        { productName: 'Llavero Personalizado', quantity: 3, price: 299.99 }
      ],
      total: 3799.96,
      orderDate: new Date().toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    });

    if (result.success) {
      console.log('✅ Email de confirmación de pedido enviado exitosamente');
      return NextResponse.json({
        success: true,
        message: `Email de confirmación de pedido enviado exitosamente a ${testEmail}`,
        messageId: result.messageId
      });
    } else {
      console.error('❌ Error enviando email de confirmación:', result.error);
      return NextResponse.json({
        error: 'Error enviando email de confirmación de pedido',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en test de email de pedido:', error);
    return NextResponse.json({ 
      error: 'Error en test de email de confirmación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
