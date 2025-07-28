import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { saveOrderToSheets } from '@/lib/orders-sheets';
import { products } from '@/data/products';

// POST /api/admin/populate-test-data - Poblar datos de prueba en Google Sheets
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🧪 Poblando datos de prueba en Google Sheets...');

    // Obtener productos para usar en los pedidos de prueba
    const product1 = products.find(p => p.id === '1'); // Agenda Escolar
    const product2 = products.find(p => p.id === '2'); // Taza Personalizada
    const product3 = products.find(p => p.id === '3'); // Llavero Acrílico
    const product4 = products.find(p => p.id === '4'); // Pack de Stickers

    if (!product1 || !product2 || !product3 || !product4) {
      return NextResponse.json({ error: 'No se encontraron productos para datos de prueba' }, { status: 400 });
    }

    // Datos de prueba para pedidos
    const testOrders = [
      {
        customer: {
          id: 'customer@test.com',
          name: 'Juan Pérez',
          email: 'customer@test.com',
        },
        items: [
          {
            product: product1,
            quantity: 1,
          }
        ],
        total: product1.price,
        status: 'delivered' as const,
        paymentId: 'TEST-PAY-001',
        paymentStatus: 'approved' as const,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          address: 'Calle Falsa 123',
          city: 'Buenos Aires',
          state: 'CABA',
          zipCode: '1001',
          phone: '+54 11 1234-5678',
        },
      },
      {
        customer: {
          id: 'maria@test.com',
          name: 'María García',
          email: 'maria@test.com',
        },
        items: [
          {
            product: product2,
            quantity: 2,
          }
        ],
        total: product2.price * 2,
        status: 'shipped' as const,
        paymentId: 'TEST-PAY-002',
        paymentStatus: 'approved' as const,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
        updatedAt: new Date(),
        shippingAddress: {
          firstName: 'María',
          lastName: 'García',
          address: 'Av. Corrientes 456',
          city: 'Buenos Aires',
          state: 'CABA',
          zipCode: '1002',
          phone: '+54 11 2345-6789',
        },
      },
      {
        customer: {
          id: 'carlos@test.com',
          name: 'Carlos López',
          email: 'carlos@test.com',
        },
        items: [
          {
            product: product3,
            quantity: 3,
          },
          {
            product: product4,
            quantity: 1,
          }
        ],
        total: (product3.price * 3) + product4.price,
        status: 'pending' as const,
        paymentId: 'TEST-PAY-003',
        paymentStatus: 'pending' as const,
        createdAt: new Date(), // Hoy
        updatedAt: new Date(),
        shippingAddress: {
          firstName: 'Carlos',
          lastName: 'López',
          address: 'San Martín 789',
          city: 'Córdoba',
          state: 'Córdoba',
          zipCode: '5000',
          phone: '+54 351 456-7890',
        },
      }
    ];

    // Insertar pedidos de prueba
    let successCount = 0;
    for (let i = 0; i < testOrders.length; i++) {
      const order = testOrders[i];
      try {
        const orderId = await saveOrderToSheets(order);
        if (orderId) {
          successCount++;
          console.log(`✅ Pedido de prueba ${orderId} guardado`);
        } else {
          console.warn(`⚠️ No se pudo guardar pedido de prueba ${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error guardando pedido de prueba ${i + 1}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Datos de prueba poblados exitosamente. ${successCount}/${testOrders.length} pedidos creados.`,
      ordersCreated: successCount
    });

  } catch (error) {
    console.error('❌ Error poblando datos de prueba:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
