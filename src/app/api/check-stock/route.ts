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
