import { NextRequest, NextResponse } from 'next/server';
import { getPreferenceService } from '@/lib/mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Tipos para los items del carrito
interface CartItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

interface CustomerInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
}

interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO - Crear preferencia de MercadoPago ===');
    
    // Verificar configuración de MercadoPago con más detalle
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    console.log('🔧 Configuración de MercadoPago:', {
      hasAccessToken: !!accessToken,
      hasPublicKey: !!publicKey,
      baseUrl,
      environment: process.env.NODE_ENV,
      accessTokenPrefix: accessToken ? accessToken.substring(0, 15) + '...' : 'NO CONFIGURADO',
      publicKeyPrefix: publicKey ? publicKey.substring(0, 15) + '...' : 'NO CONFIGURADO',
      isProductionToken: accessToken?.startsWith('APP_USR-') ? 'SÍ (PRODUCCIÓN)' : 'NO (TEST)',
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
    
    // Validar que las credenciales sean de producción si estamos en Vercel
    const isProduction = process.env.NODE_ENV === 'production' || 
                         process.env.VERCEL_ENV === 'production' ||
                         baseUrl?.includes('vercel.app') ||
                         baseUrl?.includes('tienda-verdeagua.com.ar');
    
    if (isProduction && accessToken && !accessToken.startsWith('APP_USR-')) {
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
    console.log('Modo MercadoPago:', isProduction ? 'production' : 'development');
    
    // En desarrollo o testing, permitir pagos sin autenticación estricta
    const allowUnauthenticated = !isProduction || baseUrl?.includes('localhost');
    
    if (!session?.user?.email && !allowUnauthenticated) {
      return NextResponse.json(
        { error: 'Autenticación requerida' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Datos recibidos:', JSON.stringify(body, null, 2));
    
    const { items, orderId, customerInfo }: { 
      items: CartItem[], 
      orderId: string, 
      customerInfo?: CustomerInfo 
    } = body;

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
      items: items.map((item: CartItem) => ({
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
      
      // Agregar timeout específico para producción (30 segundos)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout al crear preferencia en MercadoPago')), 30000);
      });
      
      const preferencePromise = preferenceService.create({
        body: preferenceData
      });
      
      console.log('🕐 Esperando respuesta de MercadoPago (timeout: 30s)...');
      const result = await Promise.race([preferencePromise, timeoutPromise]) as MercadoPagoPreferenceResponse;

      console.log('✅ Preferencia creada exitosamente:', result.id);
      console.log('🔗 Init point:', result.init_point);
      console.log('🧪 Sandbox init point:', result.sandbox_init_point);

      // Validar que la respuesta tenga los datos necesarios
      if (!result.id || !result.init_point) {
        throw new Error('Respuesta incompleta de MercadoPago');
      }

      return NextResponse.json({
        success: true,
        id: result.id,
        preferenceId: result.id,
        init_point: result.init_point,
        initPoint: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        sandboxInitPoint: result.sandbox_init_point,
      });
      
    } catch (mpError) {
      console.error('=== ERROR ESPECÍFICO DE MERCADOPAGO ===');
      console.error('🚨 Error del SDK:', mpError);
      console.error('🔍 Tipo de error:', typeof mpError);
      console.error('📋 Environment:', process.env.NODE_ENV);
      console.error('🌐 Base URL:', baseUrl);
      
      if (mpError instanceof Error) {
        console.error('💬 Mensaje:', mpError.message);
        console.error('📚 Stack:', mpError.stack);
      }
      
      // Verificar si es un error de autenticación o credenciales inválidas
      let errorMessage = 'Error desconocido';
      let errorDetails = {};
      
      if (mpError instanceof Error) {
        errorMessage = mpError.message;
        errorDetails = {
          message: mpError.message,
          name: mpError.name,
          stack: mpError.stack?.split('\n').slice(0, 3)
        };
      } else if (typeof mpError === 'object' && mpError !== null) {
        try {
          errorMessage = JSON.stringify(mpError);
          errorDetails = mpError;
        } catch {
          errorMessage = String(mpError);
          errorDetails = { rawError: String(mpError) };
        }
      } else {
        errorMessage = String(mpError);
        errorDetails = { rawError: String(mpError) };
      }
      
      // Si hay error de credenciales, devolver error claro
      if (errorMessage.includes('401') || 
          errorMessage.includes('unauthorized') || 
          errorMessage.includes('authentication') ||
          errorMessage.includes('invalid')) {
        
        console.log('� Error de autenticación en MercadoPago');
        
        return NextResponse.json(
          { 
            error: 'Error de autenticación con MercadoPago',
            details: errorMessage,
            errorDetails,
            suggestion: 'Asegúrate de que MERCADOPAGO_ACCESS_TOKEN esté configurado correctamente'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Error al crear preferencia en MercadoPago',
          details: errorMessage,
          errorDetails,
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
    
    let errorMessage = 'Error interno del servidor';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3)
      };
    } else if (typeof error === 'object' && error !== null) {
      try {
        errorMessage = JSON.stringify(error);
        errorDetails = error;
      } catch {
        errorMessage = String(error);
        errorDetails = { rawError: String(error) };
      }
    } else {
      errorMessage = String(error);
      errorDetails = { rawError: String(error) };
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: errorMessage,
        errorDetails
      },
      { status: 500 }
    );
  }
}
