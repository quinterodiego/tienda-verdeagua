import { NextRequest, NextResponse } from 'next/server';
import { getPreferenceService } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [PROD-DEBUG] Iniciando prueba de MercadoPago...');
    
    const startTime = Date.now();
    
    // Verificar configuración
    const config = {
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      mode: process.env.MERCADOPAGO_MODE || 'test',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    console.log('🔧 Config check:', config);

    // Crear preferencia de prueba simple
    const preferenceData = {
      items: [{
        id: 'debug-item',
        title: 'Debug Test',
        quantity: 1,
        unit_price: 100,
        currency_id: 'ARS'
      }],
      external_reference: `debug-${Date.now()}`
    };

    const preferenceService = getPreferenceService();
    const preference = await preferenceService.create({ body: preferenceData });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      duration: `${duration}ms`,
      config
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
