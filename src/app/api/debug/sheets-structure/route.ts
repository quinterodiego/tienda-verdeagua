import { NextResponse } from 'next/server';
import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from '@/lib/google-sheets';

export async function GET() {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener información de la hoja completa
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    // Obtener datos de la hoja Users
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A1:J10`, // Ver primeras 10 filas y hasta columna J
    });

    const rows = response.data.values || [];
    
    return NextResponse.json({
      success: true,
      sheetName: SHEET_NAMES.USERS,
      sheetInfo: {
        sheets: sheetInfo.data.sheets?.map(sheet => ({
          title: sheet.properties?.title,
          sheetId: sheet.properties?.sheetId,
          index: sheet.properties?.index,
        }))
      },
      totalRows: rows.length,
      headers: rows[0] || [],
      sampleData: rows.slice(0, 5), // Primeras 5 filas incluyendo header
      structure: {
        A: rows[0]?.[0] || 'Columna A',
        B: rows[0]?.[1] || 'Columna B', 
        C: rows[0]?.[2] || 'Columna C',
        D: rows[0]?.[3] || 'Columna D',
        E: rows[0]?.[4] || 'Columna E',
        F: rows[0]?.[5] || 'Columna F',
        G: rows[0]?.[6] || 'Columna G',
        H: rows[0]?.[7] || 'Columna H',
        I: rows[0]?.[8] || 'Columna I',
        J: rows[0]?.[9] || 'Columna J',
      }
    });

  } catch (error) {
    console.error('❌ Error al verificar estructura de Sheets:', error);
    return NextResponse.json({ 
      error: 'Error al verificar estructura',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
