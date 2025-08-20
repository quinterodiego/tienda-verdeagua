import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'd86webs@gmail.com') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar configuración de email
    const config = {
      EMAIL_HOST: process.env.EMAIL_HOST || 'NO CONFIGURADO',
      EMAIL_PORT: process.env.EMAIL_PORT || 'NO CONFIGURADO',
      EMAIL_SECURE: process.env.EMAIL_SECURE || 'false',
      EMAIL_USER: process.env.EMAIL_USER ? 'CONFIGURADO' : 'NO CONFIGURADO',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'CONFIGURADO' : 'NO CONFIGURADO',
      EMAIL_FROM: process.env.EMAIL_FROM || 'NO CONFIGURADO',
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'NO CONFIGURADO',
      EMAIL_ADMIN: process.env.EMAIL_ADMIN || 'NO CONFIGURADO'
    };

    // Verificar si todas las variables están configuradas
    const missingVars: string[] = [];
    if (!process.env.EMAIL_HOST) missingVars.push('EMAIL_HOST');
    if (!process.env.EMAIL_PORT) missingVars.push('EMAIL_PORT');
    if (!process.env.EMAIL_USER) missingVars.push('EMAIL_USER');
    if (!process.env.EMAIL_PASSWORD) missingVars.push('EMAIL_PASSWORD');
    if (!process.env.EMAIL_FROM) missingVars.push('EMAIL_FROM');

    const isConfigComplete = missingVars.length === 0;

    return NextResponse.json({
      success: isConfigComplete,
      message: isConfigComplete 
        ? 'Configuración SMTP completa' 
        : `Faltan variables: ${missingVars.join(', ')}`,
      emailConfig: {
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: config.EMAIL_SECURE,
        user: config.EMAIL_USER,
        from: config.EMAIL_FROM,
        admin: config.EMAIL_ADMIN
      },
      missingVariables: missingVars,
      details: isConfigComplete 
        ? 'Todas las variables de entorno necesarias están configuradas'
        : 'Configura las variables faltantes en Vercel para habilitar el envío de emails'
    });

  } catch (error) {
    console.error('Error al verificar configuración de email:', error);
    return NextResponse.json({ 
      error: 'Error al verificar configuración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
