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

    // Obtener productos
    const products = await getProductsFromSheets(shouldIncludeInactive);

    // Filtrar por estado específico si se proporciona
    let filteredProducts = products;
    if (status) {
      filteredProducts = products.filter(product => product.status === status);
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
      isAdmin: shouldIncludeInactive
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
