import { NextRequest, NextResponse } from 'next/server';

// Endpoint para debugging del filtrado de productos
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Iniciando test de productos...');
    
    // Simular request a la API de productos
    const apiUrl = new URL('/api/products', request.url);
    
    const response = await fetch(apiUrl.toString());
    const data = await response.json();
    
    const analysis = {
      timestamp: new Date().toISOString(),
      totalProducts: data.products?.length || 0,
      productStates: {},
      inactiveProducts: [],
      pendingProducts: [],
      draftProducts: [],
      activeProducts: [],
      debug: data.debug,
      isAdmin: data.isAdmin
    };
    
    if (data.products) {
      data.products.forEach(product => {
        const status = product.status || 'NO_STATUS';
        
        // Contar por estado
        analysis.productStates[status] = (analysis.productStates[status] || 0) + 1;
        
        // Categorizar productos
        switch (status) {
          case 'inactive':
            analysis.inactiveProducts.push({ id: product.id, name: product.name });
            break;
          case 'pending':
            analysis.pendingProducts.push({ id: product.id, name: product.name });
            break;
          case 'draft':
            analysis.draftProducts.push({ id: product.id, name: product.name });
            break;
          case 'active':
            analysis.activeProducts.push({ id: product.id, name: product.name });
            break;
          default:
            analysis.activeProducts.push({ id: product.id, name: product.name, note: 'defaulted to active' });
        }
      });
    }
    
    // Determinar si hay problema
    const hasInactiveVisible = analysis.inactiveProducts.length > 0;
    const hasPendingVisible = analysis.pendingProducts.length > 0;
    const hasDraftVisible = analysis.draftProducts.length > 0;
    
    analysis.hasProblem = hasInactiveVisible || hasPendingVisible || hasDraftVisible;
    analysis.problemDescription = [];
    
    if (hasInactiveVisible) {
      analysis.problemDescription.push(`${analysis.inactiveProducts.length} productos inactivos visibles`);
    }
    if (hasPendingVisible) {
      analysis.problemDescription.push(`${analysis.pendingProducts.length} productos pendientes visibles`);
    }
    if (hasDraftVisible) {
      analysis.problemDescription.push(`${analysis.draftProducts.length} productos draft visibles`);
    }
    
    return NextResponse.json({
      success: true,
      analysis,
      recommendation: analysis.hasProblem 
        ? "🚨 PROBLEMA DETECTADO: Usuarios públicos ven productos no activos"
        : "✅ FILTRADO CORRECTO: Solo productos activos visibles"
    });
    
  } catch (error) {
    console.error('Error en debug de productos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en análisis de productos',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
