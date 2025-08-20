import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllOrdersFromSheetsForAdmin } from '@/lib/orders-sheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const userEmail = url.searchParams.get('email') || session.user.email;

    console.log('🔍 DEBUG: Buscando pedidos para email:', userEmail);

    // Obtener todos los pedidos directamente desde la sheets
    const allOrders = await getAllOrdersFromSheetsForAdmin();
    console.log('📊 Total de pedidos en sheets:', allOrders.length);

    // Filtrar por usuario
    const userOrders = allOrders.filter(row => row[1] === userEmail); // Columna B es email
    console.log('📦 Pedidos del usuario:', userOrders.length);

    // Información detallada de cada pedido
    const orderDetails = userOrders.map(row => ({
      id: row[0], // Columna A
      email: row[1], // Columna B
      customerName: row[2], // Columna C
      total: row[3], // Columna D
      status: row[4], // Columna E
      items: row[5], // Columna F (JSON)
      shippingAddress: row[6], // Columna G
      paymentId: row[7], // Columna H
      paymentStatus: row[8], // Columna I
      createdAt: row[9], // Columna J
      paymentMethod: row[10], // Columna K
      trackingNumber: row[11], // Columna L
      rawRow: row
    }));

    return NextResponse.json({
      userEmail,
      totalOrdersInSheet: allOrders.length,
      userOrdersCount: userOrders.length,
      userOrders: orderDetails,
      allOrdersPreview: allOrders.slice(0, 5).map(row => ({
        id: row[0],
        email: row[1],
        name: row[2]
      }))
    });

  } catch (error) {
    console.error('Error en debug-orders:', error);
    return NextResponse.json({
      error: 'Error en debug',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
