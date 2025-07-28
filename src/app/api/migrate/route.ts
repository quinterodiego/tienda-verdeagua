import { NextRequest, NextResponse } from 'next/server';
import { migrateProductsToSheets } from '@/lib/products-sheets';
import { createOrdersSheet } from '@/lib/setup-sheets';
import { products } from '@/data/products';

export async function POST() {
  try {
    // Migrar productos
    const productsSuccess = await migrateProductsToSheets(products);
    
    // Crear estructura de pedidos
    const ordersSuccess = await createOrdersSheet();
    
    if (productsSuccess && ordersSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Migración completada exitosamente. Se crearon las pestañas: Productos y Pedidos con sus respectivos encabezados.'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error en la migración'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error en migración:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor: ' + (error as Error).message
    }, { status: 500 });
  }
}
