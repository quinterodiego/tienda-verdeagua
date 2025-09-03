import { NextResponse } from 'next/server';
import { getProductsFromSheets } from '@/lib/products-sheets';
import { getAdminProductsFromSheets } from '@/lib/admin-products-sheets';

// GET /api/debug/price-comparison - Debug para comparar precios entre APIs
export async function GET() {
  try {
    console.log('🔍 Iniciando debug de comparación de precios...');
    
    // Obtener productos desde API pública
    const publicProducts = await getProductsFromSheets(false);
    console.log('📊 Productos API pública:', publicProducts.length);
    
    // Obtener productos desde API admin (sin autenticación para este debug)
    const adminProducts = await getAdminProductsFromSheets();
    console.log('📊 Productos API admin:', adminProducts.length);
    
    // Comparar cada producto
    const comparison = publicProducts.map(publicProduct => {
      const adminProduct = adminProducts.find(admin => admin.id === publicProduct.id);
      
      return {
        id: publicProduct.id,
        name: publicProduct.name,
        publicPrice: publicProduct.price,
        publicPriceType: typeof publicProduct.price,
        adminPrice: adminProduct?.price || 'No encontrado',
        adminPriceType: adminProduct ? typeof adminProduct.price : 'N/A',
        pricesMatch: adminProduct ? (publicProduct.price === adminProduct.price) : false,
        publicCategory: publicProduct.category,
        adminCategory: adminProduct?.category || 'No encontrado',
        publicStatus: publicProduct.status,
        adminActive: adminProduct?.isActive || false,
        rawPublicData: {
          price: publicProduct.price,
          category: publicProduct.category
        },
        rawAdminData: adminProduct ? {
          price: adminProduct.price,
          originalPrice: adminProduct.originalPrice,
          category: adminProduct.category,
          isActive: adminProduct.isActive
        } : null
      };
    });
    
    // Detectar problemas
    const issues = {
      missingInAdmin: comparison.filter(item => item.adminPrice === 'No encontrado'),
      priceMismatches: comparison.filter(item => !item.pricesMatch && item.adminPrice !== 'No encontrado'),
      suspiciouslyLowPrices: comparison.filter(item => 
        typeof item.publicPrice === 'number' && item.publicPrice < 10
      ),
      suspiciouslyHighPrices: comparison.filter(item => 
        typeof item.publicPrice === 'number' && item.publicPrice > 100000
      )
    };
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalPublicProducts: publicProducts.length,
        totalAdminProducts: adminProducts.length,
        missingInAdmin: issues.missingInAdmin.length,
        priceMismatches: issues.priceMismatches.length,
        suspiciouslyLowPrices: issues.suspiciouslyLowPrices.length,
        suspiciouslyHighPrices: issues.suspiciouslyHighPrices.length
      },
      issues,
      detailedComparison: comparison,
      debug: {
        note: 'Este endpoint compara precios entre la API pública y admin para detectar inconsistencias',
        recommendation: 'Si hay precios muy bajos o muy altos, revisar Google Sheets directamente'
      }
    });
    
  } catch (error) {
    console.error('Error en debug de precios:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
