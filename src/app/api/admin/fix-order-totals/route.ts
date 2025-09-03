import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔧 Iniciando corrección de totales de pedidos...');
  
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

    await ordersSheet.loadHeaderRow();
    const rows = await ordersSheet.getRows();

    let correctedCount = 0;
    const corrections = [];

    // Revisar cada pedido
    for (const row of rows) {
      try {
        const orderId = row.get('ID');
        const itemsData = row.get('Items (JSON)') || '[]';
        
        let items;
        try {
          items = JSON.parse(itemsData);
        } catch (e) {
          continue;
        }

        if (!Array.isArray(items) || items.length === 0) {
          continue;
        }

        // Calcular el total correcto
        const calculatedTotal = items.reduce((sum, item) => {
          const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price || 0;
          const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity || 0;
          return sum + (price * quantity);
        }, 0);

        // Obtener el total actual
        const currentTotal = parseFloat(row.get('Total')) || 0;

        // Si hay una diferencia significativa (más de 1 centavo)
        if (Math.abs(calculatedTotal - currentTotal) > 0.01) {
          console.log(`🔄 Corrigiendo ${orderId}: $${currentTotal} → $${calculatedTotal}`);
          
          // Actualizar el total en la hoja
          row.set('Total', calculatedTotal);
          await row.save();
          
          correctedCount++;
          corrections.push({
            orderId: orderId,
            oldTotal: currentTotal,
            newTotal: calculatedTotal,
            difference: calculatedTotal - currentTotal
          });
        }
      } catch (error) {
        console.error(`❌ Error procesando orden:`, error);
      }
    }

    console.log(`✅ Proceso completado. Se corrigieron ${correctedCount} pedidos`);

    return NextResponse.json({
      success: true,
      message: `Se corrigieron ${correctedCount} pedidos`,
      correctedCount,
      corrections
    });

  } catch (error) {
    console.error('💥 Error corrigiendo totales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para corregir totales de pedidos',
    usage: 'POST para ejecutar la corrección',
  });
}
