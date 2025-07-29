import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/orders/[id] - Obtener un pedido específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    // En una aplicación real, buscarías en la base de datos
    // Por ahora simulamos con datos mock
    const order = {
      id,
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      items: [
        { id: '1', name: 'iPhone 15 Pro', price: 999, quantity: 1, image: '' }
      ],
      total: 999,
      status: 'pending',
      createdAt: '2025-01-24T10:00:00Z',
      updatedAt: '2025-01-24T10:00:00Z',
      paymentStatus: 'pending',
      shippingAddress: {
        firstName: 'Juan',
        lastName: 'Pérez',
        address: 'Calle Principal 123',
        city: 'Madrid',
        state: 'Madrid',
        zipCode: '28001',
        phone: '+34 600 123 456'
      }
    };

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Actualizar un pedido
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, trackingNumber, estimatedDelivery, notes } = body;

    // Validar que el estado sea válido
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    // Importar y usar la función de actualización de Google Sheets
    const { updateOrderStatus } = await import('@/lib/orders-sheets');
    
    // Actualizar en Google Sheets
    const success = await updateOrderStatus(id, status);
    
    if (!success) {
      return NextResponse.json({ error: 'Error al actualizar el pedido en la base de datos' }, { status: 500 });
    }

    const updatedOrder = {
      id,
      status,
      trackingNumber,
      estimatedDelivery,
      notes,
      updatedAt: new Date().toISOString()
    };

    console.log('Pedido actualizado exitosamente:', updatedOrder);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Pedido actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
