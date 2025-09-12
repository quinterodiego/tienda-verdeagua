import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductsWithFallback } from '@/lib/products-fallback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const status = searchParams.get('status'); // Filtrar por estado específico
    const isAdmin = searchParams.get('admin') === 'true';

    let shouldIncludeInactive = false;

    // Si solicita incluir inactivos o es admin, verificar permisos
    if (includeInactive || isAdmin) {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      // Verificar que es admin
      const ADMIN_EMAILS = ['admin@techstore.com', 'dquintero@example.com'];
      if (ADMIN_EMAILS.includes(session.user?.email || '')) {
        shouldIncludeInactive = true;
      }
    }

    console.log(`🔍 API Request - shouldIncludeInactive: ${shouldIncludeInactive}, isAdmin: ${isAdmin}, includeInactive: ${includeInactive}`);

    // Obtener productos con fallback robusto
    let products = [];
    try {
      // CAMBIO CRÍTICO: Usar el parámetro correcto para el filtrado
      // shouldIncludeInactive define si incluir productos inactivos según permisos
      products = await getProductsWithFallback(shouldIncludeInactive);
      console.log(`📊 Productos obtenidos: ${products.length}`);
      
      // VERIFICAR si realmente obtuvo los productos correctos según permisos
      const statusCount: Record<string, number> = {};
      products.forEach(p => {
        const status = p.status || 'no-status';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      console.log(`🔍 Productos por estado:`, statusCount);
      
    } catch (error) {
      console.error('❌ Error crítico al obtener productos:', error);
      
      // Como último recurso, usar productos locales directamente
      const { products: staticProducts } = await import('@/data/products');
      const mappedProducts = staticProducts.map(p => ({ 
        ...p, 
        status: (p.status || 'active') as 'active' | 'inactive' | 'pending' | 'draft'
      }));
      
      // Aplicar el mismo filtrado que en Google Sheets
      products = shouldIncludeInactive 
        ? mappedProducts
        : mappedProducts.filter(p => p.status === 'active');
        
      console.log(`📊 Productos obtenidos de fallback de emergencia (${shouldIncludeInactive ? 'todos' : 'solo activos'}): ${products.length}`);
    }

    // Asegurar que todos los productos tengan un status válido
    products = products.map(p => ({
      ...p,
      status: p.status || 'active'
    }));

    console.log(`🔍 Estados de productos:`, products.map(p => ({ id: p.id, name: p.name, status: p.status })));

    // Filtrar por estado específico si se proporciona
    let filteredProducts = products;
    if (status) {
      filteredProducts = products.filter(product => product.status === status);
      console.log(`🎯 Filtrado por status '${status}': ${filteredProducts.length} productos`);
    }

    // FILTRADO FINAL Y SEGURO - Esta es la última línea de defensa
    // Para cualquier request que NO sea de admin, filtrar todo lo que no sea 'active'
    if (!shouldIncludeInactive) {
      console.log(`🚨 APLICANDO FILTRADO DE SEGURIDAD PARA USUARIO PÚBLICO`);
      console.log(`📊 Productos antes del filtrado final:`, filteredProducts.map(p => ({ id: p.id, name: p.name, status: p.status })));
      
      // Filtrado SUPER ESTRICTO - solo 'active' exacto
      filteredProducts = filteredProducts.filter(product => {
        const isActive = product.status === 'active';
        if (!isActive) {
          console.log(`� BLOQUEANDO producto no activo para usuario público: ${product.name} (status: '${product.status}')`);
        }
        return isActive;
      });
      
      console.log(`✅ FILTRADO FINAL COMPLETADO: ${filteredProducts.length} productos activos para usuario público`);
      console.log(`📋 Lista final de productos:`, filteredProducts.map(p => ({ id: p.id, name: p.name, status: p.status })));
      
      // VALIDACIÓN ADICIONAL - Verificar que NO hay productos no activos
      const invalidProducts = filteredProducts.filter(p => p.status !== 'active');
      if (invalidProducts.length > 0) {
        console.error(`🚨 ERROR CRÍTICO: Se detectaron productos no activos que pasaron el filtro:`, invalidProducts);
        // Filtrar nuevamente como medida de seguridad
        filteredProducts = filteredProducts.filter(p => p.status === 'active');
      }
    } else {
      console.log(`👑 Usuario admin - mostrando todos los productos: ${filteredProducts.length}`);
    }

    // Agregar estadísticas para admins
    let stats = undefined;
    if (shouldIncludeInactive) {
      stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        inactive: products.filter(p => p.status === 'inactive').length,
        pending: products.filter(p => p.status === 'pending').length,
        draft: products.filter(p => p.status === 'draft').length,
      };
    }

    return NextResponse.json({
      success: true,
      products: filteredProducts,
      count: filteredProducts.length,
      stats,
      isAdmin: shouldIncludeInactive,
      debug: {
        isPublicRequest: !shouldIncludeInactive,
        totalBeforeFiltering: products.length,
        finalCount: filteredProducts.length
      }
    }, {
      headers: {
        'Cache-Control': shouldIncludeInactive 
          ? 'no-cache, no-store, must-revalidate' // Admin data - no cache
          : 'public, s-maxage=60, stale-while-revalidate=120', // Public data - 1min cache, 2min stale
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Aquí podrías agregar lógica para crear nuevos productos
    return NextResponse.json(
      { error: 'Método no implementado' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
