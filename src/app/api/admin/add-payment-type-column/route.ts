import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔧 Agregando columna "Tipo de Pago" a la hoja de Pedidos...');
  
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

    // Obtener la hoja de pedidos
    const ordersSheet = doc.sheetsByTitle['Pedidos'];
    if (!ordersSheet) {
      console.error('❌ Hoja de pedidos no encontrada');
      return NextResponse.json({ error: 'Hoja de pedidos no encontrada' }, { status: 404 });
    }

    console.log('✅ Hoja de pedidos encontrada');
    
    await ordersSheet.loadHeaderRow();
    
    // Verificar si la columna ya existe
    const currentHeaders = ordersSheet.headerValues;
    console.log('📋 Headers actuales:', currentHeaders);
    
    if (currentHeaders.includes('Tipo de Pago')) {
      console.log('ℹ️ La columna "Tipo de Pago" ya existe');
      return NextResponse.json({
        success: true,
        message: 'La columna "Tipo de Pago" ya existe',
        existed: true
      });
    }

    // Agregar la nueva columna después de "Estado Pago"
    const newHeaders = [...currentHeaders];
    const estadoPagoIndex = newHeaders.indexOf('Estado Pago');
    
    if (estadoPagoIndex !== -1) {
      // Insertar después de "Estado Pago"
      newHeaders.splice(estadoPagoIndex + 1, 0, 'Tipo de Pago');
    } else {
      // Si no encuentra "Estado Pago", agregar al final
      newHeaders.push('Tipo de Pago');
    }

    console.log('📋 Nuevos headers:', newHeaders);

    // Actualizar los headers
    await ordersSheet.setHeaderRow(newHeaders);
    
    console.log('✅ Columna "Tipo de Pago" agregada exitosamente');

    // Opcional: llenar valores por defecto para pedidos existentes
    const rows = await ordersSheet.getRows();
    let updatedRows = 0;

    for (const row of rows) {
      try {
        // Si la fila no tiene valor en "Tipo de Pago", asignar "Mercado Pago" por defecto
        if (!row.get('Tipo de Pago')) {
          row.set('Tipo de Pago', 'Mercado Pago');
          await row.save();
          updatedRows++;
        }
      } catch (error) {
        console.error('Error actualizando fila:', error);
      }
    }

    console.log(`✅ Se actualizaron ${updatedRows} filas con valores por defecto`);

    return NextResponse.json({
      success: true,
      message: `Columna "Tipo de Pago" agregada exitosamente. Se actualizaron ${updatedRows} pedidos existentes.`,
      existed: false,
      updatedRows
    });

  } catch (error) {
    console.error('💥 Error agregando columna:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para agregar columna "Tipo de Pago"',
    usage: 'POST para ejecutar la adición',
  });
}
