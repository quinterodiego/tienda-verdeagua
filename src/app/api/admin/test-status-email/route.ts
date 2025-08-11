import { NextRequest, NextResponse } from 'next/server';
// import { sendOrderStatusUpdateEmail } from '@/lib/email';
import { isAdminUser } from '@/lib/admin-config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea administrador
    const session = await getServerSession(authOptions);
    if (!session || !await isAdminUser(session)) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden probar emails.' },
        { status: 403 }
      );
    }

    // Temporalmente deshabilitado para evitar errores de build
    return NextResponse.json(
      { error: 'Función temporalmente deshabilitada para mantenimiento.' },
      { status: 503 }
    );

    /*
    const body = await request.json();
    const { 
      orderId, 
      customerName, 
      customerEmail, 
      newStatus, 
      items, 
      total, 
      trackingNumber, 
      estimatedDelivery,
      cancellationReason 
    } = body;

    // Validar datos requeridos
    if (!orderId || !customerName || !customerEmail || !newStatus) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: orderId, customerName, customerEmail, newStatus' },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Datos de ejemplo si no se proporcionan
    const emailData = {
      orderId,
      customerName,
      customerEmail,
      newStatus,
      items: items || [
        { productName: 'Producto de Prueba 1', quantity: 1, price: 25.99 },
        { productName: 'Producto de Prueba 2', quantity: 2, price: 19.50 }
      ],
      total: total || 65.99,
      orderDate: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      trackingNumber,
      estimatedDelivery,
      cancellationReason
    };

    console.log(`📧 [TEST] Enviando email de prueba a ${customerEmail} para pedido ${orderId} - Estado: ${newStatus}`);
    
    await sendOrderStatusUpdateEmail(emailData);
    
    console.log(`✅ [TEST] Email de prueba enviado exitosamente`);

    return NextResponse.json({
      success: true,
      message: 'Email de prueba enviado exitosamente',
      data: {
        orderId,
        customerEmail,
        newStatus,
        timestamp: new Date().toISOString()
      }
    });
    */

  } catch (error) {
    console.error('❌ Error al enviar email de prueba:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para obtener información sobre los tipos de email disponibles
export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario sea administrador
    const session = await getServerSession(authOptions);
    if (!session || !await isAdminUser(session)) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden acceder.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: 'API de prueba de emails de estado de pedido',
      availableStatuses: [
        {
          status: 'pending',
          name: 'Pendiente',
          description: 'Pedido recibido, esperando confirmación'
        },
        {
          status: 'confirmed',
          name: 'Confirmado',
          description: 'Pago verificado, pedido confirmado'
        },
        {
          status: 'processing',
          name: 'Procesando',
          description: 'Pedido siendo preparado'
        },
        {
          status: 'shipped',
          name: 'Enviado',
          description: 'Pedido en camino al cliente'
        },
        {
          status: 'delivered',
          name: 'Entregado',
          description: 'Pedido entregado exitosamente'
        },
        {
          status: 'cancelled',
          name: 'Cancelado',
          description: 'Pedido cancelado'
        }
      ],
      exampleRequest: {
        orderId: 'TEST-001',
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
        newStatus: 'shipped',
        items: [
          { productName: 'Producto 1', quantity: 1, price: 25.99 },
          { productName: 'Producto 2', quantity: 2, price: 19.50 }
        ],
        total: 65.99,
        trackingNumber: 'MP123456789',
        estimatedDelivery: '3-5 días hábiles'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
