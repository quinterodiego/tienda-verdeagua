import { getGoogleSheetsAuth, SPREADSHEET_ID } from './google-sheets';
import { Motivo, AdminMotivo } from '@/types/colors-motivos';

const SHEET_NAME = 'Motivos';

export async function ensureMotivosSheetExists(): Promise<void> {
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
    console.error('❌ Error al crear/verificar hoja de Motivos:', error);
    throw error;
  }
}

export async function getMotivosFromSheets(): Promise<AdminMotivo[]> {
  try {
    await ensureMotivosSheetExists();
    const sheets = await getGoogleSheetsAuth();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    });

    const rows = response.data.values || [];
    
    if (rows.length <= 1) {
      console.log('⚠️ No hay motivos en la hoja');
      return [];
    }

    // Omitir la primera fila (headers)
    const dataRows = rows.slice(1);
    
    const motivos: AdminMotivo[] = dataRows.map((row, index) => ({
      id: row[0] || `MOT-${Date.now()}-${index}`,
      nombre: row[1] || '',
      disponible: row[2] === 'TRUE' || row[2] === true || row[2] === '1',
    }));

    console.log(`✅ ${motivos.length} motivos obtenidos de Google Sheets`);
    return motivos;
  } catch (error) {
    console.error('❌ Error al obtener motivos:', error);
    return [];
  }
}

export async function addMotivoToSheets(motivo: Omit<AdminMotivo, 'id'>): Promise<string | null> {
  try {
    await ensureMotivosSheetExists();
    const sheets = await getGoogleSheetsAuth();

    const newId = `MOT-${Date.now()}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          newId,
          motivo.nombre,
          motivo.disponible ? 'TRUE' : 'FALSE',
        ]],
      },
    });

    console.log(`✅ Motivo "${motivo.nombre}" agregado exitosamente`);
    return newId;
  } catch (error) {
    console.error('❌ Error al agregar motivo:', error);
    return null;
  }
}

export async function updateMotivoInSheets(motivoId: string, updates: Partial<AdminMotivo>): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();

    // Obtener todos los datos para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);

    // Encontrar la fila del motivo
    const rowIndex = dataRows.findIndex(row => row[0] === motivoId);
    if (rowIndex === -1) {
      console.error(`Motivo con ID ${motivoId} no encontrado`);
      return false;
    }

    // Construir la fila actualizada
    const currentRow = dataRows[rowIndex];
    const updatedRow = [
      motivoId,
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

    console.log(`✅ Motivo "${motivoId}" actualizado exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar motivo:', error);
    return false;
  }
}

export async function deleteMotivoFromSheets(motivoId: string): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();

    // Obtener todos los datos para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);

    // Encontrar la fila del motivo
    const rowIndex = dataRows.findIndex(row => row[0] === motivoId);
    if (rowIndex === -1) {
      console.error(`Motivo con ID ${motivoId} no encontrado`);
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

    console.log(`✅ Motivo "${motivoId}" eliminado exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar motivo:', error);
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
