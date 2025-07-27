import { NextRequest, NextResponse } from 'next/server';
import { MP_CONFIG, getReturnUrls } from '@/lib/mercadopago';

export async function GET(request: NextRequest) {
  try {
    // Verificar que las variables de entorno estén configuradas
    const config = {
      hasAccessToken: !!MP_CONFIG.accessToken,
      hasPublicKey: !!MP_CONFIG.publicKey,
      baseUrl: MP_CONFIG.baseUrl,
      accessTokenPrefix: MP_CONFIG.accessToken ? MP_CONFIG.accessToken.substring(0, 15) + '...' : 'NO CONFIGURADO',
      publicKeyPrefix: MP_CONFIG.publicKey ? MP_CONFIG.publicKey.substring(0, 15) + '...' : 'NO CONFIGURADO'
    };

    // Probar URLs de retorno
    const testReturnUrls = getReturnUrls('TEST-ORDER-123');

    return NextResponse.json({
      status: 'OK',
      message: 'Configuración de MercadoPago',
      config,
      testReturnUrls
    });

  } catch (error) {
    console.error('Error verificando configuración:', error);
    return NextResponse.json(
      { 
        error: 'Error al verificar configuración de MercadoPago',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
