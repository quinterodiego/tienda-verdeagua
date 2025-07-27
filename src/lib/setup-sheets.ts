import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES, ensureSheetsExist } from './google-sheets';

// Función para crear la estructura de la pestaña Pedidos
export async function createOrdersSheet(): Promise<boolean> {
  try {
    // Primero asegurar que las pestañas existan
    const sheetsCreated = await ensureSheetsExist();
    if (!sheetsCreated) {
      throw new Error('No se pudieron crear las pestañas');
    }

    const sheets = await getGoogleSheetsAuth();

    // Preparar los encabezados para pedidos
    const headers = [
      'ID',
      'Email Usuario', 
      'Nombre Usuario',
      'Total',
      'Estado',
      'Items (JSON)',
      'Dirección de Envío',
      'Payment ID',
      'Estado Pago',
      'Fecha Creación'
    ];

    // Limpiar la hoja primero
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A:J`,
    });

    // Agregar los encabezados
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A1:J1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    return true;
  } catch (error) {
    console.error('Error al crear estructura de pedidos:', error);
    return false;
  }
}
