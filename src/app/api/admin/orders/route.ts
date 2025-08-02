import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllOrdersFromSheetsForAdmin } from '@/lib/orders-sheets';

// GET /api/admin/orders - Obtener todos los pedidos en formato admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea admin (esto debería verificarse con el rol del usuario)
    // Por ahora asumimos que cualquier usuario autenticado puede acceder al admin
    
    const orders = await getAllOrdersFromSheetsForAdmin();

    return NextResponse.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error al obtener pedidos para admin:', error);
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}
