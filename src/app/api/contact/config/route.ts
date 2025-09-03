import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { GoogleSpreadsheet } = await import('google-spreadsheet');
    const { JWT } = await import('google-auth-library');

    // Configurar autenticación
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Abrir la hoja de cálculo
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();

    // Buscar la hoja de configuración
    let settingsSheet = doc.sheetsByTitle['Configuracion'];
    
    if (!settingsSheet) {
      // Si no existe, usar valores por defecto desde .env
      const contactFormEmail = process.env.EMAIL_FROM || 'd86webs@gmail.com';
      return NextResponse.json({
        success: true,
        contactFormEmail
      });
    }

    // Cargar los headers y filas
    await settingsSheet.loadHeaderRow();
    const rows = await settingsSheet.getRows();

    // Buscar el email para formulario de contacto
    let contactFormEmail = process.env.EMAIL_FROM || 'd86webs@gmail.com';
    let contactEmail = '';

    for (const row of rows) {
      const key = row.get('Clave');
      const value = row.get('Valor');
      
      if (key === 'contactFormEmail' && value) {
        contactFormEmail = value;
      } else if (key === 'contactEmail' && value) {
        contactEmail = value;
      }
    }

    // Si no hay contactFormEmail configurado, usar contactEmail como fallback
    if (!contactFormEmail && contactEmail) {
      contactFormEmail = contactEmail;
    }

    return NextResponse.json({
      success: true,
      contactFormEmail
    });

  } catch (error) {
    console.error('Error obteniendo configuración de contacto:', error);
    // Fallback a variable de entorno
    const contactFormEmail = process.env.EMAIL_FROM || 'd86webs@gmail.com';
    return NextResponse.json({
      success: true,
      contactFormEmail
    });
  }
}
