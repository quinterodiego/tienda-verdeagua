import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoogleSheetsAuth, SPREADSHEET_ID, SHEET_NAMES } from '@/lib/google-sheets';

// POST /api/orders/mercadopago - Crear pedido inicial para MercadoPago
export async function POST(request: NextRequest) {
  try {
    console.log('📩 Creando pedido inicial para MercadoPago...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2));
    
    const {
      orderId,
      items,
      total,
      customerInfo,
      shippingAddress,
      paymentMethod = 'mercadopago',
      paymentStatus = 'pending',
      status = 'payment_pending',
      notes = ''
    } = body;

    // Validaciones básicas
    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Datos faltantes', 
        details: 'orderId, items son requeridos' 
      }, { status: 400 });
    }

    // Verificar configuración de Google Sheets
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_CLIENT_EMAIL) {
      console.log('⚠️ Google Sheets no configurado, simulando guardado exitoso');
      return NextResponse.json({
        success: true,
        orderId: orderId,
        message: 'Pedido simulado (Google Sheets no configurado)',
        debug: true
      });
    }

    try {
      const sheets = await getGoogleSheetsAuth();
      
      // Preparar datos del cliente
      const customerName = customerInfo?.firstName && customerInfo?.lastName 
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : session.user.name || '';
      
      const customerEmail = customerInfo?.email || session.user.email || '';
      
      // Convertir items a JSON
      const itemsJson = JSON.stringify(items.map((item: any) => ({
        productId: item.productId || item.id,
        productName: item.productName || item.name || item.title,
        quantity: item.quantity || 1,
        price: item.price || item.unit_price || 0,
      })));

      // Preparar dirección de envío como string
      const shippingAddressStr = shippingAddress ? 
        `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}, ${shippingAddress.address || ''}, ${shippingAddress.city || ''}, ${shippingAddress.state || ''}, ${shippingAddress.zipCode || ''}, ${shippingAddress.phone || ''}`.trim() :
        'Información de envío no disponible';

      // Preparar fila para Google Sheets
      const values = [[
        orderId,                    // A: ID del pedido
        customerEmail,              // B: Email del cliente
        customerName,               // C: Nombre del cliente
        total,                      // D: Total
        status,                     // E: Estado
        itemsJson,                  // F: Items (JSON)
        shippingAddressStr,         // G: Dirección de envío
        '',                         // H: Payment ID (se llenará con webhook)
        paymentStatus,              // I: Estado del pago
        new Date().toISOString(),   // J: Fecha de creación
        paymentMethod,              // K: Método de pago
        '',                         // L: Tracking number
        notes || ''                 // M: Notas
      ]];

      console.log('💾 Guardando en Google Sheets...', values[0]);

      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.ORDERS}!A:M`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: values,
        },
      });

      console.log('✅ Pedido guardado exitosamente en Google Sheets');
      console.log('📊 Resultado:', result.data);

      return NextResponse.json({
        success: true,
        orderId: orderId,
        message: 'Pedido inicial creado exitosamente'
      });

    } catch (sheetsError) {
      console.error('❌ Error específico de Google Sheets:', sheetsError);
      return NextResponse.json({
        error: 'Error al guardar en Google Sheets',
        details: sheetsError instanceof Error ? sheetsError.message : String(sheetsError)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
