import { NextRequest, NextResponse } from 'next/server';
import { getColorsFromSheets } from '@/lib/colors-sheets';
import { getMotivosFromSheets } from '@/lib/motivos-sheets';
import { getProductsFromSheets } from '@/lib/products-sheets';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log(`🔍 Buscando colores/motivos para producto: ${id}`);
    
    // Obtener el producto específico
    const productsData = await getProductsFromSheets(true); // Incluir inactivos para poder encontrar cualquier producto
    const product = productsData.find(p => p.id === id);
    
    console.log(`📋 Producto encontrado:`, product ? {
      id: product.id,
      name: product.name,
      colores: product.colores,
      motivos: product.motivos,
      hasColors: product.colores && product.colores.length > 0,
      hasMotivos: product.motivos && product.motivos.length > 0
    } : 'No encontrado');
    
    if (!product) {
      console.log(`❌ Producto ${id} no encontrado`);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    // Obtener todos los colores y motivos disponibles
    const [allColors, allMotivos] = await Promise.all([
      getColorsFromSheets(),
      getMotivosFromSheets()
    ]);
    
    console.log(`🎨 Total colores disponibles: ${allColors.length}`);
    console.log(`🎭 Total motivos disponibles: ${allMotivos.length}`);
    
    // Filtrar solo los colores y motivos específicos de este producto
    const productColors = product.colores && product.colores.length > 0
      ? allColors.filter(color => product.colores!.includes(color.nombre))
      : [];
      
    const productMotivos = product.motivos && product.motivos.length > 0
      ? allMotivos.filter(motivo => product.motivos!.includes(motivo.nombre))
      : [];
    
    console.log(`🎨 Colores filtrados para producto: ${productColors.length}`, productColors.map(c => c.nombre));
    console.log(`🎭 Motivos filtrados para producto: ${productMotivos.length}`, productMotivos.map(m => m.nombre));
    
    const result = {
      colors: productColors,
      motivos: productMotivos
    };
    
    console.log(`📤 Retornando:`, result);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/products/[id]/colors-motivos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
