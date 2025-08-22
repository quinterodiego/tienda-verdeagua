import { NextResponse } from 'next/server';
import { updateAdminProductInSheets } from '@/lib/admin-products-sheets';

// POST /api/debug/fix-test-price - Corregir el precio del producto de prueba
export async function POST() {
  try {
    const productId = 'PROD-1755443587265'; // ID del producto "Prueba"
    const correctPrice = 5000; // Precio correcto que debería tener
    
    console.log(`🔧 Corrigiendo precio del producto ${productId} a ${correctPrice}`);
    
    const result = await updateAdminProductInSheets(productId, {
      price: correctPrice
    });
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: `Precio del producto "Prueba" corregido de 1 a ${correctPrice}`,
        productId,
        newPrice: correctPrice,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('No se pudo actualizar el producto');
    }
    
  } catch (error) {
    console.error('Error al corregir precio:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
