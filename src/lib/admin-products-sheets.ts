import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from './google-sheets';
import { deleteImageByUrl } from './cloudinary';

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
          images: row[7] ? (() => {
            const imageField = row[7];
            // Intentar con el nuevo separador '|' primero, luego con comas como fallback
            if (imageField.includes('|')) {
              return imageField.split('|').map((img: string) => img.trim());
            } else if (imageField.includes(',')) {
              return imageField.split(',').map((img: string) => img.trim());
            } else {
              return [imageField.trim()];
            }
          })() : [row[5] || ''], // Usar imagen básica si no hay imágenes avanzadas
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
      product.images.join(' | '),
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
    console.log('🔄 Iniciando actualización de producto:', { productId, updates });
    
    const sheets = await getGoogleSheetsAuth();
    
    // Primero obtener todos los productos para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A:P`,
    });

    const rows = response.data.values || [];
    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    
    console.log(`📊 Total de filas de productos: ${dataRows.length}`);
    
    // Encontrar la fila del producto
    const productRowIndex = dataRows.findIndex(row => row[0] === productId);
    
    if (productRowIndex === -1) {
      console.error(`❌ Producto con ID ${productId} no encontrado en ${dataRows.length} filas`);
      console.log('🔍 IDs disponibles:', dataRows.slice(0, 5).map(row => row[0])); // Mostrar primeros 5 IDs
      return false;
    }

    console.log(`✅ Producto encontrado en la fila ${productRowIndex + 2} (Google Sheets)`);

    // Obtener datos actuales del producto
    const currentRow = dataRows[productRowIndex];
    console.log('📋 Datos actuales del producto:', currentRow.slice(0, 5)); // Mostrar primeros 5 campos
    
    const currentProduct: AdminProduct = {
      id: currentRow[0] || '',
      name: currentRow[1] || '',
      description: currentRow[2] || '',
      price: parseFloat(currentRow[3]) || 0,
      originalPrice: currentRow[4] ? parseFloat(currentRow[4]) : undefined,
      category: currentRow[5] || '',
      subcategory: currentRow[6] || '',
      images: currentRow[7] ? (() => {
        const imageField = currentRow[7];
        // Intentar con el nuevo separador '|' primero, luego con comas como fallback
        if (imageField.includes('|')) {
          return imageField.split('|').map((img: string) => img.trim());
        } else if (imageField.includes(',')) {
          return imageField.split(',').map((img: string) => img.trim());
        } else {
          return [imageField.trim()];
        }
      })() : [],
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
    console.log('📝 Datos después de aplicar updates:', {
      name: updatedProduct.name,
      price: updatedProduct.price,
      category: updatedProduct.category
    });
    
    // Preparar fila actualizada
    const updatedRow = [
      updatedProduct.id,
      updatedProduct.name,
      updatedProduct.description,
      updatedProduct.price,
      updatedProduct.originalPrice || '',
      updatedProduct.category,
      updatedProduct.subcategory || '',
      updatedProduct.images.join(' | '),
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
    console.log(`🎯 Actualizando en rango: ${range}`);
    console.log('📊 Fila actualizada:', updatedRow.slice(0, 5)); // Mostrar primeros 5 campos
    
    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log('✅ Producto actualizado exitosamente en Google Sheets:', productId);
    console.log('📊 Respuesta de Google Sheets:', updateResponse.data);
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    if (error instanceof Error) {
      console.error('❌ Detalles del error:', error.message);
    }
    return false;
  }
}

