import { NextRequest, NextResponse } from 'next/server';
import { verifyDebugAdminAccess } from '@/lib/debug-admin-helper';
import { sheetsCache } from '@/lib/sheets-cache';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Debug: Solicitud de limpieza de cache iniciada');
    
    // Verificar acceso de debug
    const hasDebugAccess = await verifyDebugAdminAccess(request);
    if (!hasDebugAccess) {
      return NextResponse.json(
        { error: 'Acceso denegado para debug' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { pattern } = body;

    if (pattern) {
      sheetsCache.invalidateByPattern(pattern);
      console.log(`🧹 Cache invalidado para patrón: ${pattern}`);
    } else {
      sheetsCache.clear();
      console.log('🧹 Todo el cache limpiado');
    }

    return NextResponse.json({
      success: true,
      message: pattern 
        ? `Cache invalidado para patrón: ${pattern}`
        : 'Todo el cache ha sido limpiado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error al limpiar cache:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar acceso de debug
    const hasDebugAccess = await verifyDebugAdminAccess(request);
    if (!hasDebugAccess) {
      return NextResponse.json(
        { error: 'Acceso denegado para debug' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      endpoint: '/api/debug/clear-cache',
      description: 'Limpia el cache de Google Sheets para debugging',
      methods: {
        POST: {
          description: 'Limpia todo el cache o por patrón',
          body: {
            pattern: 'string (opcional) - Patrón para limpiar cache específico'
          },
          examples: [
            'POST {} - Limpia todo el cache',
            'POST {"pattern": "user:*"} - Limpia cache de usuarios',
            'POST {"pattern": "admin:*"} - Limpia cache de administradores'
          ]
        }
      }
    });
  } catch (error) {
    console.error('❌ Error en GET de clear-cache:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
