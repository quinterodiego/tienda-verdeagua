import { NextResponse } from 'next/server';
import { getColorsFromSheets } from '@/lib/colors-sheets';

// GET /api/colors - Obtener colores disponibles para el público
export async function GET() {
  try {
    const allColors = await getColorsFromSheets();
    
    // Filtrar solo los colores disponibles
    const availableColors = allColors.filter(color => color.disponible);
    
    return NextResponse.json({
      success: true,
      colors: availableColors
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error al obtener colores:', error);
    return NextResponse.json(
      { error: 'Error al obtener colores' },
      { status: 500 }
    );
  }
}
