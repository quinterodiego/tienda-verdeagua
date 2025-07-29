import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES, ensureSheetsExist } from './google-sheets';
import { Product } from '@/types';

// Función para obtener todos los productos desde Google Sheets
export async function getProductsFromSheets(): Promise<Product[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A2:P`, // Usar el mismo rango que admin (16 columnas)
    });

    const rows = response.data.values || [];
    
    const products: Product[] = rows.map((row) => {
      // Estructura actualizada para coincidir con admin-products-sheets:
      // A=id, B=name, C=description, D=price, E=originalPrice, F=category, G=subcategory, H=images, I=stock, etc.
      
      return {
        id: row[0] || '',
        name: row[1] || '',
        description: row[2] || '',
        price: parseFloat(row[3]) || 0,
        category: row[5] || '', // Columna F (índice 5)
        image: row[7] ? (() => {
          const imageField = row[7]; // Columna H (índice 7) - imágenes
          // Intentar con el nuevo separador '|' primero, luego con comas como fallback
          if (imageField.includes('|')) {
            return imageField.split('|')[0].trim();
          } else if (imageField.includes(',')) {
            return imageField.split(',')[0].trim();
          } else {
            return imageField.trim();
          }
        })() : '', // Tomar la primera imagen de la columna H
        stock: parseInt(row[8]) || 0, // Columna I (índice 8)
      };
    }).filter(product => product.id && product.name); // Filtrar productos vacíos

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
