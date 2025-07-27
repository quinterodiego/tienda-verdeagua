import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromSheets } from '@/lib/products-sheets';

export async function GET() {
  try {
    const products = await getProductsFromSheets();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Aquí podrías agregar lógica para crear nuevos productos
    return NextResponse.json(
      { error: 'Método no implementado' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
