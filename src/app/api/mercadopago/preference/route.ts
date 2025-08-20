import { NextRequest, NextResponse } from 'next/server';
import { getPreferenceService, getReturnUrls, PAYMENT_METHODS_CONFIG } from '@/lib/mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO - Crear preferencia de MercadoPago ===');
    
    // Verificar configuración de MercadoPago con más detalle
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    const mode = process.env.MERCADOPAGO_MODE || 'test';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    console.log('🔧 Configuración de MercadoPago:', {
      hasAccessToken: !!accessToken,
      hasPublicKey: !!publicKey,
      mode,
      baseUrl,
      environment: process.env.NODE_ENV,
      accessTokenPrefix: accessToken ? accessToken.substring(0, 15) + '...' : 'NO CONFIGURADO',
      publicKeyPrefix: publicKey ? publicKey.substring(0, 15) + '...' : 'NO CONFIGURADO',
      isProductionToken: accessToken?.startsWith('APP_USR-') ? 'SÍ (PRODUCCIÓN)' : 'NO (TEST O INVÁLIDO)',
      timestamp: new Date().toISOString()
    });
    
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado');
      return NextResponse.json(
        { 
          error: 'Configuración de MercadoPago incompleta',
          details: 'MERCADOPAGO_ACCESS_TOKEN no está configurado en Vercel'
        },
        { status: 500 }
      );
    }

    if (!baseUrl) {
      console.error('❌ NEXT_PUBLIC_BASE_URL no configurado');
      return NextResponse.json(
        { 
          error: 'Configuración de URL base incompleta',
          details: 'NEXT_PUBLIC_BASE_URL no está configurado en Vercel'
        },
        { status: 500 }
      );
    }
    
    // Validar que las credenciales sean realmente de producción
    if (mode === 'production' && !accessToken.startsWith('APP_USR-')) {
      console.error('❌ Credenciales de producción requeridas');
      return NextResponse.json(
        { 
          error: 'Credenciales inválidas para producción',
          details: 'El access token debe comenzar con APP_USR- para modo producción'
        },
        { status: 500 }
      );
    }
    
    // Verificar autenticación 
    const session = await getServerSession(authOptions);
    console.log('Sesión de usuario:', session?.user?.email || 'No autenticado');
    console.log('Modo MercadoPago:', mode);
    
    // En modo producción con localhost, permitir pagos sin autenticación para testing
    const isProductionTesting = mode === 'production' && 
      (process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost') || 
       process.env.NEXT_PUBLIC_BASE_URL?.includes('127.0.0.1'));
    
    if (!session?.user?.email && !isProductionTesting) {
      console.log('⚠️ Usuario no autenticado - Usando modo DEMO');
      
      // Para usuarios no autenticados, usar modo demo directamente
      const body = await request.json();
      const { items, orderId } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'Items requeridos' }, { status: 400 });
      }

      if (!orderId) {
        return NextResponse.json({ error: 'Order ID requerido' }, { status: 400 });
      }

      // Generar respuesta demo para usuarios no autenticados
      const fakePreferenceId = `DEMO-UNAUTH-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const demoInitPoint = `${baseUrl}/demo/mercadopago?order_id=${orderId}&preference_id=${fakePreferenceId}&unauth=true`;

      console.log('🧪 Modo DEMO activado para usuario no autenticado');
      
      return NextResponse.json({
        success: true,
        id: fakePreferenceId,
        preferenceId: fakePreferenceId,
        init_point: demoInitPoint,
        initPoint: demoInitPoint,
        sandbox_init_point: demoInitPoint,
        sandboxInitPoint: demoInitPoint,
        demo: true,
        unauth: true,
        message: '🧪 Modo DEMO - Usuario no autenticado',
        orderId: orderId,
        timestamp: new Date().toISOString()
      });
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

    console.log('Items a procesar:', items.length);
    console.log('Order ID:', orderId);

    // Calcular el total
    const total = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    );

    // URLs de retorno - hardcodeadas para asegurar que funcionen
    const returnUrls = {
      success: `${baseUrl}/checkout/success?order_id=${orderId}`,
      failure: `${baseUrl}/checkout/failure?order_id=${orderId}`,
      pending: `${baseUrl}/checkout/pending?order_id=${orderId}`,
    };
    console.log('Base URL utilizada:', baseUrl);
    console.log('URLs de retorno:', returnUrls);

    // Crear la preferencia de pago
    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS', // Cambiar según tu país
      })),
      payer: {
        name: customerInfo?.firstName || session?.user?.name?.split(' ')[0] || 'Usuario',
        surname: customerInfo?.lastName || session?.user?.name?.split(' ').slice(1).join(' ') || 'Prueba',
        email: session?.user?.email || customerInfo?.email || 'test@prueba.com',
        phone: customerInfo?.phone ? {
          area_code: customerInfo.phone.substring(0, 3),
          number: customerInfo.phone.substring(3),
        } : undefined,
        address: customerInfo?.address ? {
          street_name: customerInfo.address,
          zip_code: customerInfo.zipCode,
        } : undefined,
      },
      back_urls: {
        success: returnUrls.success,
        failure: returnUrls.failure,
        pending: returnUrls.pending,
      },
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      statement_descriptor: 'TIENDA ONLINE',
      external_reference: orderId,
    };

    console.log('Datos de preferencia a enviar:', JSON.stringify(preferenceData, null, 2));

    // Crear la preferencia en MercadoPago
    console.log('Creando preferencia en MercadoPago...');
    
    try {
      const preferenceService = getPreferenceService();
      console.log('Servicio de preferencia inicializado');
      
      const preference = await preferenceService.create({
        body: preferenceData
      });

      console.log('Preferencia creada exitosamente:', preference.id);
      console.log('Init point:', preference.init_point);
      console.log('Sandbox init point:', preference.sandbox_init_point);

      return NextResponse.json({
        success: true,
        id: preference.id,
        preferenceId: preference.id,
        init_point: preference.init_point,
        initPoint: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      });
      
    } catch (mpError) {
      console.error('=== ERROR ESPECÍFICO DE MERCADOPAGO ===');
      console.error('Error del SDK:', mpError);
      console.error('Tipo de error:', typeof mpError);
      
      if (mpError instanceof Error) {
        console.error('Mensaje:', mpError.message);
        console.error('Stack:', mpError.stack);
      }
      
      // Verificar si es un error de autenticación o credenciales inválidas
      const errorMessage = mpError instanceof Error ? mpError.message : String(mpError);
      
      // Si hay error de credenciales, usar modo demo como fallback
      if (errorMessage.includes('401') || 
          errorMessage.includes('unauthorized') || 
          errorMessage.includes('authentication') ||
          errorMessage.includes('invalid') ||
          accessToken.includes('PASTE_YOUR') ||
          accessToken.includes('TU_NUEVO')) {
        
        console.log('🔄 Fallback a modo DEMO por credenciales inválidas');
        
        // Generar respuesta demo
        const fakePreferenceId = `DEMO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const demoInitPoint = `${baseUrl}/demo/mercadopago?order_id=${orderId}&preference_id=${fakePreferenceId}`;

        return NextResponse.json({
          success: true,
          id: fakePreferenceId,
          preferenceId: fakePreferenceId,
          init_point: demoInitPoint,
          initPoint: demoInitPoint,
          sandbox_init_point: demoInitPoint,
          sandboxInitPoint: demoInitPoint,
          demo: true,
          message: '🧪 Modo DEMO - Configurar credenciales reales de MercadoPago',
          orderId: orderId,
          timestamp: new Date().toISOString()
        });
      }
      
      return NextResponse.json(
        { 
          error: 'Error al crear preferencia en MercadoPago',
          details: errorMessage,
          suggestion: 'Verifica las credenciales de MercadoPago en las variables de entorno'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('=== ERROR EN CREAR PREFERENCIA ===');
    console.error('Error completo:', error);
    console.error('Tipo de error:', typeof error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
