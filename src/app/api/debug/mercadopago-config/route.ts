import { NextRequest, NextResponse } from 'next/server';

// Endpoint para debug de configuración de MercadoPago
export async function GET() {
  try {
    const config = {
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      hasPublicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
      mode: process.env.MERCADOPAGO_MODE,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10) + '...',
      publicKeyPrefix: process.env.MERCADOPAGO_PUBLIC_KEY?.substring(0, 10) + '...',
    };
    
    return NextResponse.json({
      success: true,
      config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en debug de config:', error);
    return NextResponse.json(
      { error: 'Error en debug de configuración' },
      { status: 500 }
    );
  }
}
