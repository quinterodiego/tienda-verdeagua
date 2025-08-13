import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== VERIFICACIÓN DE CREDENCIALES ===');
    
    // Verificar variables de entorno
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    console.log('Access Token presente:', !!accessToken);
    console.log('Public Key presente:', !!publicKey);
    console.log('Base URL:', baseUrl);
    
    if (accessToken) {
      console.log('Access Token prefix:', accessToken.substring(0, 20) + '...');
    }
    
    if (publicKey) {
      console.log('Public Key prefix:', publicKey.substring(0, 20) + '...');
    }

    // Probar inicialización de MercadoPago
    const { getMercadoPago } = await import('@/lib/mercadopago');
    
    try {
      const mp = getMercadoPago();
      console.log('MercadoPago inicializado correctamente');
      
      return NextResponse.json({
        status: 'OK',
        message: 'Configuración de MercadoPago verificada',
        config: {
          hasAccessToken: !!accessToken,
          hasPublicKey: !!publicKey,
          baseUrl: baseUrl,
          accessTokenPrefix: accessToken ? accessToken.substring(0, 15) + '...' : 'NO CONFIGURADO',
          publicKeyPrefix: publicKey ? publicKey.substring(0, 15) + '...' : 'NO CONFIGURADO',
          mercadoPagoInitialized: true
        }
      });
      
    } catch (mpError) {
      console.error('Error al inicializar MercadoPago:', mpError);
      return NextResponse.json({
        status: 'ERROR',
        message: 'Error al inicializar MercadoPago',
        error: mpError instanceof Error ? mpError.message : 'Error desconocido',
        config: {
          hasAccessToken: !!accessToken,
          hasPublicKey: !!publicKey,
          baseUrl: baseUrl,
          mercadoPagoInitialized: false
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error general en verificación:', error);
    return NextResponse.json(
      { 
        status: 'ERROR',
        error: 'Error al verificar configuración de MercadoPago',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG - Crear preferencia de MercadoPago SIN AUTENTICACIÓN ===');
    
    // Verificar configuración de MercadoPago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    console.log('MercadoPago Access Token configurado:', accessToken ? 'SÍ' : 'NO');
    console.log('Token (primeros 20 chars):', accessToken?.substring(0, 20) + '...');
    
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado');
      return NextResponse.json(
        { 
          error: 'Configuración de MercadoPago incompleta',
          details: 'MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2));

    const { items, payer, total } = body;

    // Validaciones básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items requeridos y deben ser un array no vacío' },
        { status: 400 }
      );
    }

    if (!payer || !payer.email) {
      return NextResponse.json(
        { error: 'Información del pagador requerida (mínimo email)' },
        { status: 400 }
      );
    }

    // Importar funciones de MercadoPago
    const { getPreferenceService, getReturnUrls, PAYMENT_METHODS_CONFIG } = await import('@/lib/mercadopago');
    
    // Crear datos de preferencia
    const orderId = `debug-${Date.now()}`;
    const returnUrlsConfig = getReturnUrls(orderId);
    
    console.log('📍 Return URLs config:', JSON.stringify(returnUrlsConfig, null, 2));
    
    const preferenceData = {
      items: items.map((item: { title?: string; description?: string; quantity?: number; unit_price?: number }) => ({
        id: `item-${Date.now()}-${Math.random()}`,
        title: item.title || 'Producto',
        description: item.description || item.title || 'Producto de la tienda',
        quantity: parseInt(String(item.quantity)) || 1,
        unit_price: parseFloat(String(item.unit_price)) || 0,
        currency_id: 'ARS'
      })),
      payer: {
        name: payer.name || 'Cliente',
        surname: payer.surname || 'Test',
        email: payer.email,
        phone: payer.phone ? {
          area_code: '11',
          number: payer.phone.replace(/[^\d]/g, '')
        } : undefined
      },
      back_urls: {
        success: returnUrlsConfig.success,
        failure: returnUrlsConfig.failure,
        pending: returnUrlsConfig.pending
      },
      auto_return: 'approved' as const,
      payment_methods: PAYMENT_METHODS_CONFIG,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
      external_reference: orderId,
      expires: false
    };

    console.log('📋 Preferencia a crear:', JSON.stringify(preferenceData, null, 2));

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
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        message: 'Preferencia creada exitosamente en modo DEBUG'
      });
      
    } catch (mpError) {
      console.error('=== ERROR ESPECÍFICO DE MERCADOPAGO ===');
      console.error('Error del SDK:', mpError);
      console.error('Tipo de error:', typeof mpError);
      console.error('Error stringificado:', JSON.stringify(mpError, null, 2));
      
      let errorMessage = 'Error desconocido';
      let errorDetails = {};
      
      if (mpError instanceof Error) {
        console.error('Mensaje:', mpError.message);
        console.error('Stack:', mpError.stack);
        errorMessage = mpError.message;
        
        // Si es un error de axios o fetch, puede tener más información
        if ('response' in mpError && mpError.response) {
          const response = mpError.response as any;
          console.error('Response data:', response.data);
          console.error('Response status:', response.status);
          errorDetails = {
            status: response.status,
            data: response.data
          };
        }
      } else {
        // Si no es una instancia de Error, intentar obtener información útil
        errorMessage = String(mpError);
        if (typeof mpError === 'object' && mpError !== null) {
          errorDetails = mpError;
        }
      }
      
      // Verificar si es un error de autenticación
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        return NextResponse.json(
          { 
            error: 'Error de autenticación con MercadoPago',
            details: 'Verifica que MERCADOPAGO_ACCESS_TOKEN sea válido',
            mpError: errorMessage,
            fullError: errorDetails
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Error al crear preferencia en MercadoPago',
          details: errorMessage,
          fullError: errorDetails,
          suggestion: 'Verifica las credenciales de MercadoPago en las variables de entorno'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
