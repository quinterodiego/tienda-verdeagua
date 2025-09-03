import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromSheets } from '@/lib/products-sheets';
import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Probando filtrado de productos');
    
    // Obtener datos RAW de Google Sheets
    const sheets = await getGoogleSheetsAuth();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A1:P`, // Incluir encabezados (fila 1)
    });
    
    const rows = response.data.values || [];
    console.log('📊 DEBUG: Datos RAW de Google Sheets:', rows);
    
    // Obtener TODOS los productos (como admin)
    const allProducts = await getProductsFromSheets(true);
    console.log(`📊 DEBUG: Total productos en Google Sheets: ${allProducts.length}`);
    
    // Obtener solo productos activos (como usuario público)
    const activeProducts = await getProductsFromSheets(false);
    console.log(`🔒 DEBUG: Solo productos activos: ${activeProducts.length}`);
    
    // Analizar los estados
    const allProductsStatus: Record<string, number> = {};
    allProducts.forEach(p => {
      const status = p.status || 'no-status';
      allProductsStatus[status] = (allProductsStatus[status] || 0) + 1;
    });
    
    const activeProductsStatus: Record<string, number> = {};
    activeProducts.forEach(p => {
      const status = p.status || 'no-status';
      activeProductsStatus[status] = (activeProductsStatus[status] || 0) + 1;
    });
    
    return NextResponse.json({
      debug: true,
      timestamp: new Date().toISOString(),
      rawData: {
        headers: rows[0] || [],
        rows: rows.slice(1),
        totalRows: rows.length
      },
      allProducts: {
        count: allProducts.length,
        statusBreakdown: allProductsStatus,
        products: allProducts.map(p => ({ id: p.id, name: p.name, status: p.status }))
      },
      activeProducts: {
        count: activeProducts.length,
        statusBreakdown: activeProductsStatus,
        products: activeProducts.map(p => ({ id: p.id, name: p.name, status: p.status }))
      },
      filteringWorking: activeProducts.every(p => p.status === 'active')
    });

  } catch (error) {
    console.error('❌ DEBUG: Error:', error);
    return NextResponse.json({
      error: 'Error en debug',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
