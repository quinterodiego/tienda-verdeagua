import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Diagnosticando sistema de productos...');
    
    // 1. Verificar Google Sheets directamente
    let sheetsResult = null;
    let sheetsError = null;
    try {
      const { getProductsFromSheets } = await import('@/lib/products-sheets');
      sheetsResult = await getProductsFromSheets(false); // Solo productos activos
      console.log(`📊 Google Sheets directo: ${sheetsResult.length} productos`);
    } catch (error) {
      sheetsError = error instanceof Error ? error.message : 'Error desconocido';
      console.log(`❌ Error en Google Sheets: ${sheetsError}`);
    }
    
    // 2. Verificar función con fallback
    let fallbackResult = null;
    let fallbackError = null;
    try {
      const { getProductsWithFallback } = await import('@/lib/products-fallback');
      fallbackResult = await getProductsWithFallback(false);
      console.log(`📊 Con fallback: ${fallbackResult.length} productos`);
    } catch (error) {
      fallbackError = error instanceof Error ? error.message : 'Error desconocido';
      console.log(`❌ Error en fallback: ${fallbackError}`);
    }
    
    // 3. Verificar productos estáticos
    const { products: staticProducts } = await import('@/data/products');
    const activeStaticProducts = staticProducts.filter(p => !p.status || p.status === 'active');
    
    return NextResponse.json({
      diagnosis: {
        timestamp: new Date().toISOString(),
        googleSheets: {
          success: sheetsResult !== null,
          productsCount: sheetsResult?.length || 0,
          error: sheetsError,
          products: sheetsResult?.map(p => ({ id: p.id, name: p.name, status: p.status })) || []
        },
        fallbackSystem: {
          success: fallbackResult !== null,
          productsCount: fallbackResult?.length || 0,
          error: fallbackError,
          usingStatic: fallbackResult?.some(p => staticProducts.find(sp => sp.id === p.id)) || false,
          products: fallbackResult?.map(p => ({ id: p.id, name: p.name, status: p.status })) || []
        },
        staticProducts: {
          totalCount: staticProducts.length,
          activeCount: activeStaticProducts.length,
          products: activeStaticProducts.map(p => ({ id: p.id, name: p.name, status: p.status || 'active' }))
        }
      },
      recommendation: sheetsResult?.length === 0 
        ? "✅ Google Sheets está vacío - debería mostrar 'No hay productos disponibles'"
        : sheetsResult && sheetsResult.length > 0
        ? "⚠️ Google Sheets tiene productos - verificar por qué no aparecen en la web"
        : "❌ Error en Google Sheets - verificar configuración"
    });
    
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    return NextResponse.json({
      error: 'Error al diagnosticar sistema de productos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
