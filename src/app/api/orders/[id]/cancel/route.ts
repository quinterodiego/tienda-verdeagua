import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getUserOrdersFromSheets } from '@/lib/orders-sheets';
import { sendOrderNotificationToAdmin } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orderId } = params;
    const body = await request.json();
    const { reason, userEmail } = body;

    console.log('🚫 Intentando cancelar pedido:', {
      orderId,
      reason,
      userEmail
    });

    // Obtener todos los pedidos del usuario para encontrar el específico
    const userOrders = await getUserOrdersFromSheets(userEmail);
    const order = userOrders.find(o => o.id === orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Pedido no encontrado o no tienes permiso para cancelarlo' },
        { status: 404 }
      );
    }

    // Verificar que el pedido puede ser cancelado (solo pedidos pendientes o con pago fallido)
    const cancellableStatuses = [
      'pending', 
      'payment_pending', 
      'payment_failed', 
      'pending_transfer',
      'cancelled',
      'rejected',
      'failed'
    ];

    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Este pedido no puede ser cancelado. Ya está siendo procesado o fue completado.' 
        },
        { status: 400 }
      );
    }

    // Actualizar el estado del pedido a 'cancelled'
    await updateOrderStatus(orderId, 'cancelled');

    // Enviar notificación al administrador sobre la cancelación
    try {
      await sendOrderNotificationToAdmin({
        orderId: order.id,
        customerName: order.customer?.name || 'Cliente',
        customerEmail: order.customer?.email || '',
        items: order.items.map((item) => ({
          productName: item.product?.name || 'Producto',
          quantity: item.quantity,
          price: item.product?.price || 0
        })),
        total: order.total,
        orderDate: new Date().toLocaleDateString('es-AR')
      });
    } catch (emailError) {
      console.error('❌ Error enviando notificación de cancelación:', emailError);
      // No fallar la cancelación por error de email
    }

    console.log('✅ Pedido cancelado exitosamente:', orderId);

    return NextResponse.json({
      success: true,
      message: 'Pedido cancelado exitosamente',
      orderId,
      newStatus: 'cancelled'
    });

  } catch (error) {
    console.error('❌ Error cancelando pedido:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor al cancelar el pedido' 
      },
      { status: 500 }
    );
  }
}