// Función para eliminar un producto (marcar como inactivo)
export async function deleteAdminProductFromSheets(productId: string, deleteImages: boolean = false): Promise<boolean> {
  try {
    // Si se solicita eliminar imágenes, hacerlo antes del soft delete
    if (deleteImages) {
      console.log('🖼️ Eliminando imágenes para soft delete del producto:', productId);
      
      // Obtener el producto para acceder a sus imágenes
      const products = await getAdminProductsFromSheets();
      const product = products.find(p => p.id === productId);
      
      if (product && product.images && product.images.length > 0) {
        const imageDeletePromises = product.images.map(async (imageUrl: string) => {
          if (imageUrl && imageUrl.includes('cloudinary.com')) {
            console.log('🗑️ Soft delete - Eliminando imagen:', imageUrl);
            const success = await deleteImageByUrl(imageUrl);
            if (success) {
              console.log('✅ Imagen eliminada de Cloudinary (soft delete):', imageUrl);
            } else {
              console.warn('⚠️ No se pudo eliminar imagen de Cloudinary (soft delete):', imageUrl);
            }
            return success;
          }
          return true;
        });

        await Promise.all(imageDeletePromises);
      }
    }

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

// Función para obtener el ID de la hoja de productos
async function getProductsSheetId(): Promise<number> {
  try {
    const sheets = await getGoogleSheetsAuth();
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === SHEET_NAMES.PRODUCTS
    );

    if (!sheet || sheet.properties?.sheetId === undefined || sheet.properties.sheetId === null) {
      throw new Error('No se pudo encontrar la hoja de Productos');
    }

    return sheet.properties.sheetId;
  } catch (error) {
    console.error('Error al obtener ID de la hoja:', error);
    throw error;
  }
}

// Función para eliminar un producto DEFINITIVAMENTE (hard delete)
export async function permanentlyDeleteAdminProductFromSheets(productId: string): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando producto DEFINITIVAMENTE:', productId);
    
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener todos los productos para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A2:P`,
    });

    const rows = response.data.values || [];
    const productRowIndex = rows.findIndex(row => row[0] === productId);
    
    if (productRowIndex === -1) {
      console.error('Producto no encontrado para eliminar:', productId);
      return false;
    }

    // Obtener los datos del producto antes de eliminarlo
    const productRow = rows[productRowIndex];
    const productData = {
      id: productRow[0] || '',
      name: productRow[1] || '',
      description: productRow[2] || '',
      price: parseFloat(productRow[3]) || 0,
      originalPrice: productRow[4] ? parseFloat(productRow[4]) : null,
      category: productRow[5] || '',
      subcategory: productRow[6] || '',
      images: productRow[7] ? productRow[7].split(',').map((url: string) => url.trim()) : [],
      features: productRow[8] ? productRow[8].split(',') : [],
      stock: parseInt(productRow[9]) || 0,
      rating: parseFloat(productRow[10]) || 0,
      reviewCount: parseInt(productRow[11]) || 0,
      isActive: productRow[12] === 'TRUE',
      isFeatured: productRow[13] === 'TRUE',
      createdAt: productRow[14] || '',
      updatedAt: productRow[15] || ''
    };

    console.log('📦 Datos del producto a eliminar:', {
      id: productData.id,
      name: productData.name,
      images: productData.images
    });

    // Eliminar imágenes de Cloudinary primero
    if (productData.images && productData.images.length > 0) {
      console.log('🖼️ Eliminando imágenes de Cloudinary...');
      
      const imageDeletePromises = productData.images.map(async (imageUrl: string) => {
        if (imageUrl && imageUrl.includes('cloudinary.com')) {
          console.log('🗑️ Eliminando imagen:', imageUrl);
          const success = await deleteImageByUrl(imageUrl);
          if (success) {
            console.log('✅ Imagen eliminada de Cloudinary:', imageUrl);
          } else {
            console.warn('⚠️ No se pudo eliminar imagen de Cloudinary:', imageUrl);
          }
          return success;
        }
        return true; // No es una imagen de Cloudinary, continúa
      });

      const imageResults = await Promise.all(imageDeletePromises);
      const successfulDeletes = imageResults.filter(result => result).length;
      const cloudinaryImages = productData.images.filter((url: string) => url.includes('cloudinary.com')).length;
      
      console.log(`📊 Imágenes eliminadas: ${successfulDeletes}/${cloudinaryImages} de Cloudinary`);
    }

    // Obtener el ID real de la hoja
    const sheetId = await getProductsSheetId();
    console.log('📋 ID de la hoja de productos:', sheetId);
    console.log('📍 Índice de la fila a eliminar:', productRowIndex + 2); // +2 porque empezamos desde A2

    // Eliminar la fila físicamente
    const deleteRequest = {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: productRowIndex + 1, // +1 porque A2 es índice 1 (A1 son headers)
            endIndex: productRowIndex + 2, // +2 para eliminar solo esta fila
          },
        },
      }],
    };

    console.log('🔄 Ejecutando eliminación con request:', JSON.stringify(deleteRequest, null, 2));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: deleteRequest,
    });

    console.log('✅ Producto eliminado DEFINITIVAMENTE de Google Sheets:', productId);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar producto definitivamente:', error);
    console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
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
