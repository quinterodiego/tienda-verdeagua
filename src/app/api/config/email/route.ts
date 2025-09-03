import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Tipos para la configuración de email
interface EmailConfig {
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  EMAIL_ADMIN?: string;
  EMAIL_HOST?: string;
  EMAIL_PORT?: string;
  EMAIL_USER?: string;
  EMAIL_PASSWORD?: string;
  EMAIL_SECURE?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'd86webs@gmail.com') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener configuración actual de las variables de entorno
    const config: EmailConfig = {
      EMAIL_FROM: process.env.EMAIL_FROM || '',
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || '',
      EMAIL_ADMIN: process.env.EMAIL_ADMIN || '',
      EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
      EMAIL_PORT: process.env.EMAIL_PORT || '587',
      EMAIL_USER: process.env.EMAIL_USER || '',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***CONFIGURADA***' : '',
      EMAIL_SECURE: process.env.EMAIL_SECURE || 'false'
    };

    return NextResponse.json({
      success: true,
      message: 'Configuración actual cargada',
      ...config
    });

  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json({ 
      error: 'Error al obtener configuración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'd86webs@gmail.com') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config: EmailConfig = await request.json();

    // Validaciones básicas
    const errors: string[] = [];
    
    if (config.EMAIL_FROM && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.EMAIL_FROM)) {
      errors.push('EMAIL_FROM debe ser un email válido');
    }
    
    if (config.EMAIL_ADMIN && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.EMAIL_ADMIN)) {
      errors.push('EMAIL_ADMIN debe ser un email válido');
    }
    
    if (config.EMAIL_USER && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.EMAIL_USER)) {
      errors.push('EMAIL_USER debe ser un email válido');
    }
    
    if (config.EMAIL_PORT && !/^\d+$/.test(config.EMAIL_PORT)) {
      errors.push('EMAIL_PORT debe ser un número');
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Errores de validación',
        details: errors.join(', ')
      }, { status: 400 });
    }

    // Crear el payload para actualizar Vercel
    const vercelEnvUpdates = Object.entries(config)
      .filter(([, value]) => value && value !== '***CONFIGURADA***')
      .map(([key, value]) => ({ key, value: String(value) }));

    // Si no hay actualizaciones, devolver mensaje
    if (vercelEnvUpdates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No hay cambios para actualizar'
      });
    }

    return NextResponse.json({
      success: true,
      message: `Configuración preparada para actualizar ${vercelEnvUpdates.length} variables`,
      vercelEnvUpdates,
      instructions: [
        '1. Ve a tu panel de Vercel: https://vercel.com/dashboard',
        '2. Selecciona tu proyecto: tienda-verdeagua',
        '3. Ve a Settings > Environment Variables',
        '4. Actualiza las siguientes variables:',
        ...vercelEnvUpdates.map(env => `   - ${env.key}: ${env.value}`),
        '5. Redeploy el proyecto para aplicar los cambios'
      ]
    });

  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json({ 
      error: 'Error al procesar configuración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
