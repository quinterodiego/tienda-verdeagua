import { NextRequest, NextResponse } from 'next/server';

// Endpoint para verificar configuración antes de ir a producción
export async function GET() {
  try {
    const config = {
      environment: process.env.NODE_ENV,
      mercadopago: {
        mode: process.env.MERCADOPAGO_MODE,
        hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
        hasPublicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
        accessTokenType: process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-') ? 'TEST' : 
                         process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('APP_USR-') ? 'PRODUCTION' : 'UNKNOWN',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      },
      nextauth: {
        url: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0
      },
      google: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        clientIdType: process.env.GOOGLE_CLIENT_ID?.includes('localhost') ? 'LOCALHOST' : 'PRODUCTION'
      },
      googleSheets: {
        hasSheetId: !!process.env.GOOGLE_SHEET_ID,
        hasCredentials: !!process.env.GOOGLE_PRIVATE_KEY && !!process.env.GOOGLE_CLIENT_EMAIL
      },
      cloudinary: {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
      }
    };

    // Verificaciones de producción
    const productionChecks = {
      mercadopago: {
        ready: config.mercadopago.mode === 'production' && 
               config.mercadopago.accessTokenType === 'PRODUCTION' &&
               !config.mercadopago.baseUrl?.includes('localhost'),
        issues: [] as string[]
      },
      nextauth: {
        ready: config.nextauth.hasSecret && 
               config.nextauth.secretLength >= 32 &&
               !config.nextauth.url?.includes('localhost'),
        issues: [] as string[]
      },
      google: {
        ready: config.google.hasClientId && 
               config.google.hasClientSecret &&
               config.google.clientIdType === 'PRODUCTION',
        issues: [] as string[]
      }
    };

    // Detectar problemas
    if (config.mercadopago.mode !== 'production') {
      productionChecks.mercadopago.issues.push('MERCADOPAGO_MODE debe ser "production"');
    }
    if (config.mercadopago.accessTokenType !== 'PRODUCTION') {
      productionChecks.mercadopago.issues.push('Usar credenciales reales (APP_USR-), no TEST-');
    }
    if (config.mercadopago.baseUrl?.includes('localhost')) {
      productionChecks.mercadopago.issues.push('NEXT_PUBLIC_BASE_URL debe ser tu dominio real');
    }

    if (config.nextauth.secretLength < 32) {
      productionChecks.nextauth.issues.push('NEXTAUTH_SECRET debe tener al menos 32 caracteres');
    }
    if (config.nextauth.url?.includes('localhost')) {
      productionChecks.nextauth.issues.push('NEXTAUTH_URL debe ser tu dominio real');
    }

    if (config.google.clientIdType !== 'PRODUCTION') {
      productionChecks.google.issues.push('Configurar Google OAuth para dominio de producción');
    }

    const isReadyForProduction = Object.values(productionChecks).every(check => check.ready);

    return NextResponse.json({
      ready: isReadyForProduction,
      config,
      productionChecks,
      recommendations: isReadyForProduction ? 
        ['✅ Sistema listo para producción'] : 
        [
          '⚠️ Revisa los issues antes de ir a producción',
          '📖 Consulta .env.production.example para configuración completa',
          '🧪 Testa en staging antes del deploy final'
        ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error verificando configuración:', error);
    return NextResponse.json({
      error: 'Error verificando configuración',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
