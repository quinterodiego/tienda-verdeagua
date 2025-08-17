import { NextRequest, NextResponse } from 'next/server';

// Simulamos una base de datos temporal en memoria para los comprobantes enviados
// En producción esto debería ser una base de datos real
const paymentNotifications = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod } = body;

    // Validar datos requeridos
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID requerido' },
        { status: 400 }
      );
    }

    // Registrar la notificación de pago enviado
    const notification = {
      orderId,
      paymentMethod: paymentMethod || 'transfer',
      status: 'proof_sent',
      notifiedAt: new Date().toISOString(),
      processed: false
    };

    // Guardar en memoria (en producción usar base de datos)
    paymentNotifications.set(orderId, notification);

    // En un entorno real, aquí notificarías al administrador
    // await notifyAdminPaymentProofSent(notification);

    console.log('Comprobante de pago notificado:', orderId);

    return NextResponse.json({ 
      success: true, 
      orderId,
      message: 'Notificación de comprobante recibida correctamente'
    });

  } catch (error) {
    console.error('Error procesando notificación de pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      // Devolver todas las notificaciones
      const allNotifications = Array.from(paymentNotifications.values());
      return NextResponse.json(allNotifications);
    }

    const notification = paymentNotifications.get(orderId);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);

  } catch (error) {
    console.error('Error obteniendo notificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
