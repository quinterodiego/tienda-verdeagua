import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from './google-sheets';
import { Order, Customer, CartItem } from '@/types';
import { decrementProductsStock, getProductsFromSheets } from './products-sheets';

// Función para obtener la imagen de un producto por su ID
async function getProductImageById(productId: string): Promise<string> {
  try {
    const products = await getProductsFromSheets(true); // Incluir inactivos para encontrar el producto
    const product = products.find(p => p.id === productId);
    return product?.image || '';
  } catch (error) {
    console.error(`Error al obtener imagen del producto ${productId}:`, error);
    return '';
  }
}

// Función para guardar un pedido en Google Sheets
export async function saveOrderToSheets(order: Omit<Order, 'id'>): Promise<string | null> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Generar ID único para el pedido
    const orderId = `ORD-${Date.now()}`;
    
    // Validar que los items tengan la estructura correcta
    order.items.forEach((item, index) => {
      if (!item.product) {
        throw new Error(`Item sin producto en índice ${index}`);
      }
    });
    
    const itemsJson = JSON.stringify(order.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    })));

    // Convertir dirección de envío a string
    const shippingAddressStr = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.zipCode}, ${order.shippingAddress.phone}`;

    const values = [[
      orderId,
      order.customer.email,
      order.customer.name,
      order.total,
      order.status,
      itemsJson,
      shippingAddressStr,
      order.paymentId || '',
      order.paymentStatus || 'pending',
      new Date().toISOString(),
      order.paymentMethod || 'Pago al retirar',
    ]];

    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A:K`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    // ✨ Decrementar stock de productos cuando se confirma un pedido
    if (order.status === 'confirmed' || order.status === 'pending') {
      const stockItems = order.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      
      await decrementProductsStock(stockItems);
    }

    return orderId;
  } catch (error) {
    console.error('❌ Error al guardar pedido:', error);
    return null;
  }
}

