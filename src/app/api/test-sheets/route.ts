import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsAuth, SPREADSHEET_ID } from '@/lib/google-sheets';

export async function GET() {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Intentar acceder al sheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa con Google Sheets',
      sheetTitle: response.data.properties?.title,
      sheetId: SPREADSHEET_ID
    });
  } catch (error: any) {
    console.error('Error de conexión:', error);
    return NextResponse.json({
      success: false,
      message: 'Error de conexión con Google Sheets',
      error: error.message,
      details: 'Verifica las credenciales en .env.local'
    }, { status: 500 });
  }
}
