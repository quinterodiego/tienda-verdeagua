import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar configuración de email
    const emailConfig = {
      EMAIL_HOST: process.env.EMAIL_HOST || 'No configurado',
      EMAIL_PORT: process.env.EMAIL_PORT || 'No configurado',
      EMAIL_USER: process.env.EMAIL_USER ? 'Configurado' : 'No configurado',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Configurado' : 'No configurado',
      EMAIL_FROM: process.env.EMAIL_FROM || 'No configurado',
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'No configurado',
      EMAIL_ADMIN: process.env.EMAIL_ADMIN || 'No configurado',
      EMAIL_LOGO_URL: process.env.EMAIL_LOGO_URL || 'No configurado',
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      emailConfig,
      adminNotificationEnabled: !!(process.env.EMAIL_ADMIN || process.env.EMAIL_FROM),
      emailSystemEnabled: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
    });

  } catch (error) {
    console.error('❌ Error al verificar configuración de email:', error);
    return NextResponse.json({ 
      error: 'Error al verificar configuración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
