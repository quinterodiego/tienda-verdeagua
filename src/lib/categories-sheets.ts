import { google } from 'googleapis';
import { Category } from '../types';

// Configuración de autenticación con Google Sheets
async function getGoogleSheetsAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;

// Función auxiliar para encontrar el nombre correcto de la hoja de categorías
async function getCategoriesSheetName(): Promise<string> {
  const sheets = await getGoogleSheetsAuth();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const possibleNames = ['Categorias', 'Categorías', 'Categories', 'categorias', 'categorías'];
  
  for (const sheetName of possibleNames) {
    const sheet = spreadsheet.data.sheets?.find(
      s => s.properties?.title?.toLowerCase() === sheetName.toLowerCase()
    );
    if (sheet) {
      console.log(`🔍 Encontrada hoja de categorías: "${sheet.properties?.title}"`);
      return sheet.properties?.title || 'Categorias';
    }
  }
  
  // Si no existe, retornamos el nombre por defecto
  return 'Categorias';
}

const CATEGORIES_RANGE = 'A2:G'; // Range sin el nombre de la hoja, se añadirá dinámicamente

// Función para obtener todas las categorías
export async function getCategoriesFromSheets(): Promise<Category[]> {
  try {
    const sheets = await getGoogleSheetsAuth();
    const sheetName = await getCategoriesSheetName();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${CATEGORIES_RANGE}`,
    });    const rows = response.data.values || [];
    
    const categories: Category[] = rows.map((row) => {
      return {
        id: row[0] || '',
        name: row[1] || '',
        description: row[2] || '',
        slug: row[3] || '',
        isActive: row[4]?.toLowerCase() === 'true',
        createdAt: row[5] || '',
        updatedAt: row[6] || '',
      };
    }).filter(category => category.id && category.name); // Filtrar categorías vacías

    return categories;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
}

// Función para agregar una categoría
export async function addCategoryToSheets(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const sheets = await getGoogleSheetsAuth();
    const sheetName = await getCategoriesSheetName();
    
    // Generar ID único
    const existingCategories = await getCategoriesFromSheets();
    const newId = `CAT-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const values = [[
      newId,
      category.name,
      category.description || '',
      category.slug,
      category.isActive.toString().toUpperCase(),
      timestamp,
      timestamp,
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:G`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log(`Categoría agregada exitosamente: ${newId}`);
    return newId;
  } catch (error) {
    console.error('Error al agregar categoría:', error);
    return null;
  }
}

// Función para actualizar una categoría
export async function updateCategoryInSheets(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    const sheetName = await getCategoriesSheetName();
    
    // Obtener todas las categorías para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${CATEGORIES_RANGE}`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex === -1) {
      console.error('Categoría no encontrada:', id);
      return false;
    }

    // Obtener datos actuales
    const currentRow = rows[rowIndex];
    const timestamp = new Date().toISOString();
    
    // Crear fila actualizada
    const updatedRow = [
      currentRow[0], // id (no cambia)
      updates.name || currentRow[1],
      updates.description !== undefined ? updates.description : currentRow[2],
      updates.slug || currentRow[3],
      updates.isActive !== undefined ? updates.isActive.toString().toUpperCase() : currentRow[4],
      currentRow[5], // createdAt (no cambia)
      timestamp, // updatedAt
    ];

    // Actualizar la fila específica (rowIndex + 2 porque empezamos en A2)
    const range = `${sheetName}!A${rowIndex + 2}:G${rowIndex + 2}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log(`Categoría actualizada exitosamente: ${id}`);
    return true;
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return false;
  }
}

// Función para eliminar una categoría
export async function deleteCategoryFromSheets(id: string): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsAuth();
    const sheetName = await getCategoriesSheetName();
    
    // Obtener todas las categorías para encontrar la fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${CATEGORIES_RANGE}`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex === -1) {
      console.error('Categoría no encontrada:', id);
      return false;
    }

    // Eliminar la fila (rowIndex + 2 porque empezamos en A2)
    const deleteRequest = {
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Asumiendo que es la primera hoja, ajustar si es necesario
              dimension: 'ROWS',
              startIndex: rowIndex + 1, // +1 porque las filas son 0-indexed pero empezamos en fila 2
              endIndex: rowIndex + 2,
            },
          },
        }],
      },
    };

    await sheets.spreadsheets.batchUpdate(deleteRequest);
    console.log(`Categoría eliminada exitosamente: ${id}`);
    return true;
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return false;
  }
}

// Función para generar slug a partir del nombre
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-'); // Remover guiones duplicados
}

// Función para configurar los encabezados de categorías
export async function setupCategoriesHeaders(): Promise<void> {
  try {
    const sheets = await getGoogleSheetsAuth();
    const sheetName = 'Categorias'; // Usar nombre fijo para setup
    
    // Verificar si la hoja 'Categorias' existe, si no, crearla
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const categoriesSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'Categorias'
    );

    if (!categoriesSheet) {
      // Crear la hoja de categorías
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Categorias',
              },
            },
          }],
        },
      });
    }

    // Configurar encabezados
    const headers = [
      'ID',
      'Nombre', 
      'Descripción',
      'Slug',
      'Activa',
      'Fecha Creación',
      'Fecha Actualización'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:G1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    console.log('Encabezados de categorías configurados exitosamente');
  } catch (error) {
    console.error('Error al configurar encabezados de categorías:', error);
    throw error;
  }
}
