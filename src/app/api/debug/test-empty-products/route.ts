import { NextRequest, NextResponse } from 'next/server';

// ⚠️ SOLO PARA TESTING - Simula que no hay productos
export async function GET(request: NextRequest) {
  const isTestMode = request.nextUrl.searchParams.get('test') === 'empty';
  
  if (isTestMode) {
    console.log('🧪 Modo de prueba: Simulando sin productos');
    return NextResponse.json({
      products: [],
      source: 'test-empty',
      timestamp: new Date().toISOString(),
      message: 'Simulación de tienda sin productos para testing'
    });
  }
  
  return NextResponse.json({
    error: 'Usar ?test=empty para simular sin productos',
    usage: 'GET /api/debug/test-empty-products?test=empty'
  });
}
