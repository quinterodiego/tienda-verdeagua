import { NextResponse } from 'next/server'
import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from '@/lib/google-sheets'

export async function GET() {
  try {
    const sheets = await getGoogleSheetsAuth()
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.USERS}!A:F`,
    })

    const rows = response.data.values || []
    
    // Mostrar estructura sin mostrar contraseñas hasheadas por seguridad
    const safeData = rows.map((row, index) => {
      if (index === 0) {
        // Headers
        return row
      }
      return [
        row[0] || '', // ID
        row[1] || '', // Nombre
        row[2] || '', // Email
        row[3] || '', // Imagen
        row[4] || '', // Fecha
        row[5] ? '[PASSWORD_HASH_HIDDEN]' : '' // Password (oculto por seguridad)
      ]
    })

    return NextResponse.json({
      success: true,
      message: 'Datos de usuarios (contraseñas ocultas por seguridad)',
      headers: rows[0] || [],
      users: safeData.slice(1), // Sin headers
      totalUsers: rows.length - 1,
      structure: {
        A: 'ID único del usuario',
        B: 'Nombre completo',
        C: 'Email',
        D: 'URL de imagen (opcional)',
        E: 'Fecha de creación',
        F: 'Contraseña hasheada con bcrypt (nivel 12)'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
