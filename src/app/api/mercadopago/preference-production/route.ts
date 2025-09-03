import { NextRequest, NextResponse } from 'next/server';
import { getPreferenceService, getReturnUrls } from '@/lib/mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO - Crear preferencia de MercadoPago ===');
    
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

    // Verificar si tenemos credenciales válidas de MercadoPago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const mode = process.env.MERCADOPAGO_MODE || 'test';
    const isValidCredentials = accessToken && !accessToken.includes('TEST-') && mode === 'production';
    
    console.log('Modo configurado:', mode);
    console.log('Credenciales válidas para producción:', isValidCredentials);

    // Si no hay credenciales válidas o estamos en test, usar demo
    if (!isValidCredentials || mode !== 'production') {
      console.log('🧪 Usando modo DEMO/TEST');
      
      const fakePreferenceId = `${mode.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const demoInitPoint = `${baseUrl}/checkout/success?order_id=${orderId}&demo=true&preference_id=${fakePreferenceId}`;

      console.log('✅ Demo exitoso - Preference ID:', fakePreferenceId);

      return NextResponse.json({
        success: true,
        preferenceId: fakePreferenceId,
        initPoint: demoInitPoint,
        sandbox_init_point: demoInitPoint,
        demo: true,
        mode: mode,
        message: mode === 'test' ? '🧪 Modo de prueba activado' : '⚠️ Configura credenciales reales para producción',
        orderId: orderId,
        timestamp: new Date().toISOString()
      });
    }

    // Modo PRODUCCIÓN - Usar MercadoPago real
    console.log('🚀 Usando MercadoPago REAL - PRODUCCIÓN');
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const backUrls = getReturnUrls(orderId);

    // Formatear datos para MercadoPago
    const mpItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: 'ARS'
    }));

    // Formatear el teléfono
    const phoneNumber = customerInfo.phone.replace(/\s/g, '');
    const areaCode = phoneNumber.substring(0, 3);
    const number = phoneNumber.substring(3);

    const preferenceData = {
      items: mpItems,
      payer: {
        name: customerInfo.firstName,
        surname: customerInfo.lastName,
        email: customerInfo.email,
        phone: {
          area_code: areaCode,
          number: number
        },
        address: {
          street_name: customerInfo.address,
          zip_code: customerInfo.zipCode
        }
      },
      back_urls: backUrls,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      statement_descriptor: 'TIENDA ONLINE',
      external_reference: orderId
    };

    console.log('Creando preferencia REAL en MercadoPago...');
    const preferenceService = getPreferenceService();
    
    try {
      const preference = await preferenceService.create({ body: preferenceData });
      
      console.log('✅ Preferencia REAL creada exitosamente');
      
      return NextResponse.json({
        success: true,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        demo: false,
        mode: 'production',
        orderId: orderId,
        timestamp: new Date().toISOString()
      });
      
    } catch (mpError: any) {
      console.log('=== ERROR EN MERCADOPAGO REAL ===');
      console.log('Error:', mpError);
      
      // Si falla MercadoPago real, fallback a demo
      console.log('🔄 Fallback a modo DEMO por error en producción');
      
      const fakePreferenceId = `FALLBACK-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const demoInitPoint = `${baseUrl}/checkout/success?order_id=${orderId}&demo=true&preference_id=${fakePreferenceId}&fallback=true`;

      return NextResponse.json({
        success: true,
        preferenceId: fakePreferenceId,
        initPoint: demoInitPoint,
        sandbox_init_point: demoInitPoint,
        demo: true,
        mode: 'fallback',
        message: '⚠️ Error en producción - Usando modo demo como respaldo',
        orderId: orderId,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error general en crear preferencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
