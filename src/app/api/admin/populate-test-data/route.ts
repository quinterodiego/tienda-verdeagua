import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { saveOrderToSheets } from '@/lib/orders-sheets';

// POST /api/admin/populate-test-data - Poblar datos de prueba en Google Sheets
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🧪 Poblando datos de prueba en Google Sheets...');

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
            product: {
              id: 'agenda-escolar',
              name: 'Agenda Escolar Personalizada',
              price: 25.99,
            },
            quantity: 1,
          }
        ],
        total: 25.99,
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
            product: {
              id: 'taza-personalizada',
              name: 'Taza Personalizada',
              price: 15.50,
            },
            quantity: 2,
          }
        ],
        total: 31.00,
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
            product: {
              id: 'llavero-personalizado',
              name: 'Llavero Personalizado',
              price: 8.99,
            },
            quantity: 3,
          },
          {
            product: {
              id: 'stickers-pack',
              name: 'Pack de Stickers',
              price: 12.50,
            },
            quantity: 1,
          }
        ],
        total: 39.47,
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
    for (const order of testOrders) {
      try {
        const success = await saveOrderToSheets(order);
        if (success) {
          successCount++;
          console.log(`✅ Pedido de prueba ${order.id} guardado`);
        } else {
          console.warn(`⚠️ No se pudo guardar pedido ${order.id}`);
        }
      } catch (error) {
        console.error(`❌ Error guardando pedido ${order.id}:`, error);
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
