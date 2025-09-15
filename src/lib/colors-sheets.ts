import { getGoogleSheetsAuth, SPREADSHEET_ID } from './google-sheets';
import { Color, AdminColor } from '@/types/colors-motivos';

const SHEET_NAME = 'Colores';

export async function ensureColorsSheetExists(): Promise<void> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID no está definido');
    }

    // Verificar si la hoja ya existe
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === SHEET_NAME
    );

    if (!sheetExists) {
      // Crear la hoja
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: SHEET_NAME,
              },
            },
          }],
        },
      });

      // Agregar headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:C1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['id', 'nombre', 'disponible']],
        },
      });

      console.log(`✅ Hoja "${SHEET_NAME}" creada exitosamente`);
    }
  } catch (error) {
    console.error('❌ Error al crear/verificar hoja de Colores:', error);
    throw error;
  }
}

export async function getColorsFromSheets(): Promise<AdminColor[]> {
  try {
    await ensureColorsSheetExists();
    const sheets = await getGoogleSheetsAuth();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    });

    const rows = response.data.values || [];
    
    if (rows.length <= 1) {
      console.log('⚠️ No hay colores en la hoja');
      return [];
    }

    // Omitir la primera fila (headers)
    const dataRows = rows.slice(1);
    
    const colors: AdminColor[] = dataRows.map((row, index) => ({
      id: row[0] || `COL-${Date.now()}-${index}`,
      nombre: row[1] || '',
      disponible: row[2] === 'TRUE' || row[2] === true || row[2] === '1',
    }));

    console.log(`✅ ${colors.length} colores obtenidos de Google Sheets`);
    return colors;
  } catch (error) {
    console.error('❌ Error al obtener colores:', error);
    return [];
  }
}

export async function addColorToSheets(color: Omit<AdminColor, 'id'>): Promise<string | null> {
  try {
    await ensureColorsSheetExists();
    const sheets = await getGoogleSheetsAuth();

    const newId = `COL-${Date.now()}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          newId,
          color.nombre,
          color.disponible ? 'TRUE' : 'FALSE',
        ]],
      },
    });

    console.log(`✅ Color "${color.nombre}" agregado exitosamente`);
    return newId;
  } catch (error) {
    console.error('❌ Error al agregar color:', error);
    return null;
  }
}

export async function updateColorInSheets(colorId: string, updates: Partial<AdminColor>): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();

    // Obtener todos los datos para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);

    // Encontrar la fila del color
    const rowIndex = dataRows.findIndex(row => row[0] === colorId);
    if (rowIndex === -1) {
      console.error(`Color con ID ${colorId} no encontrado`);
      return false;
    }

    // Construir la fila actualizada
    const currentRow = dataRows[rowIndex];
    const updatedRow = [
      colorId,
      updates.nombre ?? currentRow[1],
      updates.disponible !== undefined 
        ? (updates.disponible ? 'TRUE' : 'FALSE') 
        : currentRow[2],
    ];

    // Actualizar la fila (rowIndex + 2 porque: +1 para header, +1 para índice base 1)
    const sheetRowNumber = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${sheetRowNumber}:C${sheetRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log(`✅ Color "${colorId}" actualizado exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar color:', error);
    return false;
  }
}

export async function deleteColorFromSheets(colorId: string): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();

    // Obtener todos los datos para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);

    // Encontrar la fila del color
    const rowIndex = dataRows.findIndex(row => row[0] === colorId);
    if (rowIndex === -1) {
      console.error(`Color con ID ${colorId} no encontrado`);
      return false;
    }

    // Obtener el ID de la hoja
    const sheetId = await getSheetId(SPREADSHEET_ID, SHEET_NAME);
    
    // Eliminar la fila (rowIndex + 1 porque el header es índice 0)
    const sheetRowNumber = rowIndex + 1;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: sheetRowNumber,
              endIndex: sheetRowNumber + 1,
            },
          },
        }],
      },
    });

    console.log(`✅ Color "${colorId}" eliminado exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar color:', error);
    return false;
  }
}

async function getSheetId(spreadsheetId: string, sheetName: string): Promise<number> {
  const sheets = await getGoogleSheetsAuth();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const sheet = spreadsheet.data.sheets?.find(
    sheet => sheet.properties?.title === sheetName
  );

  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error(`No se pudo encontrar el ID de la hoja "${sheetName}"`);
  }

  return sheet.properties.sheetId;
}
