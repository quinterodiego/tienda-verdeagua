import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES, ensureSheetsExist } from './google-sheets';
import { User, UserRole } from '@/types';
import bcrypt from 'bcryptjs';
import { sheetsCache, generateCacheKey } from './sheets-cache';
import { withRateLimit } from './rate-limiter';
import { withQuotaHandling } from './quota-handler';

// Lista de emails de administradores predeterminados
const DEFAULT_ADMIN_EMAILS = [
  'd86webs@gmail.com',
  'sebastianperez6@hotmail.com',
  // Agrega más emails de administradores aquí
];

// Determinar el rol de un usuario basado en su email
const getUserRole = (email: string): UserRole => {
  return DEFAULT_ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';
};

// Función para guardar/actualizar un usuario en Google Sheets
export async function saveUserToSheets(user: Omit<User, 'id'>, providedId?: string): Promise<string | null> {
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
      return existingUser.id;
    }

    console.log('➕ Usuario nuevo, creando en Sheets...');

    // Usar ID proporcionado o generar uno nuevo
    const userId = providedId || `USER-${Date.now()}`;

    const values = [[
      userId,                         // A: ID
      user.name,                      // B: Nombre
      user.email,                     // C: Email
      user.role || getUserRole(user.email), // D: Rol
      user.createdAt || new Date().toISOString(), // E: Fecha Registro
      '',                             // F: Último Login (vacío inicialmente)
      'TRUE',                         // G: Activo (por defecto TRUE)
      '0',                            // H: Cantidad Pedidos (inicial 0)
      '0',                            // I: Total Gastado (inicial 0)
    ]];

    console.log('📤 Enviando datos a Google Sheets (Users):', values[0].slice(0, 5)); // Solo mostrar primeros 5 campos

    await withRateLimit(async () => {
      return sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.USERS}!A:I`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    });

    // Invalidar caché del usuario
    const cacheKey = generateCacheKey('users', 'getUser', user.email);
    sheetsCache.delete(cacheKey);

    console.log('✅ Usuario guardado exitosamente en Sheets:', user.email);
    return userId;
  } catch (error) {
    console.error('❌ Error al guardar usuario en Sheets:', error);
    return null;
  }
}

// Función para obtener un usuario por email
export async function getUserFromSheets(email: string): Promise<User | null> {
  try {
    // Intentar obtener del caché primero
    const cacheKey = generateCacheKey('users', 'getUser', email);
    const cachedUser = sheetsCache.get<User | null>(cacheKey);
    
    if (cachedUser) {
      console.log(`🎯 Cache HIT para usuario: ${email}`);
      return cachedUser;
    }

    console.log(`📡 Cache MISS para usuario: ${email} - consultando API`);
    
    const sheets = await getGoogleSheetsAuth();
    
    const response = await withQuotaHandling(async () => {
      return withRateLimit(async () => {
        return sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAMES.USERS}!A2:I`, // Desde la fila 2 (sin encabezados) hasta columna I
        });
      });
    });

    const rows = response.data.values || [];
    
    // Buscar usuario por email
    const userRow = rows.find(row => row[2] === email);
    
    if (!userRow) {
      // Cachear resultado negativo por menos tiempo
      sheetsCache.set(cacheKey, null, 2);
      return null;
    }

    const user: User = {
      id: userRow[0] || '',
      name: userRow[1] || '',
      email: userRow[2] || '',
      role: (userRow[3] as UserRole) || 'user',
      createdAt: userRow[4] || new Date().toISOString(),
      updatedAt: userRow[5] || undefined, // Último Login como updatedAt
      // Los campos imagen y password no están en la hoja Users ahora
      image: undefined,
      password: undefined,
    };

    // Cachear usuario por 10 minutos
    sheetsCache.set(cacheKey, user, 10);
    return user;
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
      range: `${SHEET_NAMES.USERS}!A2:I`,
    });

    const rows = response.data.values || [];
    const userRowIndex = rows.findIndex(row => row[0] === userId);
    
    if (userRowIndex === -1) {
      console.error('Usuario no encontrado para actualizar:', userId);
      return false;
    }

    // Preparar valores actualizados (nueva estructura de 9 columnas)
    const currentRow = rows[userRowIndex];
    const updatedRow = [
      currentRow[0] || userId,                    // A: ID
      updates.name || currentRow[1],              // B: Nombre
      currentRow[2],                              // C: Email (no cambiar)
      updates.role || currentRow[3],              // D: Rol
      currentRow[4],                              // E: Fecha Registro (no cambiar)
      updates.updatedAt || new Date().toISOString(), // F: Último Login
      currentRow[6] || 'TRUE',                    // G: Activo (mantener)
      currentRow[7] || '0',                       // H: Cantidad Pedidos (mantener)
      currentRow[8] || '0',                       // I: Total Gastado (mantener)
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A${userRowIndex + 2}:I${userRowIndex + 2}`, // +2 porque las filas empiezan en 2
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

// Función para actualizar rol de usuario por email
export async function updateUserRoleByEmailInSheets(email: string, newRole: UserRole): Promise<boolean> {
  try {
    const user = await getUserFromSheets(email);
    if (!user) {
      console.error('Usuario no encontrado con email:', email);
      return false;
    }
    
    return await updateUserInSheets(user.id, { 
      role: newRole,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al actualizar rol de usuario por email:', error);
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
    const savedUserId = await saveUserToSheets(newUser);
    
    if (savedUserId) {
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

// Función para guardar credenciales en hoja separada
export async function saveCredentialsToSheets(userId: string, email: string, hashedPassword: string): Promise<boolean> {
  try {
    console.log('🔐 Guardando credenciales para:', email);
    console.log('📋 UserId:', userId);
    console.log('📋 Hoja destino:', SHEET_NAMES.CREDENTIALS);
    
    const sheets = await getGoogleSheetsAuth();
    
    const values = [[
      userId,               // A: ID del usuario
      email,                // B: Email
      hashedPassword,       // C: Password hasheado
      new Date().toISOString(), // D: Fecha de creación
    ]];

    console.log('📤 Enviando credenciales a Google Sheets...');

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.CREDENTIALS}!A:D`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('✅ Credenciales guardadas exitosamente en hoja:', SHEET_NAMES.CREDENTIALS);
    return true;
  } catch (error) {
    console.error('❌ Error al guardar credenciales:', error);
    return false;
  }
}