// Función para obtener pedidos de un usuario
export async function getUserOrdersFromSheets(userEmail: string): Promise<Order[]> {
  try {
    // Verificar configuración de Google Sheets
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_CLIENT_EMAIL) {
      console.log('⚠️ MODO DEBUG: Google Sheets no configurado, devolviendo array vacío');
      return [];
    }

    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A2:L`, // Expandido a L para incluir tracking number
    });

    const rows = response.data.values || [];
    
    // Obtener todos los productos una sola vez para optimizar
    const allProducts = await getProductsFromSheets(true);
    console.log('🔍 Productos disponibles para buscar imágenes:', allProducts.length);
    
    // Filtrar pedidos del usuario y convertir a objetos Order
    const userOrders: Order[] = rows
      .filter(row => row[1] === userEmail) // Columna B es email
      .map(row => {
        try {
          const items = JSON.parse(row[5] || '[]');
          console.log('🔍 Items recuperados para pedido usuario', row[0], ':', items);
          
          // Parsear dirección de envío
          const addressParts = (row[6] || '').split(', ');
          const [fullName = '', address = '', city = '', state = '', zipCode = '', phone = ''] = addressParts;
          const [firstName = '', ...lastNameParts] = fullName.split(' ');
          const lastName = lastNameParts.join(' ');
          
          return {
            id: row[0] || '',
            customer: {
              id: userEmail,
              name: row[2] || '',
              email: row[1] || '',
            } as Customer,
            items: items.map((item: any) => {
              // Buscar la imagen actual del producto
              const currentProduct = allProducts.find(p => p.id === item.productId);
              const productImage = currentProduct?.image || '';
              
              console.log('🔍 Procesando item para usuario:', {
                productId: item.productId,
                productName: item.productName,
                imageFromProduct: productImage,
                productFound: !!currentProduct
              });
              
              return {
                product: {
                  id: item.productId,
                  name: item.productName,
                  price: item.price,
                  image: productImage, // Imagen obtenida dinámicamente
                  description: '',
                  category: '',
                  stock: 0,
                },
                quantity: item.quantity,
              };
            }) as CartItem[],
            total: parseFloat(row[3]) || 0,
            status: row[4] as Order['status'] || 'pending',
            createdAt: new Date(row[9] || Date.now()),
            updatedAt: new Date(row[9] || Date.now()),
            paymentId: row[7] || undefined,
            paymentStatus: row[8] as Order['paymentStatus'] || 'pending',
            paymentMethod: row[10] as Order['paymentMethod'] || 'mercadopago',
            trackingNumber: row[11] || undefined, // Nueva columna para tracking number
            shippingAddress: {
              firstName: firstName,
              lastName: lastName,
              address: address,
              city: city,
              state: state,
              zipCode: zipCode,
              phone: phone,
            },
          };
        } catch (error) {
          console.error('Error al parsear pedido:', error);
          return null;
        }
      })
      .filter(order => order !== null) as Order[];

    return userOrders;
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    return [];
  }
}

// Función para actualizar el estado de un pedido
export async function updateOrderStatus(
  orderId: string, 
  status: Order['status'], 
  paymentId?: string, 
  paymentType?: string,
  sendEmail: boolean = true
): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Primero encontrar la fila del pedido
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A2:K`, // Cambiado de A2:J a A2:K
    });

    const rows = response.data.values || [];
    const orderIndex = rows.findIndex(row => row[0] === orderId);
    
    if (orderIndex === -1) {
      throw new Error('Pedido no encontrado');
    }

    const orderRow = rows[orderIndex];
    const currentStatus = orderRow[4]; // Estado actual
    
    // Si el estado no ha cambiado, no enviamos email
    if (currentStatus === status) {
      console.log(`⚠️ El pedido ${orderId} ya tiene el estado ${status}, no se envía email`);
      return true;
    }

    // La fila en la hoja (considerando que fila 1 son encabezados)
    const rowNumber = orderIndex + 2;

    // Actualizar estado
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!E${rowNumber}`, // Columna E es status
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[status]],
      },
    });

    // Si hay paymentId, actualizarlo también
    if (paymentId) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORDERS}!H${rowNumber}`, // Columna H es paymentId
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[paymentId]],
        },
      });
    }

    // Si hay paymentType, actualizarlo en la columna K
    if (paymentType) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORDERS}!K${rowNumber}`, // Columna K es paymentType
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[paymentType]],
        },
      });
    }

    // Actualizar paymentStatus basado en el status del pedido
    let paymentStatus = 'pending';
    switch (status) {
      case 'confirmed':
      case 'processing':
      case 'shipped':
      case 'delivered':
        paymentStatus = 'approved';
        break;
      case 'cancelled':
        paymentStatus = 'cancelled';
        break;
      default:
        paymentStatus = 'pending';
    }

    // Actualizar paymentStatus en columna I
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!I${rowNumber}`, // Columna I es paymentStatus
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[paymentStatus]],
      },
    });

    // 📧 NUEVO: Enviar email de notificación al cliente (solo si sendEmail es true)
    if (sendEmail) {
      try {
        // En lugar de enviar email de cambio de estado, 
        // desde el webhook ya se enviará el email de confirmación si es necesario
        console.log(`ℹ️ Actualización de estado a ${status} para pedido ${orderId} - Email será manejado por webhook si aplica`);
        
      } catch (emailError) {
        console.error('❌ Error al enviar email de notificación:', emailError);
        // No fallar la actualización del pedido si el email falla
      }
    } else {
      console.log(`⏸️ Email deshabilitado para actualización de pedido ${orderId} a estado ${status}`);
    }

    console.log(`✅ Pedido ${orderId} actualizado a estado: ${status}, paymentStatus: ${paymentStatus}, paymentType: ${paymentType || 'no especificado'}`);
    return true;
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return false;
  }
}

