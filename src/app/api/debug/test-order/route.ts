import { NextRequest, NextResponse } from 'next/server';
import { saveOrderToSheets } from '@/lib/orders-sheets';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Debug: Iniciando test de creación de pedido...');
    
    // Datos de prueba para el pedido
    const testOrder = {
      customer: {
        id: 'test@example.com',
        name: 'Usuario de Prueba',
        email: 'test@example.com',
      },
      items: [
        {
          product: {
            id: 'test-product-1',
            name: 'Producto de Prueba',
            price: 100,
            image: '/test-image.jpg',
            description: 'Producto de prueba para debug',
            category: 'test',
            stock: 10
          },
          quantity: 1
        }
      ],
      total: 100,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentId: `test_payment_${Date.now()}`,
      paymentMethod: 'cash_on_pickup' as const,
      paymentStatus: 'pending' as const,
      shippingAddress: {
        firstName: 'Usuario',
        lastName: 'Prueba',
        address: 'Calle Falsa 123',
        city: 'Ciudad Prueba',
        state: 'Provincia Prueba',
        zipCode: '1234',
        phone: '1234567890'
      },
      shippingMethod: 'pickup',
      shippingCost: 0
    };
    
    console.log('📋 Debug: Datos de prueba preparados:', testOrder);
    
    console.log('🚀 Debug: Llamando a saveOrderToSheets...');
    const orderId = await saveOrderToSheets(testOrder);
    
    if (!orderId) {
      console.error('❌ Debug: saveOrderToSheets retornó null');
      return NextResponse.json({
        success: false,
        error: 'No se pudo crear el pedido de prueba',
        orderId: null
      }, { status: 500 });
    }
    
    console.log('✅ Debug: Pedido de prueba creado exitosamente:', orderId);
    
    return NextResponse.json({
      success: true,
      message: 'Pedido de prueba creado exitosamente',
      orderId: orderId,
      testData: testOrder
    });
    
  } catch (error) {
    console.error('❌ Debug: Error en test de pedido:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
