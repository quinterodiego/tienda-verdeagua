import { getGoogleSheetsAuth, SPREADSHEET_ID } from './google-sheets';
import crypto from 'crypto';

interface ResetTokenData {
  email: string;
  token: string;
  expiresAt: Date;
}

// Generar token seguro
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Guardar token en Google Sheets
export async function saveResetToken(email: string, token: string, expiresAt: Date): Promise<void> {
  try {
    console.log('🔐 Guardando token de reset para:', email);
    
    const sheets = await getGoogleSheetsAuth();
    
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID no está configurado');
    }

    // Verificar si la hoja ResetTokens existe
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const resetTokensSheet = spreadsheetInfo.data.sheets?.find(
      sheet => sheet.properties?.title === 'ResetTokens'
    );

    if (!resetTokensSheet) {
      // Crear la hoja ResetTokens
      console.log('📋 Creando hoja ResetTokens...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'ResetTokens',
                },
              },
            },
          ],
        },
      });

      // Agregar headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'ResetTokens!A1:E1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Email', 'Token', 'ExpiresAt', 'CreatedAt', 'Used']],
        },
      });
    }

    // Primero, limpiar tokens existentes para este email
    const existingTokens = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'ResetTokens!A:E',
    });

    if (existingTokens.data.values && existingTokens.data.values.length > 1) {
      const rows = existingTokens.data.values;
      const updatedRows = [rows[0]]; // Mantener el header
      
      // Filtrar filas que no sean del email actual
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] !== email) {
          updatedRows.push(rows[i]);
        }
      }

      // Si hay cambios, actualizar toda la hoja
      if (updatedRows.length !== rows.length) {
        // Limpiar la hoja y reescribir sin los tokens del email
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_ID,
          range: 'ResetTokens!A:E',
        });

        if (updatedRows.length > 1) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'ResetTokens!A1',
            valueInputOption: 'RAW',
            requestBody: {
              values: updatedRows,
            },
          });
        } else {
          // Solo mantener el header
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'ResetTokens!A1:E1',
            valueInputOption: 'RAW',
            requestBody: {
              values: [updatedRows[0]],
            },
          });
        }
      }
    }

    // Agregar nuevo token
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'ResetTokens!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          email,
          token,
          expiresAt.toISOString(),
          new Date().toISOString(),
          'false'
        ]],
      },
    });

    console.log('✅ Token guardado exitosamente en Google Sheets');
  } catch (error) {
    console.error('❌ Error guardando token:', error);
    throw error;
  }
}

// Validar token
export async function validateResetToken(token: string): Promise<ResetTokenData | null> {
  try {
    console.log('🔍 Validando token:', token);
    
    const sheets = await getGoogleSheetsAuth();
    
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID no está configurado');
    }

    // Obtener todos los tokens
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'ResetTokens!A:E',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      console.log('❌ No hay tokens en la hoja');
      return null;
    }

    // Buscar el token (omitir header en índice 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const [email, rowToken, expiresAtStr, , used] = row;
      
      console.log('🔍 Comparando:', { rowToken, used, searchToken: token });
      
      if (rowToken === token && used === 'false') {
        const expiresAt = new Date(expiresAtStr);
        const now = new Date();
        
        console.log('⏰ Comparando fechas:', {
          now: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          isExpired: now > expiresAt
        });

        if (now > expiresAt) {
          console.log('⏰ Token expirado');
          return null;
        }

        console.log('✅ Token válido encontrado');
        return {
          email,
          token: rowToken,
          expiresAt
        };
      }
    }

    console.log('❌ Token no encontrado o ya usado');
    return null;

  } catch (error) {
    console.error('❌ Error validando token:', error);
    return null;
  }
}

// Eliminar/marcar token como usado
export async function deleteResetToken(token: string): Promise<void> {
  try {
    console.log('🗑️ Marcando token como usado:', token);
    
    const sheets = await getGoogleSheetsAuth();
    
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID no está configurado');
    }

    // Obtener todos los tokens
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'ResetTokens!A:E',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return;
    }

    // Buscar el token y marcarlo como usado
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const [, rowToken] = row;
      
      if (rowToken === token) {
        // Actualizar la columna "Used" a "true"
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `ResetTokens!E${i + 1}`, // +1 porque las filas empiezan en 1
          valueInputOption: 'RAW',
          requestBody: {
            values: [['true']],
          },
        });
        
        console.log('✅ Token marcado como usado');
        return;
      }
    }

  } catch (error) {
    console.error('❌ Error eliminando token:', error);
    throw error;
  }
}
