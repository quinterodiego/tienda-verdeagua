import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Verificando configuración de Google Sheets...');
    
    // Verificar variables de entorno
    const envVars = {
      GOOGLE_TYPE: !!process.env.GOOGLE_TYPE,
      GOOGLE_PROJECT_ID: !!process.env.GOOGLE_PROJECT_ID,
      GOOGLE_PRIVATE_KEY_ID: !!process.env.GOOGLE_PRIVATE_KEY_ID,
      GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_CLIENT_ID_SERVICE: !!process.env.GOOGLE_CLIENT_ID_SERVICE,
      GOOGLE_AUTH_URI: !!process.env.GOOGLE_AUTH_URI,
      GOOGLE_TOKEN_URI: !!process.env.GOOGLE_TOKEN_URI,
      GOOGLE_AUTH_PROVIDER_X509_CERT_URL: !!process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      GOOGLE_CLIENT_X509_CERT_URL: !!process.env.GOOGLE_CLIENT_X509_CERT_URL,
      GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
    };
    
    console.log('📋 Variables de entorno:', envVars);
    
    // Verificar SPREADSHEET_ID
    if (!SPREADSHEET_ID) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SHEET_ID no está configurado',
        envVars,
        spreadsheetId: null
      }, { status: 400 });
    }
    
    console.log('📊 SPREADSHEET_ID configurado:', SPREADSHEET_ID.substring(0, 10) + '...');
    
    // Intentar autenticación
    console.log('🔐 Intentando autenticación con Google Sheets...');
    let authSuccess = false;
    let authError = null;
    
    try {
      const sheets = await getGoogleSheetsAuth();
      authSuccess = true;
      console.log('✅ Autenticación exitosa');
      
      // Intentar acceder al spreadsheet
      console.log('📄 Verificando acceso al spreadsheet...');
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      
      console.log('✅ Acceso al spreadsheet exitoso');
      console.log('📋 Título del spreadsheet:', metadata.data.properties?.title);
      
      // Verificar que exista la pestaña de pedidos
      const sheetTitles = metadata.data.sheets?.map(sheet => sheet.properties?.title) || [];
      console.log('📑 Pestañas disponibles:', sheetTitles);
      
      const ordersSheetExists = sheetTitles.includes(SHEET_NAMES.ORDERS);
      console.log('📦 Pestaña de pedidos existe:', ordersSheetExists);
      
      if (!ordersSheetExists) {
        return NextResponse.json({
          success: false,
          error: `La pestaña "${SHEET_NAMES.ORDERS}" no existe en el spreadsheet`,
          envVars,
          spreadsheetId: SPREADSHEET_ID,
          authSuccess: true,
          spreadsheetTitle: metadata.data.properties?.title,
          availableSheets: sheetTitles,
          expectedSheet: SHEET_NAMES.ORDERS
        }, { status: 400 });
      }
      
      // Intentar leer datos de la pestaña de pedidos
      console.log('📖 Intentando leer datos de la pestaña de pedidos...');
      const ordersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORDERS}!A1:K1`, // Solo leer la primera fila (headers)
      });
      
      const headers = ordersResponse.data.values?.[0] || [];
      console.log('📝 Headers encontrados:', headers);
      
      return NextResponse.json({
        success: true,
        message: 'Configuración de Google Sheets es correcta',
        envVars,
        spreadsheetId: SPREADSHEET_ID,
        authSuccess: true,
        spreadsheetTitle: metadata.data.properties?.title,
        availableSheets: sheetTitles,
        ordersSheetExists: true,
        ordersHeaders: headers,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      authError = error;
      console.error('❌ Error de autenticación:', error);
    }
    
    return NextResponse.json({
      success: false,
      error: 'Error de autenticación con Google Sheets',
      envVars,
      spreadsheetId: SPREADSHEET_ID,
      authSuccess: false,
      authError: authError instanceof Error ? {
        name: authError.name,
        message: authError.message,
        stack: authError.stack
      } : authError
    }, { status: 500 });
    
  } catch (error) {
    console.error('❌ Error general en debug de Google Sheets:', error);
    return NextResponse.json({
      success: false,
      error: 'Error general',
      details: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    }, { status: 500 });
  }
}
