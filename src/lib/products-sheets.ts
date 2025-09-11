import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES, ensureSheetsExist } from './google-sheets';
import { Product, ProductStatus } from '@/types';

// Función para obtener todos los productos desde Google Sheets
export async function getProductsFromSheets(includeInactive: boolean = false): Promise<Product[]> {
  try {
    // Verificar que tenemos las variables de entorno necesarias
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID no está configurado');
    }

    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A2:Q`, // Ampliado hasta columna Q para incluir Medidas y Color
    });

    const rows = response.data.values || [];
    
    // Si no hay filas, retornar array vacío
    if (rows.length === 0) {
      console.log('📋 No hay productos en Google Sheets, retornando array vacío');
      return [];
    }

    const productsData = rows.map((row, index) => {
      try {
        // Estructura actualizada para coincidir con admin-products-sheets:
        // A=id, B=name, C=description, D=price, E=originalPrice, F=category, G=subcategory, H=images, I=stock, J=brand, K=tags, L=status, M=rating, N=reviews, O=createdAt, P=medidas, Q=color
        
        // DETECTAR LA COLUMNA DE ESTADO - columna 'Activo' en índice 9
        let productStatus: ProductStatus = 'active';
        
        const activoValue = row[9]; // Columna J (índice 9) - "Activo"
        console.log(`🔍 Producto ${row[1]} - Columna Activo (índice 9): '${activoValue}' (tipo: ${typeof activoValue})`);
        
        if (activoValue !== undefined && activoValue !== '') {
          // Convertir string a boolean y luego a status
          if (activoValue === 'TRUE' || activoValue === 'true' || activoValue === true) {
            productStatus = 'active';
            console.log(`✅ ${row[1]} -> ACTIVO (TRUE)`);
          } else if (activoValue === 'FALSE' || activoValue === 'false' || activoValue === false) {
            productStatus = 'inactive';
            console.log(`❌ ${row[1]} -> INACTIVO (FALSE)`);
          } else {
            // Fallback: si no es TRUE/FALSE, asumir activo
            productStatus = 'active';
            console.log(`⚠️ ${row[1]} -> ACTIVO por defecto (valor: '${activoValue}')`);
          }
        } else {
          console.log(`⚠️ ${row[1]} -> ACTIVO por defecto (valor vacío)`);
        }
        
        const product: Product = {
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
          // Agregar array completo de imágenes
          images: row[7] ? (() => {
            const imageField = row[7]; // Columna H (índice 7) - imágenes
            if (imageField.includes('|')) {
              return imageField.split('|').map((img: string) => img.trim()).filter((img: string) => img);
            } else if (imageField.includes(',')) {
              return imageField.split(',').map((img: string) => img.trim()).filter((img: string) => img);
            } else {
              return [imageField.trim()].filter((img: string) => img);
            }
          })() : [],
          stock: parseInt(row[8]) || 0, // Columna I (índice 8)
          status: productStatus, // Estado detectado automáticamente
          rating: parseFloat(row[12]) || undefined, // Columna M (índice 12) - rating si existe
          reviews: parseInt(row[13]) || undefined, // Columna N (índice 13) - reviews si existe
          medidas: row[15] || undefined, // Columna P (índice 15) - Medidas
          color: row[16] || undefined, // Columna Q (índice 16) - Color
          createdAt: row[14] || '', // Columna O (índice 14)
          updatedAt: '', // No hay columna updatedAt en esta estructura
        };

        return product;
      } catch (rowError) {
        console.error(`Error al procesar fila ${index + 2}:`, rowError);
        return null;
      }
    }).filter((product): product is Product => product !== null && Boolean(product.id) && Boolean(product.name)); // Filtrar productos vacíos

    console.log(`📊 getProductsFromSheets - Total productos procesados: ${productsData.length}`);
    console.log(`⚙️ getProductsFromSheets - includeInactive: ${includeInactive}`);
    
    // FILTRADO CONDICIONAL: Si includeInactive es false, filtrar solo productos activos
    if (!includeInactive) {
      const activeProducts = productsData.filter(product => product.status === 'active');
      console.log(`🔒 getProductsFromSheets - Filtrando para usuarios públicos: ${productsData.length} -> ${activeProducts.length} productos activos`);
      
      // Log de productos filtrados
      const filteredOut = productsData.filter(product => product.status !== 'active');
      if (filteredOut.length > 0) {
        console.log(`🚫 getProductsFromSheets - Productos filtrados:`, filteredOut.map(p => ({ id: p.id, name: p.name, status: p.status })));
      }
      
      return activeProducts;
    }

    console.log(`👑 getProductsFromSheets - Retornando todos los productos para admin: ${productsData.length}`);
    return productsData;
  } catch (error) {
    console.error('Error al obtener productos desde Google Sheets:', error);
    // En lugar de retornar array vacío, lanzar el error para que el caller pueda manejar el fallback
    throw error;
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
    const products = await getProductsFromSheets(true); // Incluir inactivos para encontrar el producto
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      throw new Error('Producto no encontrado');
    }

    // La fila en la hoja (considerando que fila 1 son encabezados)
    const rowNumber = productIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!I${rowNumber}`, // Columna I es stock
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

// Función para actualizar el estado de un producto
export async function updateProductStatus(productId: string, newStatus: ProductStatus): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener todos los productos actuales
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A2:P`,
    });

    const rows = response.data.values || [];
    const productIndex = rows.findIndex(row => row[0] === productId);
    
    if (productIndex === -1) {
      console.error(`Producto ${productId} no encontrado`);
      return false;
    }

    // La fila en la hoja (considerando que fila 1 son encabezados)
    const rowNumber = productIndex + 2;

    // Actualizar estado (columna L - índice 11)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!L${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus]],
      },
    });

    // También actualizar fecha de modificación (columna P - índice 15)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!P${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString()]],
      },
    });

    console.log(`✅ Estado del producto ${productId} actualizado a: ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error al actualizar estado del producto:', error);
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

// Función para decrementar el stock de múltiples productos (para cuando se hace un pedido)
export async function decrementProductsStock(items: Array<{ productId: string; quantity: number }>): Promise<boolean> {
  try {
    console.log('🔄 INICIANDO DECREMENTO DE STOCK...');
    console.log('📋 Items recibidos para decrementar:', JSON.stringify(items, null, 2));
    
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener todos los productos actuales
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.PRODUCTS}!A2:P`,
    });

    const rows = response.data.values || [];
    console.log(`📊 Total de productos en sheet: ${rows.length}`);
    
    // Verificar que hay suficiente stock antes de hacer cambios
    for (const item of items) {
      const productIndex = rows.findIndex(row => row[0] === item.productId);
      
      if (productIndex === -1) {
        console.error(`❌ Producto ${item.productId} no encontrado en la hoja de productos`);
        return false;
      }
      
      const currentStock = parseInt(rows[productIndex][8]) || 0; // Columna I (índice 8) es stock
      const productName = rows[productIndex][1] || 'Producto sin nombre';
      
      console.log(`📦 Verificando ${productName}: Stock actual=${currentStock}, Cantidad pedida=${item.quantity}`);
      
      if (currentStock < item.quantity) {
        console.error(`❌ STOCK INSUFICIENTE para producto ${productName}. Stock actual: ${currentStock}, cantidad solicitada: ${item.quantity}`);
        return false;
      }
    }

    console.log('✅ Verificación de stock completada. Procediendo a actualizar...');

    // Si todo está bien, actualizar el stock
    for (const item of items) {
      const productIndex = rows.findIndex(row => row[0] === item.productId);
      
      if (productIndex !== -1) {
        const currentStock = parseInt(rows[productIndex][8]) || 0;
        const newStock = currentStock - item.quantity;
        const productName = rows[productIndex][1] || 'Producto sin nombre';
        
        console.log(`🔄 Actualizando ${productName}: ${currentStock} - ${item.quantity} = ${newStock}`);
        
        // La fila en la hoja (considerando que fila 1 son encabezados)
        const rowNumber = productIndex + 2;

        // Actualizar stock (columna I)
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAMES.PRODUCTS}!I${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[newStock]],
          },
        });
        
        console.log(`✅ Producto ${productName}: ${currentStock} → ${newStock} (vendidos: ${item.quantity})`);
      } else {
        console.error(`❌ No se pudo encontrar producto ${item.productId} para actualizar`);
      }
    }

    console.log('🎉 STOCK ACTUALIZADO CORRECTAMENTE PARA TODOS LOS PRODUCTOS');
    return true;
  } catch (error) {
    console.error('Error al decrementar stock de productos:', error);
    return false;
  }
}
