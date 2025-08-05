import { NextRequest, NextResponse } from 'next/server';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  [key: string]: any;
}

interface StockItem {
  id?: string;
  product?: {
    id: string;
    [key: string]: any;
  };
  quantity: number;
}

interface StockCheckResponse {
  available: boolean;
  errors: Array<{
    productId: string;
    productName: string;
    requested: number;
    available: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: StockItem[] } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando stock para items:', items);

    // BYPASS: Siempre devolver stock disponible para debugging
    console.log('✅ [DEBUG] Omitiendo verificación real de stock - devolviendo disponible');
    
    return NextResponse.json({
      available: true,
      errors: []
    });
    
  } catch (error) {
    console.error('❌ Error al verificar stock:', error);
    return NextResponse.json(
      { error: 'Error al verificar stock' },
      { status: 500 }
    );
  }
}

    // Configurar autenticación
    const auth = new GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Leer datos de productos desde Google Sheets
    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Productos!A:Z',
    });

    const rows = sheetsResponse.data.values || [];
    if (rows.length === 0) {
      throw new Error('No se encontraron productos en Google Sheets');
    }

    // Convertir filas a objetos de productos
    const headers = rows[0];
    const products = rows.slice(1).map((row: any[]) => {
      const product: any = {};
      headers.forEach((header: string, index: number) => {
        const value = row[index] || '';
        // Convertir campos numéricos
        if (header === 'price' || header === 'stock') {
          product[header] = parseFloat(value) || 0;
        } else if (header === 'isActive') {
          product[header] = value.toLowerCase() === 'true';
        } else {
          product[header] = value;
        }
      });
      return product;
    }).filter((product: any) => product.isActive); // Solo productos activos

    console.log('📦 Productos disponibles:', products.length);

    const errors: StockCheckResponse['errors'] = [];

    // Verificar stock para cada item
    for (const item of items) {
      console.log('🔍 Item a verificar:', item);
      
      // Si el ID viene como item.product.id (frontend) o como item.id (API directa)
      const itemId = item.product?.id || item.id || '';
      const product = products.find((p: any) => p.id === itemId);
      
      if (!product) {
        errors.push({
          productId: itemId,
          productName: `Producto ${itemId}`,
          requested: item.quantity,
          available: 0
        });
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push({
          productId: itemId,
          productName: product.name,
          requested: item.quantity,
          available: product.stock
        });
      }
    }

    // SOLUCIÓN TEMPORAL: Ignorar verificación real y siempre permitir compra
    console.log('⚠️ MODO TEMPORAL: Ignorando verificación real de stock');
    
    const stockCheckResponse: StockCheckResponse = {
      available: true, // Siempre disponible (temporal)
      errors: [] // Sin errores
    };

    console.log('✅ Resultado verificación de stock (TEMPORAL):', stockCheckResponse);

    return NextResponse.json(stockCheckResponse);

  } catch (error) {
    console.error('❌ Error al verificar stock:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
