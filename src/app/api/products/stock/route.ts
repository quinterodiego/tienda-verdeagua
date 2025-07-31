import { NextRequest, NextResponse } from 'next/server';
import { getProductsFromSheets } from '@/lib/products-sheets';

// GET /api/products/stock - Verificar stock disponible
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get('ids')?.split(',') || [];

    if (productIds.length === 0) {
      return NextResponse.json({ error: 'IDs de productos requeridos' }, { status: 400 });
    }

    // Obtener productos desde Google Sheets (solo productos activos)
    const products = await getProductsFromSheets(false);
    
    // Filtrar solo los productos solicitados
    const requestedProducts = products.filter(product => productIds.includes(product.id));
    
    // Crear respuesta con stock actual
    const stockInfo = requestedProducts.map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stock || 0,
      available: (product.stock || 0) > 0
    }));

    // Verificar si algún producto no se encontró
    const missingProducts = productIds.filter(id => 
      !requestedProducts.find(product => product.id === id)
    );

    return NextResponse.json({
      success: true,
      products: stockInfo,
      missingProducts,
      allAvailable: stockInfo.every(p => p.available) && missingProducts.length === 0
    });

  } catch (error) {
    console.error('Error al verificar stock:', error);
    return NextResponse.json(
      { error: 'Error al verificar stock' },
      { status: 500 }
    );
  }
}

// POST /api/products/stock - Verificar stock para items específicos con cantidades
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items requeridos' }, { status: 400 });
    }

    // Obtener productos desde Google Sheets (solo productos activos)
    const products = await getProductsFromSheets(false);
    const productMap = new Map(products.map(p => [p.id, p]));

    // Verificar stock para cada item
    const stockCheck = items.map(item => {
      const product = productMap.get(item.productId);
      
      if (!product) {
        return {
          productId: item.productId,
          productName: 'Producto no encontrado',
          requestedQuantity: item.quantity,
          availableStock: 0,
          sufficient: false,
          error: 'Producto no encontrado'
        };
      }

      const available = product.stock || 0;
      const sufficient = available >= item.quantity;

      return {
        productId: item.productId,
        productName: product.name,
        requestedQuantity: item.quantity,
        availableStock: available,
        sufficient,
        error: sufficient ? null : `Stock insuficiente. Disponible: ${available}, solicitado: ${item.quantity}`
      };
    });

    const allSufficient = stockCheck.every(check => check.sufficient);
    const errors = stockCheck.filter(check => check.error);

    return NextResponse.json({
      success: true,
      allSufficient,
      checks: stockCheck,
      errors: errors.length > 0 ? errors : null,
      message: allSufficient 
        ? 'Stock suficiente para todos los productos' 
        : 'Stock insuficiente para algunos productos'
    });

  } catch (error) {
    console.error('Error al verificar stock:', error);
    return NextResponse.json(
      { error: 'Error al verificar stock' },
      { status: 500 }
    );
  }
}
