import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOrderNotificationToAdmin } from '@/lib/email';

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

    console.log(`📧 Enviando notificación de pedido admin de prueba a ${testEmail}...`);

    // Temporalmente cambiar EMAIL_ADMIN para enviar al email de prueba
    const originalEmailAdmin = process.env.EMAIL_ADMIN;
    process.env.EMAIL_ADMIN = testEmail;

    try {
      const result = await sendOrderNotificationToAdmin({
        orderId: `TEST-ADMIN-${Date.now()}`,
        customerName: 'Cliente de Prueba',
        customerEmail: 'cliente@ejemplo.com',
        items: [
          { productName: 'Agenda Personalizada A5', quantity: 1, price: 1599.99 },
          { productName: 'Taza Mágica Personalizada', quantity: 2, price: 1199.99 },
          { productName: 'Stickers Pack x10', quantity: 1, price: 499.99 }
        ],
        total: 4499.96,
        orderDate: new Date().toLocaleDateString('es-AR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      });

      // Restaurar EMAIL_ADMIN original
      if (originalEmailAdmin) {
        process.env.EMAIL_ADMIN = originalEmailAdmin;
      }

      if (result.success) {
        console.log('✅ Notificación admin enviada exitosamente');
        return NextResponse.json({
          success: true,
          message: `Notificación de pedido admin enviada exitosamente a ${testEmail}`,
          messageId: result.messageId,
          details: 'Email enviado usando el template de notificación para administradores'
        });
      } else {
        console.error('❌ Error enviando notificación admin:', result.error);
        return NextResponse.json({
          error: 'Error enviando notificación admin',
          details: result.error
        }, { status: 500 });
      }
    } finally {
      // Asegurar que restauramos el EMAIL_ADMIN original
      if (originalEmailAdmin) {
        process.env.EMAIL_ADMIN = originalEmailAdmin;
      }
    }

  } catch (error) {
    console.error('❌ Error en test de notificación admin:', error);
    return NextResponse.json({ 
      error: 'Error en test de notificación admin',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
