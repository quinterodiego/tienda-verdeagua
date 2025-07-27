import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES, ensureSheetsExist } from './google-sheets';
import { Customer } from '@/types';

// Función para guardar/actualizar un usuario en Google Sheets
export async function saveUserToSheets(user: Omit<Customer, 'id'>): Promise<boolean> {
  try {
    console.log('📝 saveUserToSheets iniciado para:', user.email);
    
    const sheets = await getGoogleSheetsAuth();
    
    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe...');
    const existingUser = await getUserFromSheets(user.email);
    
    if (existingUser) {
      console.log('👤 Usuario ya existe en Sheets:', user.email);
      // Usuario ya existe, no necesitamos hacer nada
      return true;
    }

    console.log('➕ Usuario nuevo, creando en Sheets...');

    // Generar ID único para el usuario
    const userId = `USER-${Date.now()}`;

    const values = [[
      userId,
      user.name,
      user.email,
      '', // imagen (placeholder)
      new Date().toISOString(),
    ]];

    console.log('📤 Enviando datos a Google Sheets:', values);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A:E`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('✅ Usuario guardado exitosamente en Sheets:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error al guardar usuario en Sheets:', error);
    return false;
  }
}

// Función para obtener un usuario por email
export async function getUserFromSheets(email: string): Promise<Customer | null> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A2:E`, // Desde la fila 2 (sin encabezados)
    });

    const rows = response.data.values || [];
    
    // Buscar usuario por email
    const userRow = rows.find(row => row[2] === email);
    
    if (!userRow) {
      return null;
    }

    return {
      id: userRow[0] || '',
      name: userRow[1] || '',
      email: userRow[2] || '',
      // address: undefined, // Por ahora no guardamos dirección en usuarios
    };
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}

// Función para obtener todos los usuarios (para administradores)
export async function getAllUsersFromSheets(): Promise<Customer[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A2:E`,
    });

    const rows = response.data.values || [];
    
    const users: Customer[] = rows.map(row => ({
      id: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      // address: undefined,
    }));

    return users;
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    return [];
  }
}

// Función para migrar usuarios existentes a Google Sheets
export async function migrateUsersToSheets(): Promise<boolean> {
  try {
    // Primero asegurar que las pestañas existan
    const sheetsCreated = await ensureSheetsExist();
    if (!sheetsCreated) {
      throw new Error('No se pudieron crear las pestañas');
    }

    const sheets = await getGoogleSheetsAuth();

    // Preparar los datos con encabezados
    const values = [
      ['ID', 'Nombre', 'Email', 'Imagen', 'Fecha Creación'],
      // Los usuarios se agregarán dinámicamente cuando se registren
    ];

    // Limpiar la hoja primero
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A:E`,
    });

    // Agregar los encabezados
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A1:E1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values[0]],
      },
    });

    return true;
  } catch (error) {
    console.error('Error al migrar usuarios:', error);
    return false;
  }
}
