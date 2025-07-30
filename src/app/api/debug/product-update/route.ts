import { NextRequest, NextResponse } from 'next/server';

// Endpoint temporal para debug de producto update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 [DEBUG] Datos recibidos para update de producto:');
    console.log('📦 Body completo:', JSON.stringify(body, null, 2));
    console.log('🆔 ID del producto:', body.id);
    console.log('📝 Nombre:', body.name);
    console.log('💰 Precio:', body.price);
    console.log('🏷️ Categoría:', body.category);
    
    return NextResponse.json({
      success: true,
      message: 'Debug exitoso',
      receivedData: body
    });
  } catch (error) {
    console.error('❌ Error en debug endpoint:', error);
    return NextResponse.json(
      { error: 'Error en debug' },
      { status: 500 }
    );
  }
}
