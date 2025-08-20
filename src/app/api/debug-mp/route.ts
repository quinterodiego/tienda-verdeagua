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
    console.error('🚨 [PROD-DEBUG] Error capturado:', error);
    console.error('🔍 Tipo de error:', typeof error);
    console.error('🏗️ Constructor:', error?.constructor?.name);
    
    let errorDetails = {};
    let errorMessage = 'Error desconocido';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5) // Solo primeras 5 líneas del stack
      };
    } else if (typeof error === 'object' && error !== null) {
      try {
        errorMessage = JSON.stringify(error);
        errorDetails = error;
      } catch {
        errorMessage = `Error al serializar: ${String(error)}`;
        errorDetails = { rawError: String(error) };
      }
    } else {
      errorMessage = String(error);
      errorDetails = { rawError: String(error) };
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorDetails,
      environment: process.env.NODE_ENV,
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 15) + '...',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
