import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES, ensureSheetsExist } from './google-sheets';
import { User, UserRole } from '@/types';
import bcrypt from 'bcryptjs';

// Lista de emails de administradores predeterminados
const DEFAULT_ADMIN_EMAILS = [
  'd86webs@gmail.com',
  // Agrega más emails de administradores aquí
];

// Determinar el rol de un usuario basado en su email
const getUserRole = (email: string): UserRole => {
  return DEFAULT_ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';
};

// Función para guardar/actualizar un usuario en Google Sheets
export async function saveUserToSheets(user: Omit<User, 'id'>): Promise<boolean> {
  try {
    console.log('📝 saveUserToSheets iniciado para:', user.email);
    
    const sheets = await getGoogleSheetsAuth();
    
    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe...');
    const existingUser = await getUserFromSheets(user.email);
    
    if (existingUser) {
      console.log('👤 Usuario ya existe en Sheets:', user.email);
      // Actualizar información si es necesario
      await updateUserInSheets(existingUser.id, {
        name: user.name,
        image: user.image,
        updatedAt: new Date().toISOString()
      });
      return true;
    }

    console.log('➕ Usuario nuevo, creando en Sheets...');

    // Generar ID único para el usuario
    const userId = `USER-${Date.now()}`;

    const values = [[
      userId,                         // A: ID
      user.name,                      // B: Nombre
      user.email,                     // C: Email
      user.image || '',               // D: Imagen
      user.role || getUserRole(user.email), // E: Rol
      user.password || '',            // F: Password (hasheado)
      user.createdAt || new Date().toISOString(), // G: Fecha Creación
      user.updatedAt || '',           // H: Fecha Actualización
    ]];

    console.log('📤 Enviando datos a Google Sheets:', values.map(row => [...row.slice(0, 5), '***', ...row.slice(6)])); // Ocultar password en logs

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A:H`,
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
export async function getUserFromSheets(email: string): Promise<User | null> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A2:H`, // Desde la fila 2 (sin encabezados)
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
      image: userRow[3] || undefined,
      role: (userRow[4] as UserRole) || 'user',
      password: userRow[5] || undefined,
      createdAt: userRow[6] || new Date().toISOString(),
      updatedAt: userRow[7] || undefined,
    };
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}

// Función para actualizar un usuario existente
export async function updateUserInSheets(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener todos los usuarios para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A2:H`,
    });

    const rows = response.data.values || [];
    const userRowIndex = rows.findIndex(row => row[0] === userId);
    
    if (userRowIndex === -1) {
      console.error('Usuario no encontrado para actualizar:', userId);
      return false;
    }

    // Preparar valores actualizados
    const currentRow = rows[userRowIndex];
    const updatedRow = [
      currentRow[0] || userId,                    // A: ID
      updates.name || currentRow[1],              // B: Nombre
      currentRow[2],                              // C: Email (no cambiar)
      updates.image !== undefined ? updates.image : currentRow[3], // D: Imagen
      updates.role || currentRow[4],              // E: Rol
      updates.password || currentRow[5],          // F: Password
      currentRow[6],                              // G: Fecha Creación (no cambiar)
      updates.updatedAt || new Date().toISOString(), // H: Fecha Actualización
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A${userRowIndex + 2}:H${userRowIndex + 2}`, // +2 porque las filas empiezan en 2
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log('✅ Usuario actualizado exitosamente en Sheets:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar usuario en Sheets:', error);
    return false;
  }
}

// Función para obtener todos los usuarios (para administradores)
export async function getAllUsersFromSheets(): Promise<User[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A2:H`,
    });

    const rows = response.data.values || [];
    
    const users: User[] = rows.map(row => ({
      id: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      image: row[3] || undefined,
      role: (row[4] as UserRole) || 'user',
      password: undefined, // No exponer passwords
      createdAt: row[6] || new Date().toISOString(),
      updatedAt: row[7] || undefined,
    }));

    return users;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

// Función para actualizar el rol de un usuario
export async function updateUserRoleInSheets(userId: string, newRole: UserRole): Promise<boolean> {
  try {
    return await updateUserInSheets(userId, { 
      role: newRole,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al actualizar rol de usuario:', error);
    return false;
  }
}

// Verificar si un usuario tiene un rol específico
export const hasRole = (user: User | null, role: UserRole): boolean => {
  return user?.role === role;
};

// Verificar si un usuario es admin
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'admin');
};

// Verificar si un usuario es moderator o admin
export const isModerator = (user: User | null): boolean => {
  return user?.role === 'moderator' || isAdmin(user);
};

// Función para obtener un usuario por ID
export async function getUserByIdFromSheets(userId: string): Promise<User | null> {
  try {
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A2:H`,
    });

    const rows = response.data.values || [];
    const userRow = rows.find(row => row[0] === userId);
    
    if (!userRow) {
      return null;
    }

    return {
      id: userRow[0] || '',
      name: userRow[1] || '',
      email: userRow[2] || '',
      image: userRow[3] || undefined,
      role: (userRow[4] as UserRole) || 'user',
      password: undefined, // No exponer password
      createdAt: userRow[6] || new Date().toISOString(),
      updatedAt: userRow[7] || undefined,
    };
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    return null;
  }
}

