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
    
    // Convertir items a string JSON para almacenar
    const itemsJson = JSON.stringify(order.items.map(item => {
      console.log('🛒 Guardando item en pedido:', {
        productId: item.product.id,
        productName: item.product.name,
        // NO guardamos la imagen, se obtendrá dinámicamente
      });
      
      return {
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        // Removido: image: item.product.image,
      };
    }));

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
      order.paymentMethod || 'mercadopago',
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A:K`, // Cambiado de A:J a A:K para incluir paymentMethod
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    // ✨ NUEVO: Decrementar stock de productos cuando se confirma un pedido
    if (order.status === 'confirmed' || order.status === 'pending') {
      const stockItems = order.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      
      const stockUpdated = await decrementProductsStock(stockItems);
      if (!stockUpdated) {
        console.warn(`⚠️ No se pudo actualizar el stock para el pedido ${orderId}, pero el pedido se guardó correctamente`);
      } else {
        console.log(`✅ Stock actualizado correctamente para el pedido ${orderId}`);
      }
    }

    return orderId;
  } catch (error) {
    console.error('Error al guardar pedido:', error);
    return null;
  }
}

// Función para obtener pedidos de un usuario
export async function getUserOrdersFromSheets(userEmail: string): Promise<Order[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A2:K`, // Cambiado de A2:J a A2:K para incluir paymentMethod
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
export async function updateOrderStatus(orderId: string, status: Order['status'], paymentId?: string): Promise<boolean> {
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

    console.log(`✅ Pedido ${orderId} actualizado a estado: ${status}, paymentStatus: ${paymentStatus}`);
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
      range: `${SHEET_NAMES.ORDERS}!A2:K`, // Cambiado de A2:J a A2:K
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
      range: `${SHEET_NAMES.ORDERS}!A2:K`,
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
