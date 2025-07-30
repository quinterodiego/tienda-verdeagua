import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== MODO DEMO COMPLETO - Simulando MercadoPago ===');
    
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
    console.log('Datos recibidos:', JSON.stringify(body, null, 2));
    
    const { items, orderId, customerInfo } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Error: Items inválidos');
      return NextResponse.json(
        { error: 'Items requeridos' },
        { status: 400 }
      );
    }

    if (!orderId) {
      console.log('Error: Order ID faltante');
      return NextResponse.json(
        { error: 'Order ID requerido' },
        { status: 400 }
      );
    }

    // MODO DEMO COMPLETO
    console.log('🧪 Generando pago DEMO');
    
    const fakePreferenceId = `DEMO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Simular URLs de MercadoPago pero redirigir a nuestras páginas de éxito
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const demoInitPoint = `${baseUrl}/checkout/success?order_id=${orderId}&demo=true&preference_id=${fakePreferenceId}`;

    console.log('✅ Demo exitoso - Preference ID:', fakePreferenceId);
    console.log('🔗 Demo Init Point:', demoInitPoint);

    // Simular un delay como si fuera MercadoPago real
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      preferenceId: fakePreferenceId,
      initPoint: demoInitPoint,
      sandbox_init_point: demoInitPoint,
      demo: true,
      message: '🧪 Modo DEMO - El pago será simulado exitosamente',
      orderId: orderId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en crear preferencia demo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
