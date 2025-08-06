import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test: Iniciando test simple de creación de pedido...');
    
    const session = await getServerSession(authOptions);
    console.log('👤 Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Datos de prueba muy simples
    const testOrderData = {
      customerInfo: {
        firstName: 'Usuario',
        lastName: 'Prueba',
        email: session.user?.email || 'test@example.com',
        phone: '1234567890',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      },
      items: [
        {
          id: 'test-product',
          name: 'Producto de Prueba',
          price: 100,
          quantity: 1,
          image: '/test.jpg'
        }
      ],
      total: 100,
      paymentMethod: 'cash_on_pickup',
      paymentStatus: 'pending'
    };
    
    console.log('📋 Datos de prueba:', testOrderData);
    
    // Llamar directamente al endpoint de orders
    console.log('🌐 Enviando a /api/orders...');
    
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pasar cookies de la sesión si las hay
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify(testOrderData),
    });
    
    console.log('📡 Respuesta status:', response.status);
    console.log('📡 Respuesta ok:', response.ok);
    
    const responseData = await response.json();
    console.log('📋 Respuesta data:', responseData);
    
    return NextResponse.json({
      success: response.ok,
      testData: testOrderData,
      apiResponse: responseData,
      statusCode: response.status
    });
    
  } catch (error) {
    console.error('❌ Error en test simple:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
