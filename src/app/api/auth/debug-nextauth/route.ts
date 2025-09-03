import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug NextAuth iniciado');
    
    // Verificar configuración básica
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    console.log('🔧 Variables de entorno:', {
      googleClientId: googleClientId ? `${googleClientId.substring(0, 10)}...` : 'NO DEFINIDO',
      googleClientSecret: googleClientSecret ? 'DEFINIDO' : 'NO DEFINIDO',
      nextAuthSecret: nextAuthSecret ? 'DEFINIDO' : 'NO DEFINIDO',
      nextAuthUrl: nextAuthUrl || 'NO DEFINIDO',
    });
    
    // Intentar obtener la sesión actual
    let session = null;
    let sessionError = null;
    
    try {
      session = await getServerSession(authOptions);
      console.log('✅ Sesión obtenida:', session ? 'ACTIVA' : 'NO ACTIVA');
    } catch (error) {
      sessionError = error;
      console.error('❌ Error obteniendo sesión:', error);
    }
    
    // Verificar configuración de authOptions
    const providersCount = authOptions.providers?.length || 0;
    const hasCallbacks = !!authOptions.callbacks;
    const hasPages = !!authOptions.pages;
    
    console.log('📋 Configuración de authOptions:', {
      providersCount,
      hasCallbacks,
      hasPages,
      sessionStrategy: authOptions.session?.strategy
    });
    
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        googleClientId: googleClientId ? `${googleClientId.substring(0, 10)}...` : null,
        googleClientSecret: !!googleClientSecret,
        nextAuthSecret: !!nextAuthSecret,
        nextAuthUrl,
        nodeEnv: process.env.NODE_ENV
      },
      authConfig: {
        providersCount,
        hasCallbacks,
        hasPages,
        sessionStrategy: authOptions.session?.strategy
      },
      session: session ? {
        hasUser: !!session.user,
        userEmail: session.user?.email,
        userRole: (session.user as any)?.role
      } : null,
      sessionError: sessionError ? {
        name: sessionError instanceof Error ? sessionError.name : 'Unknown',
        message: sessionError instanceof Error ? sessionError.message : 'Unknown error'
      } : null
    });
    
  } catch (error) {
    console.error('❌ Error en debug NextAuth:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}