// Función para obtener todos los pedidos (para administradores)
export async function getAllOrdersFromSheets(): Promise<Order[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A2:L`, // Expandido a L para incluir tracking number
    });

    const rows = response.data.values || [];
    
    const orders: Order[] = rows.map(row => {
      try {
        const items = JSON.parse(row[5] || '[]');
        return {
          id: row[0] || '',
          customer: {
            id: row[1] || '',
            name: row[2] || '',
            email: row[1] || '',
          } as Customer,
          items: items.map((item: any) => ({
            product: {
              id: item.productId,
              name: item.productName,
              price: item.price,
            },
            quantity: item.quantity,
          })) as CartItem[],
          total: parseFloat(row[3]) || 0,
          status: row[4] as Order['status'] || 'pending',
          createdAt: new Date(row[9] || Date.now()),
          updatedAt: new Date(row[9] || Date.now()),
          paymentId: row[7] || undefined,
          paymentStatus: row[8] as Order['paymentStatus'] || 'pending',
          paymentMethod: row[10] as Order['paymentMethod'] || 'mercadopago',
          trackingNumber: row[11] || undefined, // Nueva columna para tracking number
          shippingAddress: {
            firstName: '',
            lastName: '',
            address: row[6] || '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
          },
        };
      } catch (error) {
        console.error('Error al parsear pedido:', error);
        return null;
      }
    }).filter(order => order !== null) as Order[];

    return orders;
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    return [];
  }
}

// Función específica para obtener todos los pedidos en formato Admin (estructura plana)
export async function getAllOrdersFromSheetsForAdmin(): Promise<any[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A2:L`, // Expandido a L para incluir tracking number
    });

    const rows = response.data.values || [];
    
    // Obtener todos los productos una sola vez para optimizar
    const allProducts = await getProductsFromSheets(true);
    console.log('🔍 Admin - Productos disponibles para buscar imágenes:', allProducts.length);
    
    const orders = rows.map(row => {
      try {
        const items = JSON.parse(row[5] || '[]');
        console.log('🔍 Items recuperados para pedido admin', row[0], ':', items);
        
        return {
          id: row[0] || '',
          customerName: row[2] || '',
          customerEmail: row[1] || '',
          items: items.map((item: any) => {
            // Buscar la imagen actual del producto
            const currentProduct = allProducts.find(p => p.id === item.productId);
            const productImage = currentProduct?.image || '';
            
            console.log('🔍 Admin - Procesando item:', {
              productId: item.productId,
              productName: item.productName,
              imageFromProduct: productImage,
              productFound: !!currentProduct
            });
            
            return {
              id: item.productId,
              name: item.productName,
              price: item.price,
              quantity: item.quantity,
              image: productImage, // Imagen obtenida dinámicamente
            };
          }),
          total: parseFloat(row[3]) || 0,
          status: row[4] || 'pending',
          createdAt: row[9] || new Date().toISOString(),
          updatedAt: row[9] || new Date().toISOString(),
          paymentId: row[7] || undefined,
          paymentStatus: row[8] || 'pending',
          paymentMethod: row[10] || 'mercadopago',
          trackingNumber: row[11] || undefined, // Nueva columna para tracking number
          shippingAddress: {
            firstName: '',
            lastName: '',
            address: row[6] || '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
          },
        };
      } catch (error) {
        console.error('Error al parsear pedido para admin:', error);
        return null;
      }
    }).filter(order => order !== null);

    return orders;
  } catch (error) {
    console.error('Error al obtener pedidos para admin:', error);
    return [];
  }
}

