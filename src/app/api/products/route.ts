import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductsFromSheets } from '@/lib/products-sheets';

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

    // Obtener productos con fallback a productos estáticos si hay error
    let products = [];
    try {
      // SIEMPRE obtener todos los productos primero, luego filtraremos
      products = await getProductsFromSheets(true); // true = incluir todos
      console.log(`📊 Productos obtenidos de Google Sheets: ${products.length}`);
      
    } catch (error) {
      console.error('Error al obtener productos desde Google Sheets, usando fallback:', error);
      
      // Fallback a productos estáticos del archivo de datos
      const { products: staticProducts } = await import('@/data/products');
      products = staticProducts.map(p => ({ 
        ...p, 
        status: (p.status || 'active') as 'active' | 'inactive' | 'pending' | 'draft'
      }));
      console.log(`📊 Productos obtenidos de fallback: ${products.length}`);
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

    // FILTRADO PRINCIPAL: Para usuarios no admin, solo productos activos
    if (!shouldIncludeInactive) {
      const beforeCount = filteredProducts.length;
      filteredProducts = filteredProducts.filter(product => product.status === 'active');
      console.log(`🔒 FILTRADO PÚBLICO: ${beforeCount} -> ${filteredProducts.length} productos activos`);
      console.log(`✅ Productos finales para usuario público:`, filteredProducts.map(p => ({ id: p.id, name: p.name, status: p.status })));
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
