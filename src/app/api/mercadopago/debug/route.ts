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
