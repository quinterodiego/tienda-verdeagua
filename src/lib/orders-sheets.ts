import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from './google-sheets';
import { Order, Customer, CartItem } from '@/types';

// Función para guardar un pedido en Google Sheets
export async function saveOrderToSheets(order: Omit<Order, 'id'>): Promise<string | null> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Generar ID único para el pedido
    const orderId = `ORD-${Date.now()}`;
    
    // Convertir items a string JSON para almacenar
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
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

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
      range: `${SHEET_NAMES.ORDERS}!A2:J`, // Desde la fila 2 (sin encabezados)
    });

    const rows = response.data.values || [];
    
    // Filtrar pedidos del usuario y convertir a objetos Order
    const userOrders: Order[] = rows
      .filter(row => row[1] === userEmail) // Columna B es email
      .map(row => {
        try {
          const items = JSON.parse(row[5] || '[]');
          return {
            id: row[0] || '',
            customer: {
              id: userEmail,
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
      range: `${SHEET_NAMES.ORDERS}!A2:J`,
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
      range: `${SHEET_NAMES.ORDERS}!A2:J`,
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
