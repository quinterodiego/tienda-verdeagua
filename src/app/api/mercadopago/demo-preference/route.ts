import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Endpoint temporal para simular MercadoPago cuando las credenciales no funcionan
export async function POST(request: NextRequest) {
  try {
    console.log('=== MODO DEMO - Simulando MercadoPago ===');
    
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    console.log('Sesión de usuario:', session?.user?.email || 'No autenticado');
    
    if (!session?.user?.email) {
      console.log('Error: Usuario no autenticado');
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Datos recibidos para simulación:', JSON.stringify(body, null, 2));
    
    const { items, orderId, customerInfo } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items requeridos' },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID requerido' },
        { status: 400 }
      );
    }

    // Simular respuesta de MercadoPago
    const fakePreferenceId = `DEMO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const fakeInitPoint = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${fakePreferenceId}`;

    console.log('✅ Simulación exitosa - Preference ID:', fakePreferenceId);

    return NextResponse.json({
      success: true,
      preferenceId: fakePreferenceId,
      initPoint: fakeInitPoint,
      sandbox_init_point: fakeInitPoint,
      demo: true,
      message: 'Este es un pago simulado. En producción usarás credenciales reales.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en simulación de MercadoPago:', error);
    return NextResponse.json(
      { error: 'Error en simulación' },
      { status: 500 }
    );
  }
}
