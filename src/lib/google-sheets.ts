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
  CREDENTIALS: 'Credenciales',
  EMAIL_LOGS: 'Logs_Emails',
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

    // Si se creó la pestaña de Email Logs, inicializarla
    if (sheetsToCreate.includes(SHEET_NAMES.EMAIL_LOGS)) {
      await initializeEmailLogsSheet();
    }

    return true;
  } catch (error) {
    console.error('Error al crear pestañas:', error);
    return false;
  }
}

// Tipos para logs de emails
export interface EmailLog {
  id: string;
  timestamp: string;
  type: 'order_status' | 'welcome' | 'password_reset' | 'admin_notification';
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  orderId?: string;
  userId?: string;
  errorMessage?: string;
  metadata?: string;
}

// Función para inicializar la pestaña de logs de emails
export async function initializeEmailLogsSheet() {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Headers para la pestaña de logs de emails
    const headers = [
      'ID',
      'Timestamp',
      'Tipo',
      'Destinatario',
      'Asunto',
      'Estado',
      'ID_Pedido',
      'ID_Usuario',
      'Error',
      'Metadata'
    ];

    // Verificar si ya tiene headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.EMAIL_LOGS}!A1:J1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Agregar headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.EMAIL_LOGS}!A1:J1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });

      console.log('Headers de Email Logs inicializados');
    }

    return true;
  } catch (error) {
    console.error('Error al inicializar Email Logs sheet:', error);
    return false;
  }
}

// Función para agregar un log de email
export async function addEmailLog(emailLog: EmailLog) {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Asegurar que la pestaña existe y tiene headers
    await initializeEmailLogsSheet();
    
    const values = [
      emailLog.id,
      emailLog.timestamp,
      emailLog.type,
      emailLog.to,
      emailLog.subject,
      emailLog.status,
      emailLog.orderId || '',
      emailLog.userId || '',
      emailLog.errorMessage || '',
      emailLog.metadata || ''
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.EMAIL_LOGS}!A:J`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    console.log(`Email log agregado: ${emailLog.id}`);
    return response.data;
  } catch (error) {
    console.error('Error al agregar email log:', error);
    throw error;
  }
}

// Función para obtener logs de emails con filtros
export async function getEmailLogs(filters?: {
  type?: string;
  status?: string;
  orderId?: string;
  limit?: number;
}) {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.EMAIL_LOGS}!A:J`,
    });

    if (!response.data.values || response.data.values.length <= 1) {
      return [];
    }

    const [, ...rows] = response.data.values; // Ignorar headers
    
    let logs: EmailLog[] = rows.map(row => ({
      id: row[0] || '',
      timestamp: row[1] || '',
      type: row[2] as EmailLog['type'] || 'admin_notification',
      to: row[3] || '',
      subject: row[4] || '',
      status: row[5] as EmailLog['status'] || 'pending',
      orderId: row[6] || undefined,
      userId: row[7] || undefined,
      errorMessage: row[8] || undefined,
      metadata: row[9] || undefined,
    }));

    // Aplicar filtros
    if (filters) {
      if (filters.type) {
        logs = logs.filter(log => log.type === filters.type);
      }
      if (filters.status) {
        logs = logs.filter(log => log.status === filters.status);
      }
      if (filters.orderId) {
        logs = logs.filter(log => log.orderId === filters.orderId);
      }
    }

    // Ordenar por timestamp descendente (más recientes primero)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Aplicar límite
    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  } catch (error) {
    console.error('Error al obtener email logs:', error);
    return [];
  }
}

// Función para actualizar el estado de un email log
export async function updateEmailLogStatus(emailId: string, status: EmailLog['status'], errorMessage?: string) {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener todos los logs para encontrar la fila correcta
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.EMAIL_LOGS}!A:J`,
    });

    if (!response.data.values) {
      throw new Error('No se encontraron logs de emails');
    }

    const rows = response.data.values;
    let rowIndex = -1;

    // Encontrar la fila del email (empezando desde 1 porque 0 son los headers)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === emailId) {
        rowIndex = i + 1; // +1 porque Google Sheets usa índices basados en 1
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Email log con ID ${emailId} no encontrado`);
    }

    // Actualizar estado
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.EMAIL_LOGS}!F${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });

    // Actualizar mensaje de error si se proporciona
    if (errorMessage) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.EMAIL_LOGS}!I${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[errorMessage]],
        },
      });
    }

    console.log(`Email log ${emailId} actualizado a estado: ${status}`);
    return true;
  } catch (error) {
    console.error('Error al actualizar email log:', error);
    return false;
  }
}
