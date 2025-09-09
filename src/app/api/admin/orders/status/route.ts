import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateOrderStatus, getAllOrdersFromSheets } from '@/lib/orders-sheets';
import { sendOrderStatusUpdateEmail } from '@/lib/email';
import type { Order } from '@/types';

// PUT /api/admin/orders/status - Actualizar estado de pedido
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea admin
    // TODO: Implementar verificación de rol de admin
    
    const body = await request.json();
    const { orderId, status } = body;

    console.log(`🔄 Actualizando estado de pedido: ${orderId} → ${status}`);

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'ID de pedido y estado son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    const validStatuses: Order['status'][] = [
      'pending', 
      'payment_pending', 
      'pending_transfer', 
      'confirmed', 
      'processing', 
      'shipped', 
      'delivered', 
      'cancelled'
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado de pedido inválido' },
        { status: 400 }
      );
    }

    // Actualizar el estado del pedido en Google Sheets
    const success = await updateOrderStatus(orderId, status);

    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar el estado del pedido' },
        { status: 500 }
      );
    }

    // Enviar notificación por email al cliente para ciertos cambios de estado
    try {
      if (status === 'confirmed' || status === 'processing' || status === 'shipped' || status === 'delivered' || status === 'cancelled') {
        console.log(`📧 Estado requiere notificación por email: ${status}`);
        
        // Obtener datos del pedido para el email
        console.log(`🔍 Obteniendo pedidos desde Google Sheets...`);
        const orders = await getAllOrdersFromSheets();
        console.log(`📊 Total pedidos encontrados: ${orders.length}`);
        
        const order = orders.find(o => o.id === orderId);
        console.log(`🎯 Pedido encontrado:`, order ? `Sí (${order.customer?.email})` : 'No');
        
        if (order && order.customer?.email) {
          console.log(`📧 Enviando notificación de estado ${status} a: ${order.customer.email}`);
          
          await sendOrderStatusUpdateEmail({
            orderId: order.id,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            customerEmail: order.customer.email,
            newStatus: status,
            items: order.items.map(item => ({
              productName: item.product?.name || 'Producto',
              quantity: item.quantity,
              price: item.product?.price || 0
            })),
            total: order.total,
            orderDate: order.createdAt?.toISOString() || new Date().toISOString(),
            trackingNumber: order.trackingNumber,
            estimatedDelivery: undefined, // Se puede agregar si existe
            cancellationReason: status === 'cancelled' ? 'Cancelado por el administrador' : undefined
          });
          
          console.log(`✅ Notificación de estado enviada exitosamente a: ${order.customer.email}`);
        } else {
          console.log('⚠️ No se encontró el pedido o no tiene email de contacto');
          if (order) {
            console.log('📄 Datos del pedido encontrado:', JSON.stringify({
              id: order.id,
              customer: order.customer,
              hasEmail: !!order.customer?.email
            }, null, 2));
          }
        }
      } else {
        console.log(`ℹ️ Estado ${status} no requiere notificación por email`);
      }
    } catch (emailError) {
      console.error('❌ Error al enviar notificación por email:', emailError);
      // No fallar la actualización por un error de email
    }

    return NextResponse.json({
      success: true,
      message: `Pedido ${orderId} actualizado a estado: ${status}`,
      orderId,
      newStatus: status
    });

  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
