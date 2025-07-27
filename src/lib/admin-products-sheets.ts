import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from './google-sheets';

// Interfaz para productos del admin (más completa)
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  isActive: boolean;
  sku: string;
  brand?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Función para obtener todos los productos para admin desde Google Sheets
export async function getAdminProductsFromSheets(): Promise<AdminProduct[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A2:P`, // Columnas ampliadas para admin
    });

    const rows = response.data.values || [];
    
    const products: AdminProduct[] = rows.map((row) => {
      // Ser más tolerante con datos faltantes - solo filtrar si faltan datos críticos
      if (!row[0] || !row[1]) { // Si no hay ID o nombre, omitir
        return null;
      }

      try {
        return {
          id: row[0] || '',
          name: row[1] || '',
          description: row[2] || '',
          price: parseFloat(row[3]) || 0,
          originalPrice: row[4] ? parseFloat(row[4]) : undefined,
          category: row[5] || '',
          subcategory: row[6] || '',
          images: row[7] ? row[7].split(',').map((img: string) => img.trim()) : [row[5] || ''], // Usar imagen básica si no hay imágenes avanzadas
          stock: parseInt(row[8]) || 0,
          isActive: row[9] ? (row[9] === 'true' || row[9] === 'TRUE') : true, // Por defecto activo si no se especifica
          sku: row[10] || `SKU-${row[0]}`, // Generar SKU si no existe
          brand: row[11] || '',
          tags: row[12] ? row[12].split(',').map((tag: string) => tag.trim()) : [],
          createdAt: row[13] || new Date().toISOString(),
          updatedAt: row[14] || new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error al parsear producto:', error, row);
        return null;
      }
    }).filter(product => product !== null) as AdminProduct[];

    return products;
  } catch (error) {
    console.error('Error al obtener productos de admin:', error);
    return [];
  }
}

// Función para agregar un producto desde el admin
export async function addAdminProductToSheets(product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Generar ID único
    const timestamp = Date.now();
    const productId = `PROD-${timestamp}`;
    
    const now = new Date().toISOString();
    
    const values = [[
      productId,
      product.name,
      product.description,
      product.price,
      product.originalPrice || '',
      product.category,
      product.subcategory || '',
      product.images.join(', '),
      product.stock,
      product.isActive,
      product.sku,
      product.brand || '',
      product.tags.join(', '),
      now, // createdAt
      now  // updatedAt
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A:P`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('Producto agregado exitosamente:', productId);
    return productId;
  } catch (error) {
    console.error('Error al agregar producto:', error);
    return null;
  }
}

// Función para actualizar un producto desde el admin
export async function updateAdminProductInSheets(productId: string, updates: Partial<AdminProduct>): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Primero obtener todos los productos para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A:P`,
    });

    const rows = response.data.values || [];
    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    
    // Encontrar la fila del producto
    const productRowIndex = dataRows.findIndex(row => row[0] === productId);
    
    if (productRowIndex === -1) {
      console.error('Producto no encontrado:', productId);
      return false;
    }

    // Obtener datos actuales del producto
    const currentRow = dataRows[productRowIndex];
    const currentProduct: AdminProduct = {
      id: currentRow[0] || '',
      name: currentRow[1] || '',
      description: currentRow[2] || '',
      price: parseFloat(currentRow[3]) || 0,
      originalPrice: currentRow[4] ? parseFloat(currentRow[4]) : undefined,
      category: currentRow[5] || '',
      subcategory: currentRow[6] || '',
      images: currentRow[7] ? currentRow[7].split(',').map((img: string) => img.trim()) : [],
      stock: parseInt(currentRow[8]) || 0,
      isActive: currentRow[9] === 'true' || currentRow[9] === 'TRUE',
      sku: currentRow[10] || '',
      brand: currentRow[11] || '',
      tags: currentRow[12] ? currentRow[12].split(',').map((tag: string) => tag.trim()) : [],
      createdAt: currentRow[13] || new Date().toISOString(),
      updatedAt: currentRow[14] || new Date().toISOString(),
    };

    // Aplicar actualizaciones
    const updatedProduct = { ...currentProduct, ...updates, updatedAt: new Date().toISOString() };
    
    // Preparar fila actualizada
    const updatedRow = [
      updatedProduct.id,
      updatedProduct.name,
      updatedProduct.description,
      updatedProduct.price,
      updatedProduct.originalPrice || '',
      updatedProduct.category,
      updatedProduct.subcategory || '',
      updatedProduct.images.join(', '),
      updatedProduct.stock,
      updatedProduct.isActive,
      updatedProduct.sku,
      updatedProduct.brand || '',
      updatedProduct.tags.join(', '),
      updatedProduct.createdAt,
      updatedProduct.updatedAt
    ];

    // Actualizar la fila (rowIndex + 2 porque Google Sheets es 1-indexed y saltamos headers)
    const range = `${SHEET_NAMES.PRODUCTS}!A${productRowIndex + 2}:P${productRowIndex + 2}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log('Producto actualizado exitosamente:', productId);
    return true;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return false;
  }
}

// Función para eliminar un producto (marcar como inactivo)
export async function deleteAdminProductFromSheets(productId: string): Promise<boolean> {
  try {
    // En lugar de eliminar, marcamos como inactivo
    return await updateAdminProductInSheets(productId, { 
      isActive: false, 
      updatedAt: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return false;
  }
}

// Función para migrar productos del admin-store a Google Sheets
export async function migrateAdminProductsToSheets(): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Verificar si ya hay productos en la hoja
    const existingProducts = await getAdminProductsFromSheets();
    if (existingProducts.length > 0) {
      console.log('Ya hay productos en Google Sheets, saltando migración');
      return true;
    }

    // Crear encabezados si no existen
    const headerValues = [[
      'ID',
      'Nombre',
      'Descripción', 
      'Precio',
      'Precio Original',
      'Categoría',
      'Subcategoría',
      'Imágenes',
      'Stock',
      'Activo',
      'SKU',
      'Marca',
      'Etiquetas',
      'Fecha Creación',
      'Fecha Actualización'
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A1:P1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: headerValues,
      },
    });

    console.log('Encabezados de productos de admin configurados exitosamente');
    return true;
  } catch (error) {
    console.error('Error al migrar productos de admin:', error);
    return false;
  }
}