// Función para actualizar el número de tracking y URL de envío de un pedido
export async function updateOrderTrackingInSheets(
  orderId: string, 
  trackingNumber: string,
  shippingUrl?: string
): Promise<{ success: boolean; error?: string; customerEmail?: string; customerName?: string }> {
  try {
    console.log('📦 Actualizando tracking en Sheets para pedido:', orderId);
    
    const sheets = await getGoogleSheetsAuth();
    
    // Primero obtener los datos actuales para encontrar el pedido
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A:Z`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return { success: false, error: 'No hay datos en la hoja de pedidos' };
    }

    const headers = rows[0];
    const orderRows = rows.slice(1);
    
    // Buscar el índice de las columnas necesarias
    const idColumnIndex = headers.indexOf('ID');
    const emailColumnIndex = headers.indexOf('Email Usuario');
    const nameColumnIndex = headers.indexOf('Nombre Usuario');
    let trackingColumnIndex = headers.indexOf('Número de Seguimiento');
    let shippingUrlColumnIndex = headers.indexOf('URL de Envío');
    
    if (idColumnIndex === -1) {
      return { success: false, error: 'Columna ID no encontrada' };
    }

    // Si no existen las columnas, agregarlas
    let headersUpdated = false;
    
    if (trackingColumnIndex === -1) {
      console.log('➕ Agregando columna de tracking...');
      const paymentTypeIndex = headers.indexOf('Tipo de Pago');
      if (paymentTypeIndex !== -1) {
        headers.splice(paymentTypeIndex + 1, 0, 'Número de Seguimiento');
        trackingColumnIndex = paymentTypeIndex + 1;
      } else {
        headers.push('Número de Seguimiento');
        trackingColumnIndex = headers.length - 1;
      }
      headersUpdated = true;
    }
    
    if (shippingUrlColumnIndex === -1) {
      console.log('➕ Agregando columna de URL de envío...');
      // Agregar después de la columna de tracking
      headers.splice(trackingColumnIndex + 1, 0, 'URL de Envío');
      shippingUrlColumnIndex = trackingColumnIndex + 1;
      headersUpdated = true;
    }
    
    if (headersUpdated) {
      // Actualizar headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORDERS}!1:1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });
    }

    // Buscar la fila del pedido
    const orderRowIndex = orderRows.findIndex((row: any[]) => row[idColumnIndex] === orderId);
    
    if (orderRowIndex === -1) {
      return { success: false, error: 'Pedido no encontrado' };
    }

    const actualRowIndex = orderRowIndex + 2; // +1 para headers, +1 para índice basado en 1
    const orderRow = orderRows[orderRowIndex];
    
    // Asegurar que la fila tenga suficientes columnas
    while (orderRow.length <= Math.max(trackingColumnIndex, shippingUrlColumnIndex)) {
      orderRow.push('');
    }
    
    // Actualizar el tracking number y URL de envío
    orderRow[trackingColumnIndex] = trackingNumber;
    if (shippingUrl) {
      orderRow[shippingUrlColumnIndex] = shippingUrl;
    }
    
    // Actualizar la fila en Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!${actualRowIndex}:${actualRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [orderRow],
      },
    });
    
    console.log('✅ Tracking y URL de envío actualizados exitosamente');
    
    return { 
      success: true,
      customerEmail: orderRow[emailColumnIndex] || '',
      customerName: orderRow[nameColumnIndex] || ''
    };

  } catch (error) {
    console.error('❌ Error actualizando tracking:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

// Función para obtener el tracking number de un pedido
export async function getOrderTrackingFromSheets(orderId: string): Promise<string | null> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A:Z`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return null;

    const headers = rows[0];
    const orderRows = rows.slice(1);
    
    const idColumnIndex = headers.indexOf('ID');
    const trackingColumnIndex = headers.indexOf('Número de Seguimiento');
    
    if (idColumnIndex === -1 || trackingColumnIndex === -1) return null;
    
    const orderRow = orderRows.find((row: any[]) => row[idColumnIndex] === orderId);
    
    if (!orderRow) return null;
    
    return orderRow[trackingColumnIndex] || null;

  } catch (error) {
    console.error('Error obteniendo tracking:', error);
    return null;
  }
}
