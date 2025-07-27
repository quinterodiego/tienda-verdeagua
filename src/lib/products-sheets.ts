import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES, ensureSheetsExist } from './google-sheets';
import { Product } from '@/types';

// Función para obtener todos los productos desde Google Sheets
export async function getProductsFromSheets(): Promise<Product[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A2:I`, // Desde la fila 2 (sin encabezados)
    });

    const rows = response.data.values || [];
    
    const products: Product[] = rows.map((row) => ({
      id: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      price: parseFloat(row[3]) || 0,
      category: row[4] || '',
      image: row[5] ? row[5].split(',')[0].trim() : '', // Tomar la primera imagen
      stock: parseInt(row[6]) || 0,
      rating: parseFloat(row[7]) || undefined,
    }));

    return products;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
}

// Función para agregar un producto a Google Sheets
export async function addProductToSheets(product: Omit<Product, 'id'>): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener el último ID para generar uno nuevo
    const existingProducts = await getProductsFromSheets();
    const newId = existingProducts.length > 0 
      ? (Math.max(...existingProducts.map(p => parseInt(p.id))) + 1).toString()
      : '1';

    const values = [[
      newId,
      product.name,
      product.description,
      product.price,
      product.category,
      product.image,
      product.stock,
      product.rating || '',
      new Date().toISOString(),
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return true;
  } catch (error) {
    console.error('Error al agregar producto:', error);
    return false;
  }
}

// Función para actualizar stock de un producto
export async function updateProductStock(productId: string, newStock: number): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Primero encontrar la fila del producto
    const products = await getProductsFromSheets();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      throw new Error('Producto no encontrado');
    }

    // La fila en la hoja (considerando que fila 1 son encabezados)
    const rowNumber = productIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!G${rowNumber}`, // Columna G es stock
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStock]],
      },
    });

    return true;
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    return false;
  }
}

// Función para migrar productos existentes a Google Sheets
export async function migrateProductsToSheets(products: Product[]): Promise<boolean> {
  try {
    // Primero asegurar que las pestañas existan
    const sheetsCreated = await ensureSheetsExist();
    if (!sheetsCreated) {
      throw new Error('No se pudieron crear las pestañas');
    }

    const sheets = await getGoogleSheetsAuth();

    // Preparar los datos
    const values = [
      // Encabezados
      ['ID', 'Nombre', 'Descripción', 'Precio', 'Categoría', 'Imagen', 'Stock', 'Rating', 'Fecha Creación'],
      // Datos de productos
      ...products.map(product => [
        product.id,
        product.name,
        product.description,
        product.price,
        product.category,
        product.image,
        product.stock,
        product.rating || '',
        new Date().toISOString(),
      ])
    ];

    // Limpiar la hoja primero
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A:I`,
    });

    // Agregar los datos
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A1:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return true;
  } catch (error) {
    console.error('Error al migrar productos:', error);
    return false;
  }
}
