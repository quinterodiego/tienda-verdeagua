import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { sheetsCache } from '@/lib/sheets-cache';

// Endpoint para limpiar caché (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { pattern } = body;

    if (pattern) {
      sheetsCache.invalidateByPattern(pattern);
      console.log(`🧹 Caché invalidado para patrón: ${pattern}`);
    } else {
      sheetsCache.clear();
      console.log('🧹 Todo el caché limpiado');
    }

    return NextResponse.json({
      success: true,
      message: pattern 
        ? `Caché invalidado para patrón: ${pattern}`
        : 'Todo el caché ha sido limpiado'
    });
  } catch (error) {
    console.error('❌ Error al limpiar caché:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
