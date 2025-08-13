import { NextRequest, NextResponse } from 'next/server';
import { getPreferenceService, getReturnUrls, PAYMENT_METHODS_CONFIG } from '@/lib/mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO - Crear preferencia de MercadoPago ===');
    
    // Verificar configuración de MercadoPago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    console.log('MercadoPago Access Token configurado:', accessToken ? 'SÍ' : 'NO');
    
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

    console.log('Items a procesar:', items.length);
    console.log('Order ID:', orderId);

    // Calcular el total
    const total = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    );

    // URLs de retorno - hardcodeadas para asegurar que funcionen
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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
        name: customerInfo?.firstName || session.user.name?.split(' ')[0],
        surname: customerInfo?.lastName || session.user.name?.split(' ').slice(1).join(' '),
        email: session.user.email,
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
        preferenceId: preference.id,
        initPoint: preference.init_point,
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
      
      // Verificar si es un error de autenticación
      const errorMessage = mpError instanceof Error ? mpError.message : String(mpError);
      
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        return NextResponse.json(
          { 
            error: 'Error de autenticación con MercadoPago',
            details: 'Verifica que MERCADOPAGO_ACCESS_TOKEN sea válido',
            mpError: errorMessage
          },
          { status: 401 }
        );
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
