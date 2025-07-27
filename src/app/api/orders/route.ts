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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { items, total, shippingAddress, paymentId } = body;

    // Validar datos requeridos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items requeridos' }, { status: 400 });
    }

    if (!total || total <= 0) {
      return NextResponse.json({ error: 'Total inválido' }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Dirección de envío requerida' }, { status: 400 });
    }

    // Guardar usuario si no existe
    await saveUserToSheets({
      name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      email: session.user?.email || '',
    });

    // Crear objeto de pedido
    const orderData = {
      customer: {
        id: session.user?.email || '',
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        email: session.user?.email || '',
      },
      items,
      total,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentId,
      paymentStatus: 'pending' as const,
      shippingAddress
    };

    // Guardar pedido en Google Sheets
    const orderId = await saveOrderToSheets(orderData);
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Error al crear el pedido' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: orderId
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
