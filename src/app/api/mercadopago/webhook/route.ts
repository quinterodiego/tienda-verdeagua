import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mercadopago';

// Función para actualizar el estado del pedido
async function updateOrderStatus(orderId: string, paymentStatus: string, paymentId: number, paymentMethod?: string) {
  try {
    // Importar la función de actualización de Google Sheets
    const { updateOrderStatus: updateOrderInSheets } = await import('@/lib/orders-sheets');
    
    console.log(`Actualizando pedido ${orderId}:`, {
      paymentStatus,
      paymentId,
      paymentMethod,
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

    // Mapear método de pago a nombre legible
    let paymentType = 'Mercado Pago';
    if (paymentMethod) {
      switch (paymentMethod) {
        case 'visa':
        case 'master':
        case 'amex':
        case 'diners':
        case 'naranja':
        case 'cabal':
        case 'cencosud':
        case 'cordobesa':
        case 'argencard':
          paymentType = 'Tarjeta de Crédito';
          break;
        case 'debvisa':
        case 'debmaster':
          paymentType = 'Tarjeta de Débito';
          break;
        case 'rapipago':
        case 'pagofacil':
          paymentType = 'Efectivo';
          break;
        case 'account_money':
          paymentType = 'Dinero en Cuenta MP';
          break;
        case 'debin':
          paymentType = 'Transferencia Bancaria';
          break;
        default:
          paymentType = `Mercado Pago (${paymentMethod})`;
      }
    }

    // ✅ ENVIAR EMAIL DE CONFIRMACIÓN SOLO SI EL PAGO FUE APROBADO
    if (paymentStatus === 'approved') {
      try {
        console.log(`📧 Pago aprobado - Enviando email de confirmación de pedido para ${orderId}`);
        await sendOrderConfirmationEmailFromWebhook(orderId);
        console.log(`✅ Email de confirmación enviado exitosamente`);
      } catch (emailError) {
        console.error('❌ Error enviando email de confirmación:', emailError);
        // No fallar la actualización si el email falla
      }
    } else {
      console.log(`⏸️ Pago no aprobado (${paymentStatus}) - NO se envía email de confirmación`);
    }

    // Actualizar en Google Sheets (sin enviar email automático desde updateOrderInSheets)
    const success = await updateOrderInSheets(orderId, orderStatus, paymentId.toString(), paymentType, false);
    
    if (!success) {
      console.error(`❌ Error al actualizar el pedido ${orderId} en Google Sheets`);
      return false;
    }

    console.log(`✅ Pedido ${orderId} actualizado exitosamente a estado: ${orderStatus}, tipo de pago: ${paymentType}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar estado del pedido:', error);
    return false;
  }
}

// Función para enviar email de confirmación específico desde webhook
async function sendOrderConfirmationEmailFromWebhook(orderId: string) {
  try {
    // Obtener datos del pedido desde Google Sheets
    const { getAllOrdersFromSheetsForAdmin } = await import('@/lib/orders-sheets');
    const allOrders = await getAllOrdersFromSheetsForAdmin();
    
    // Buscar el pedido específico
    const orderRow = allOrders.find(row => row[0] === orderId); // Columna A es el ID
    
    if (!orderRow) {
      throw new Error(`Pedido ${orderId} no encontrado`);
    }

    // Parsear datos del pedido
    const customerEmail = orderRow[1]; // Columna B
    const customerName = orderRow[2]; // Columna C  
    const total = parseFloat(orderRow[3]) || 0; // Columna D
    const itemsJson = orderRow[5] || '[]'; // Columna F
    const orderDate = new Date(orderRow[9] || Date.now()).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });

    let items = [];
    try {
      items = JSON.parse(itemsJson);
    } catch (error) {
      console.error('Error al parsear items del pedido:', error);
      items = [];
    }

    // Enviar email de confirmación
    const { sendOrderConfirmationEmail } = await import('@/lib/email');
    
    await sendOrderConfirmationEmail({
      orderId,
      customerName,
      customerEmail,
      items: items.map((item: { productName?: string; name?: string; quantity?: number; price?: number }) => ({
        productName: item.productName || item.name || 'Producto',
        quantity: item.quantity || 1,
        price: item.price || 0
      })),
      total,
      orderDate
    });

    console.log(`✅ Email de confirmación enviado para pedido ${orderId}`);
  } catch (error) {
    console.error(`❌ Error enviando email de confirmación para pedido ${orderId}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== WEBHOOK MERCADOPAGO RECIBIDO ===');
    console.log('Tiempo:', new Date().toISOString());
    console.log('URL:', request.url);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    console.log('Tipo:', body.type);
    console.log('Acción:', body.action);
    console.log('Datos completos:', JSON.stringify(body, null, 2));

    // Verificar que es una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      if (!paymentId) {
        console.error('❌ Payment ID no encontrado en el webhook');
        return NextResponse.json({ error: 'Payment ID no encontrado' }, { status: 400 });
      }

      console.log(`🔄 Procesando pago ID: ${paymentId}`);

      // Obtener información completa del pago
      const paymentService = getPaymentService();
      const payment = await paymentService.get({ id: paymentId });
      
      console.log('=== INFORMACIÓN COMPLETA DEL PAGO ===');
      console.log('ID:', payment.id);
      console.log('Estado:', payment.status);
      console.log('Referencia externa (Order ID):', payment.external_reference);
      console.log('Monto:', payment.transaction_amount);
      console.log('Email del pagador:', payment.payer?.email);
      console.log('Método de pago:', payment.payment_method_id);
      console.log('Fecha de creación:', payment.date_created);
      console.log('Fecha de aprobación:', payment.date_approved);
      console.log('Estado detalle:', payment.status_detail);

      // Actualizar el estado del pedido
      if (payment.external_reference && payment.status && payment.id) {
        console.log(`📝 Actualizando pedido ${payment.external_reference} con estado de pago: ${payment.status}`);
        
        const updateSuccess = await updateOrderStatus(
          payment.external_reference,
          payment.status,
          payment.id,
          payment.payment_method_id // Agregar el método de pago
        );

        if (updateSuccess) {
          console.log('✅ Estado del pedido actualizado correctamente en Google Sheets');
        } else {
          console.error('❌ Error al actualizar el estado del pedido en Google Sheets');
        }
      } else {
        console.error('❌ Faltan datos necesarios en el pago:');
        console.error('- external_reference:', payment.external_reference);
        console.error('- status:', payment.status);
        console.error('- id:', payment.id);
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
export async function GET() {
  return NextResponse.json({ status: 'OK' });
}
