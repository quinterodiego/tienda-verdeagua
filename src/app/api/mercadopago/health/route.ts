import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      hasPublicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
      mode: process.env.MERCADOPAGO_MODE || 'test',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN 
        ? process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 15) + '...' 
        : 'NO CONFIGURADO',
      publicKeyPrefix: process.env.MERCADOPAGO_PUBLIC_KEY
        ? process.env.MERCADOPAGO_PUBLIC_KEY.substring(0, 15) + '...'
        : 'NO CONFIGURADO',
      isProductionToken: process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('APP_USR-') 
        ? 'SÍ (PRODUCCIÓN)' 
        : 'NO (TEST O INVÁLIDO)',
      isProductionPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY?.startsWith('APP_USR-')
        ? 'SÍ (PRODUCCIÓN)'
        : 'NO (TEST O INVÁLIDO)',
      vercelDeployment: process.env.VERCEL ? 'SÍ' : 'NO',
      deploymentUrl: process.env.VERCEL_URL,
    };

    console.log('🔧 Health check de MercadoPago:', config);

    return NextResponse.json({
      status: 'OK',
      service: 'MercadoPago Configuration',
      ...config
    });

  } catch (error) {
    console.error('❌ Error en health check:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      service: 'MercadoPago Configuration',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
