import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mercadopago';

// Función para actualizar el estado del pedido
async function updateOrderStatus(orderId: string, paymentStatus: string, paymentId: number) {
  try {
    // Importar la función de actualización de Google Sheets
    const { updateOrderStatus: updateOrderInSheets } = await import('@/lib/orders-sheets');
    
    console.log(`Actualizando pedido ${orderId}:`, {
      paymentStatus,
      paymentId,
      updatedAt: new Date().toISOString()
    });

    // Mapear estados de MercadoPago a estados de pedido
    let orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending';
    
    switch (paymentStatus) {
      case 'approved':
        orderStatus = 'confirmed';
        break;
      case 'pending':
      case 'in_process':
        orderStatus = 'pending';
        break;
      case 'rejected':
      case 'cancelled':
        orderStatus = 'cancelled';
        break;
    }

    // Actualizar en Google Sheets
    const success = await updateOrderInSheets(orderId, orderStatus, paymentId.toString());
    
    if (!success) {
      console.error(`❌ Error al actualizar el pedido ${orderId} en Google Sheets`);
      return false;
    }

    console.log(`✅ Pedido ${orderId} actualizado exitosamente a estado: ${orderStatus}`);
    
    // TODO: Enviar notificación por email al cliente
    // await sendOrderStatusEmail(orderId, orderStatus, paymentStatus);
    
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar estado del pedido:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== WEBHOOK MERCADOPAGO RECIBIDO ===');
    console.log('Tipo:', body.type);
    console.log('Acción:', body.action);
    console.log('Datos:', body.data);

    // Verificar que es una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      if (!paymentId) {
        console.error('Payment ID no encontrado en el webhook');
        return NextResponse.json({ error: 'Payment ID no encontrado' }, { status: 400 });
      }

      console.log(`Procesando pago ID: ${paymentId}`);

      // Obtener información completa del pago
      const paymentService = getPaymentService();
      const payment = await paymentService.get({ id: paymentId });
      
      console.log('=== INFORMACIÓN DEL PAGO ===');
      console.log('ID:', payment.id);
      console.log('Estado:', payment.status);
      console.log('Referencia externa (Order ID):', payment.external_reference);
      console.log('Monto:', payment.transaction_amount);
      console.log('Email del pagador:', payment.payer?.email);
      console.log('Método de pago:', payment.payment_method_id);
      console.log('Fecha de creación:', payment.date_created);
      console.log('Fecha de aprobación:', payment.date_approved);

      // Actualizar el estado del pedido
      if (payment.external_reference && payment.status && payment.id) {
        const updateSuccess = await updateOrderStatus(
          payment.external_reference,
          payment.status,
          payment.id
        );

        if (updateSuccess) {
          console.log('✅ Estado del pedido actualizado correctamente');
        } else {
          console.error('❌ Error al actualizar el estado del pedido');
        }
      } else {
        console.error('❌ Faltan datos necesarios en el pago (external_reference, status o id)');
      }

      // Procesar según el estado del pago
      switch (payment.status) {
        case 'approved':
          console.log(`✅ Pago ${paymentId} APROBADO para el pedido ${payment.external_reference}`);
          // El pedido se marcó como 'confirmed' en updateOrderStatus
          break;
          
        case 'pending':
          console.log(`⏳ Pago ${paymentId} PENDIENTE para el pedido ${payment.external_reference}`);
          break;
          
        case 'in_process':
          console.log(`🔄 Pago ${paymentId} EN PROCESO para el pedido ${payment.external_reference}`);
          break;
          
        case 'rejected':
          console.log(`❌ Pago ${paymentId} RECHAZADO para el pedido ${payment.external_reference}`);
          break;
          
        case 'cancelled':
          console.log(`🚫 Pago ${paymentId} CANCELADO para el pedido ${payment.external_reference}`);
          break;
          
        default:
          console.log(`❓ Estado de pago desconocido: ${payment.status}`);
      }

      return NextResponse.json({ received: true });
    }

    // Otros tipos de notificaciones (merchant_order, etc.)
    console.log('Tipo de notificación no manejado:', body.type);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error procesando webhook:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

// Permitir métodos GET para verificación de MercadoPago
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'OK' });
}
