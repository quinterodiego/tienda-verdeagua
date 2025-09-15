import { NextResponse } from 'next/server';
import { getMotivosFromSheets } from '@/lib/motivos-sheets';

// GET /api/motivos - Obtener motivos disponibles para el público
export async function GET() {
  try {
    const allMotivos = await getMotivosFromSheets();
    
    // Filtrar solo los motivos disponibles
    const availableMotivos = allMotivos.filter(motivo => motivo.disponible);
    
    return NextResponse.json({
      success: true,
      motivos: availableMotivos
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error al obtener motivos:', error);
    return NextResponse.json(
      { error: 'Error al obtener motivos' },
      { status: 500 }
    );
  }
}
