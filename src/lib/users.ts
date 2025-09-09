import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { User, UserRole } from '@/types';
import { getAdminEmailsFromSheets } from './admin-config';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Lista de emails de administradores predeterminados (fallback)
const FALLBACK_ADMIN_EMAILS = [
  'd86webs@gmail.com',
  'coderflixarg@gmail.com',
  'sebastianperez6@hotmail.com',
];

// Asegurarse de que el directorio existe
const ensureDataDir = () => {
  const dataDir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Leer usuarios del archivo
const getUsers = (): User[] => {
  ensureDataDir();
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Guardar usuarios al archivo
const saveUsers = (users: User[]) => {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users file:', error);
  }
};

// Determinar el rol de un usuario basado en su email (ahora dinámico)
const getUserRole = async (email: string): Promise<UserRole> => {
  try {
    const adminEmails = await getAdminEmailsFromSheets();
    return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
  } catch (error) {
    console.error('Error al obtener admins dinámicos, usando fallback:', error);
    return FALLBACK_ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';
  }
};

// Encontrar usuario por email
export const findUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

// Crear nuevo usuario
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const users = getUsers();
  
  // Verificar si el usuario ya existe
  if (findUserByEmail(email)) {
    throw new Error('El usuario ya existe');
  }

  try {
    // Hash del password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Determinar rol basado en email (dinámicamente)
    const role = await getUserRole(email);
    
    // Crear nuevo usuario
    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    // Guardar usuario
    users.push(newUser);
    saveUsers(users);

    return newUser;
  } catch (error) {
    if (error instanceof Error && error.message === 'El usuario ya existe') {
      throw error;
    }
    console.error('Error creating user:', error);
    throw new Error('Error al crear el usuario');
  }
};

// Verificar credenciales
export const verifyCredentials = async (email: string, password: string): Promise<User | null> => {
  const user = findUserByEmail(email);
  if (!user || !user.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
};

// Crear usuario OAuth (sin password)
export const createOAuthUser = async (email: string, name: string, image?: string): Promise<User> => {
  const users = getUsers();
  
  // Verificar si el usuario ya existe
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    // Actualizar información si es necesario
    existingUser.name = name;
    existingUser.image = image;
    existingUser.updatedAt = new Date().toISOString();
    saveUsers(users);
    return existingUser;
  }

  // Determinar rol basado en email (dinámicamente)
  const role = await getUserRole(email);
  
  // Crear nuevo usuario OAuth
  const newUser: User = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    name,
    image,
    role,
    createdAt: new Date().toISOString(),
  };

  // Guardar usuario
  users.push(newUser);
  saveUsers(users);

  return newUser;
};

// Actualizar rol de usuario
export const updateUserRole = (userId: string, newRole: UserRole): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }

  users[userIndex].role = newRole;
  users[userIndex].updatedAt = new Date().toISOString();
  saveUsers(users);
  
  return users[userIndex];
};

// Obtener todos los usuarios (solo para admins)
export const getAllUsers = (): User[] => {
  return getUsers().map(user => ({
    ...user,
    password: undefined // No exponer passwords
  }));
};

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

// Actualizar usuario
export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);
  
  return users[userIndex];
};
