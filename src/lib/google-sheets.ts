import { google } from 'googleapis';

// Configuración de Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Función para autenticar con Google Sheets
export async function getGoogleSheetsAuth() {
  try {
    // Leer las credenciales desde las variables de entorno
    const credentials = {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID_SERVICE,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('Error al autenticar con Google Sheets:', error);
    throw error;
  }
}

// ID del Google Sheet (se configurará en .env.local)
export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Nombres de las pestañas
export const SHEET_NAMES = {
  PRODUCTS: 'Productos',
  ORDERS: 'Pedidos',
  USERS: 'Usuarios',
} as const;

// Función para crear las pestañas necesarias si no existen
export async function ensureSheetsExist() {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener información del spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];
    
    // Crear pestañas que no existan
    const sheetsToCreate = Object.values(SHEET_NAMES).filter(sheetName => !existingSheets.includes(sheetName));
    
    if (sheetsToCreate.length > 0) {
      const requests = sheetsToCreate.map(sheetName => ({
        addSheet: {
          properties: {
            title: sheetName,
          },
        },
      }));

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests,
        },
      });

      console.log(`Pestañas creadas: ${sheetsToCreate.join(', ')}`);
    }

    return true;
  } catch (error) {
    console.error('Error al crear pestañas:', error);
    return false;
  }
}
