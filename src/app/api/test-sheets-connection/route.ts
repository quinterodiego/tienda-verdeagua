import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DIAGNÓSTICO GOOGLE SHEETS ===');
    
    // Verificar variables de entorno
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    console.log('Project ID:', !!projectId ? 'SET' : 'MISSING');
    console.log('Client Email:', !!clientEmail ? clientEmail : 'MISSING');
    console.log('Private Key:', !!privateKey ? 'SET (length: ' + privateKey.length + ')' : 'MISSING');
    console.log('Sheet ID:', !!sheetId ? sheetId : 'MISSING');
    
    if (!projectId || !clientEmail || !privateKey || !sheetId) {
      return NextResponse.json({
        error: 'Variables de entorno faltantes',
        missing: {
          projectId: !projectId,
          clientEmail: !clientEmail,
          privateKey: !privateKey,
          sheetId: !sheetId
        }
      }, { status: 500 });
    }
    
    // Intentar conectar a Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: projectId,
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Intentar leer el sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Usuarios!A1:E1',
    });
    
    console.log('Conexión exitosa! Headers:', response.data.values);
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a Google Sheets exitosa',
      headers: response.data.values,
      sheetId: sheetId,
      serviceAccount: clientEmail
    });
    
  } catch (error: any) {
    console.error('Error en diagnóstico:', error);
    
    return NextResponse.json({
      error: 'Error de conexión',
      message: error.message,
      code: error.code,
      details: error.errors || []
    }, { status: 500 });
  }
}
