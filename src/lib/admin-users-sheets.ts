import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from './google-sheets';

// Interfaz para usuarios del admin
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  registeredAt: string;
  lastLogin?: string;
  isActive: boolean;
  ordersCount: number;
  totalSpent: number;
}

// Función para obtener todos los usuarios para admin desde Google Sheets
export async function getAdminUsersFromSheets(): Promise<AdminUser[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A2:I`, // Expandir para incluir campos de admin
    });

    const rows = response.data.values || [];
    
    const users: AdminUser[] = rows.map((row) => {
      try {
        return {
          id: row[0] || '',
          name: row[1] || '',
          email: row[2] || '',
          role: (row[3] as 'admin' | 'user') || 'user',
          registeredAt: row[4] || new Date().toISOString(),
          lastLogin: row[5] || undefined,
          isActive: row[6] === 'true' || row[6] === 'TRUE' || row[6] === undefined,
          ordersCount: parseInt(row[7]) || 0,
          totalSpent: parseFloat(row[8]) || 0,
        };
      } catch (error) {
        console.error('Error al parsear usuario:', error, row);
        return null;
      }
    }).filter(user => user !== null) as AdminUser[];

    return users;
  } catch (error) {
    console.error('Error al obtener usuarios de admin:', error);
    return [];
  }
}

// Función para actualizar un usuario desde el admin
export async function updateAdminUserInSheets(userId: string, updates: Partial<AdminUser>): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Primero obtener todos los usuarios para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A:I`,
    });

    const rows = response.data.values || [];
    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    
    // Encontrar la fila del usuario
    const userRowIndex = dataRows.findIndex(row => row[0] === userId);
    
    if (userRowIndex === -1) {
      console.error('Usuario no encontrado:', userId);
      return false;
    }

    // Obtener datos actuales del usuario
    const currentRow = dataRows[userRowIndex];
    const currentUser: AdminUser = {
      id: currentRow[0] || '',
      name: currentRow[1] || '',
      email: currentRow[2] || '',
      role: (currentRow[3] as 'admin' | 'user') || 'user',
      registeredAt: currentRow[4] || new Date().toISOString(),
      lastLogin: currentRow[5] || undefined,
      isActive: currentRow[6] === 'true' || currentRow[6] === 'TRUE' || currentRow[6] === undefined,
      ordersCount: parseInt(currentRow[7]) || 0,
      totalSpent: parseFloat(currentRow[8]) || 0,
    };

    // Aplicar actualizaciones
    const updatedUser = { ...currentUser, ...updates };
    
    // Preparar fila actualizada
    const updatedRow = [
      updatedUser.id,
      updatedUser.name,
      updatedUser.email,
      updatedUser.role,
      updatedUser.registeredAt,
      updatedUser.lastLogin || '',
      updatedUser.isActive,
      updatedUser.ordersCount,
      updatedUser.totalSpent
    ];

    // Actualizar la fila
    const range = `${SHEET_NAMES.USERS}!A${userRowIndex + 2}:I${userRowIndex + 2}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log('Usuario actualizado exitosamente:', userId);
    return true;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return false;
  }
}

// Función para actualizar estadísticas de usuario (orders count y total spent)
export async function updateUserStats(userEmail: string, ordersCount: number, totalSpent: number): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener todos los usuarios para encontrar el correcto
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A:I`,
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);
    
    // Encontrar la fila del usuario por email
    const userRowIndex = dataRows.findIndex(row => row[2] === userEmail);
    
    if (userRowIndex === -1) {
      console.error('Usuario no encontrado por email:', userEmail);
      return false;
    }

    // Actualizar solo las columnas de estadísticas (H=ordersCount, I=totalSpent)
    const range = `${SHEET_NAMES.USERS}!H${userRowIndex + 2}:I${userRowIndex + 2}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[ordersCount, totalSpent]],
      },
    });

    console.log('Estadísticas de usuario actualizadas:', userEmail);
    return true;
  } catch (error) {
    console.error('Error al actualizar estadísticas de usuario:', error);
    return false;
  }
}

// Función para configurar encabezados de usuarios de admin
export async function setupAdminUsersHeaders(): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Crear encabezados ampliados para admin
    const headerValues = [[
      'ID',
      'Nombre',
      'Email',
      'Rol',
      'Fecha Registro',
      'Último Login',
      'Activo',
      'Cantidad Pedidos',
      'Total Gastado'
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A1:I1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: headerValues,
      },
    });

    console.log('Encabezados de usuarios de admin configurados exitosamente');
    return true;
  } catch (error) {
    console.error('Error al configurar encabezados de usuarios de admin:', error);
    return false;
  }
}
