import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesFromSheets } from '../../../lib/categories-sheets';

export async function GET() {
  try {
    const categories = await getCategoriesFromSheets();
    return NextResponse.json({ 
      success: true,
      categories: categories 
    });
  } catch (error) {
    console.error('Error en GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}
