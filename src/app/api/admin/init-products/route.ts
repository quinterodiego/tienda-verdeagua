import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductsFromSheets } from '@/lib/products-sheets';
import { products } from '@/data/products';
import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from '@/lib/google-sheets';

// GET /api/admin/init-products - Inicializar productos en Google Sheets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si ya hay productos en Google Sheets
    const existingProducts = await getProductsFromSheets();
    
    if (existingProducts.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Los productos ya están inicializados',
        count: existingProducts.length,
        products: existingProducts
      });
    }

    // Si no hay productos, inicializarlos
    const sheets = await getGoogleSheetsAuth();

    // Encabezados para la hoja de productos
    const headers = [
      'ID', 'Nombre', 'Descripción', 'Precio', 'Precio Original', 'Categoría', 
      'Subcategoría', 'Imágenes', 'Stock', 'Brand', 'Tags', 'Estado', 
      'SKU', 'Weight', 'Fecha Creación', 'Fecha Actualización'
    ];

    // Convertir productos a filas para Google Sheets
    const rows = products.map(product => [
      product.id,
      product.name,
      product.description,
      product.price,
      product.price, // Precio original igual al precio actual
      product.category,
      '', // Subcategoría vacía
      product.image, // Una sola imagen por ahora
      product.stock || 50, // Stock por defecto
      '', // Brand vacía
      '', // Tags vacías
      'active', // Estado activo
      `SKU-${product.id}`, // SKU generado
      '', // Weight vacío
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    // Limpiar la hoja primero y agregar encabezados + datos
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A:P`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A1:P${rows.length + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Productos inicializados correctamente',
      count: products.length,
      initialized: products.map(p => ({ id: p.id, name: p.name, stock: p.stock || 50 }))
    });

  } catch (error) {
    console.error('Error al inicializar productos:', error);
    return NextResponse.json(
      { error: 'Error al inicializar productos' },
      { status: 500 }
    );
  }
}

// POST /api/admin/init-products - Forzar reinicialización de productos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { force = false } = body;

    if (!force) {
      return NextResponse.json({ error: 'Usa force: true para reinicializar' }, { status: 400 });
    }

    // Forzar reinicialización
    const sheets = await getGoogleSheetsAuth();

    const headers = [
      'ID', 'Nombre', 'Descripción', 'Precio', 'Precio Original', 'Categoría', 
      'Subcategoría', 'Imágenes', 'Stock', 'Brand', 'Tags', 'Estado', 
      'SKU', 'Weight', 'Fecha Creación', 'Fecha Actualización'
    ];

    const rows = products.map(product => [
      product.id,
      product.name,
      product.description,
      product.price,
      product.price,
      product.category,
      '',
      product.image,
      product.stock || 50,
      '',
      '',
      'active',
      `SKU-${product.id}`,
      '',
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A:P`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A1:P${rows.length + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Productos reinicializados correctamente',
      count: products.length
    });

  } catch (error) {
    console.error('Error al reinicializar productos:', error);
    return NextResponse.json(
      { error: 'Error al reinicializar productos' },
      { status: 500 }
    );
  }
}