// Función para obtener credenciales por email
export async function getCredentialsFromSheets(email: string): Promise<{userId: string, password: string} | null> {
  try {
    console.log('🔍 Buscando credenciales para:', email);
    console.log('📋 Buscando en hoja:', SHEET_NAMES.CREDENTIALS);
    
    const sheets = await getGoogleSheetsAuth();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.CREDENTIALS}!A2:D`,
    });

    const rows = response.data.values || [];
    console.log('📋 Filas encontradas en credentials:', rows.length);
    
    const credentialRow = rows.find(row => row[1] === email);
    
    if (!credentialRow) {
      console.log('❌ No se encontraron credenciales para:', email);
      return null;
    }

    console.log('✅ Credenciales encontradas para:', email);
    return {
      userId: credentialRow[0] || '',
      password: credentialRow[2] || '',
    };
  } catch (error) {
    console.error('❌ Error al obtener credenciales:', error);
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
    
    // Generar ID único para el usuario
    const userId = `USER-${Date.now()}`;
    
    const newUser: Omit<User, 'id'> = {
      name,
      email: email.toLowerCase(),
      role,
      createdAt: new Date().toISOString(),
    };

    // Guardar datos del usuario en la hoja principal usando el mismo ID
    const savedUserId = await saveUserToSheets(newUser, userId);
    
    // Guardar credenciales en hoja separada usando el mismo ID
    const credentialsSaved = await saveCredentialsToSheets(userId, email.toLowerCase(), hashedPassword);
    
    if (savedUserId && credentialsSaved) {
      // Obtener el usuario recién creado
      const savedUser = await getUserFromSheets(email);
      console.log('✅ Usuario registrado exitosamente:', email);
      return savedUser;
    }
    
    throw new Error('Error al guardar usuario o credenciales');
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    throw error;
  }
}

// Función para verificar credenciales desde Sheets
export async function verifyCredentialsFromSheets(email: string, password: string): Promise<User | null> {
  try {
    console.log('🔐 Verificando credenciales para:', email);
    
    // Obtener credenciales
    const credentials = await getCredentialsFromSheets(email);
    if (!credentials || !credentials.password) {
      console.log('❌ Credenciales no encontradas:', email);
      return null;
    }

    // Verificar password
    const isValid = await bcrypt.compare(password, credentials.password);
    
    if (isValid) {
      // Obtener datos del usuario
      const user = await getUserFromSheets(email);
      if (user) {
        console.log('✅ Credenciales válidas para:', email);
        return user;
      }
    }
    
    console.log('❌ Credenciales inválidas para:', email);
    return null;
  } catch (error) {
    console.error('❌ Error al verificar credenciales:', error);
    return null;
  }
}
