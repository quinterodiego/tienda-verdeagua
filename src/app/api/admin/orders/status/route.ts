import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateOrderStatus } from '@/lib/orders-sheets';
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

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'ID de pedido y estado son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    const validStatuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
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