// Función para registrar usuario con credenciales (email/password)
export async function registerUserWithCredentials(email: string, password: string, name: string): Promise<User | null> {
  try {
    console.log('🔐 Registrando usuario con credenciales:', email);
    
    // Verificar si el usuario ya existe
    const existingUser = await getUserFromSheets(email);
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Determinar rol basado en email
    const role = getUserRole(email);
    
    const newUser: Omit<User, 'id'> = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    };

    // Guardar en Sheets
    const success = await saveUserToSheets(newUser);
    
    if (success) {
      // Obtener el usuario recién creado
      const savedUser = await getUserFromSheets(email);
      console.log('✅ Usuario registrado exitosamente:', email);
      return savedUser;
    }
    
    throw new Error('Error al guardar usuario');
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    throw error;
  }
}

// Función para verificar credenciales desde Sheets
export async function verifyCredentialsFromSheets(email: string, password: string): Promise<User | null> {
  try {
    console.log('🔐 Verificando credenciales para:', email);
    
    const user = await getUserFromSheets(email);
    if (!user || !user.password) {
      console.log('❌ Usuario no encontrado o sin password:', email);
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      console.log('✅ Credenciales válidas para:', email);
      // No devolver el password
      return {
        ...user,
        password: undefined
      };
    }
    
    console.log('❌ Credenciales inválidas para:', email);
    return null;
  } catch (error) {
    console.error('❌ Error al verificar credenciales:', error);
    return null;
  }
}

// Función para obtener o crear un usuario OAuth
export async function getOrCreateOAuthUser(email: string, name: string, image?: string): Promise<User | null> {
  try {
    console.log('👤 Obteniendo/creando usuario OAuth:', email);
    
    // Verificar si el usuario ya existe
    let user = await getUserFromSheets(email);
    
    if (user) {
      console.log('👤 Usuario OAuth ya existe, actualizando información:', email);
      // Actualizar información si es necesario
      await updateUserInSheets(user.id, {
        name,
        image,
        updatedAt: new Date().toISOString()
      });
      return await getUserFromSheets(email);
    }

    console.log('➕ Creando nuevo usuario OAuth:', email);
    
    // Determinar rol basado en email
    const role = getUserRole(email);
    
    const newUser: Omit<User, 'id'> = {
      name,
      email: email.toLowerCase(),
      image,
      role,
      createdAt: new Date().toISOString(),
    };

    // Guardar en Sheets
    const success = await saveUserToSheets(newUser);
    
    if (success) {
      const savedUser = await getUserFromSheets(email);
      console.log('✅ Usuario OAuth creado exitosamente:', email);
      return savedUser;
    }
    
    throw new Error('Error al guardar usuario OAuth');
  } catch (error) {
    console.error('❌ Error al obtener/crear usuario OAuth:', error);
    return null;
  }
}

// Actualizar contraseña de usuario
export async function updateUserPassword(email: string, hashedPassword: string): Promise<boolean> {
  try {
    console.log('🔐 Actualizando contraseña para:', email);
    
    const sheets = await getGoogleSheetsAuth();
    
    // Obtener todos los usuarios para encontrar el correcto
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A2:H`,
    });

    const rows = response.data.values || [];
    const userRowIndex = rows.findIndex(row => row[2] === email); // Columna C es email
    
    if (userRowIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    console.log('👤 Usuario encontrado en fila:', userRowIndex + 2);
    
    // Preparar datos actualizados (mantener todo igual, solo cambiar password)
    const currentRow = rows[userRowIndex];
    const updatedRow = [
      currentRow[0],                              // A: ID
      currentRow[1],                              // B: Nombre
      currentRow[2],                              // C: Email
      currentRow[3],                              // D: Imagen
      currentRow[4],                              // E: Rol
      hashedPassword,                             // F: Password (ACTUALIZADO)
      currentRow[6],                              // G: Fecha Creación
      new Date().toISOString(),                   // H: Fecha Actualización (ACTUALIZADO)
    ];

    console.log('💾 Actualizando fila en Google Sheets...');
    
    // Actualizar la fila específica
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A${userRowIndex + 2}:H${userRowIndex + 2}`, // +2 porque empezamos en fila 2
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log('✅ Contraseña actualizada exitosamente en Google Sheets');
    return true;

  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    if (error instanceof Error) {
      console.error('💬 Mensaje de error:', error.message);
      console.error('📚 Stack trace:', error.stack);
    }
    return false;
  }
}
