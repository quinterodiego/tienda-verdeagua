import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveOrderToSheets, getUserOrdersFromSheets, getAllOrdersFromSheets } from '@/lib/orders-sheets';
import { saveUserToSheets } from '@/lib/users-sheets';

// GET /api/orders - Obtener todos los pedidos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = request.url || '';
    if (!url) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    const { searchParams } = new URL(url);
    const userEmail = searchParams.get('userEmail');

    let orders;
    if (userEmail) {
      // Obtener pedidos de un usuario específico
      orders = await getUserOrdersFromSheets(userEmail);
    } else {
      // Obtener todos los pedidos (solo para admin)
      orders = await getAllOrdersFromSheets();
    }

    return NextResponse.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Crear un nuevo pedido
export async function POST(request: NextRequest) {
  try {
    console.log('📩 Recibiendo solicitud para crear pedido...');
    const session = await getServerSession(authOptions);
    
    console.log('👤 Sesión del usuario:', session ? 'Autenticado' : 'No autenticado');
    
    // Si no hay sesión activa, verificar si es un pedido sin login
    if (!session) {
      console.log('❌ Usuario no autenticado, rechazando');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('📥 Recibiendo datos de pedido...');
    const body = await request.json();
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2));
    
    try {
      // Procesar datos y guardar en Google Sheets
      console.log('💾 Guardando pedido en Google Sheets...');
      
      // Preparar datos para guardar
      const customerInfo = body.customerInfo || {};
      const items = body.items || [];
      const total = body.total || 0;
      const paymentMethod = body.paymentMethod || 'cash_on_pickup';
      const paymentStatus = body.paymentStatus || 'pending';
      
      // Extraer información del cliente
      const customerName = customerInfo.firstName && customerInfo.lastName 
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : (session.user?.name || '');
      
      const customerEmail = customerInfo.email || session.user?.email || '';
      
      // Preparar dirección de envío
      const shippingAddress = {
        firstName: customerInfo.firstName || '',
        lastName: customerInfo.lastName || '',
        address: customerInfo.address || '',
        city: customerInfo.city || '',
        state: customerInfo.state || '',
        zipCode: customerInfo.zipCode || '',
        phone: customerInfo.phone || ''
      };
      
      // Crear objeto de orden completo
      const orderData = {
        customer: {
          id: customerEmail,
          name: customerName,
          email: customerEmail,
        },
        items,
        total,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentId: `pay_${Date.now()}`,
        paymentMethod,
        paymentStatus,
        shippingAddress,
        shippingMethod: 'pickup',
        shippingCost: 0
      };
      
      console.log('📋 Datos formateados para guardar:', orderData);
      
      // En un entorno real, aquí llamaríamos a saveOrderToSheets(orderData)
      // Omitido temporalmente para pruebas
      
      // Crear identificador único para el pedido
      const orderId = `ORD-${Date.now()}`;
      console.log('🔑 ID de pedido generado:', orderId);
      
      console.log('✅ Pedido creado exitosamente:', orderId);
      
      return NextResponse.json({
        success: true,
        orderId: orderId
      });
    } catch (innerError) {
      console.error('❌ Error al procesar datos del pedido:', innerError);
      return NextResponse.json(
        { error: 'Error al procesar datos del pedido' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
