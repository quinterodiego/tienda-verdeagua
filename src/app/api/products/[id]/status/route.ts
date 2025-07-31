import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateProductStatus } from '@/lib/products-sheets';
import { ProductStatus } from '@/types';

// PATCH /api/products/[id]/status - Actualizar estado de producto
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que es admin (aquí deberías verificar el rol del usuario)
    const ADMIN_EMAILS = ['admin@techstore.com', 'dquintero@example.com'];
    if (!ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const productId = params.id;
    const body = await request.json();
    const { status } = body;

    // Validar estado
    const validStatuses: ProductStatus[] = ['active', 'inactive', 'pending', 'draft'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido. Debe ser: active, inactive, pending, o draft' },
        { status: 400 }
      );
    }

    // Actualizar estado
    const success = await updateProductStatus(productId, status);

    if (!success) {
      return NextResponse.json(
        { error: 'No se pudo actualizar el estado del producto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Producto ${productId} actualizado a estado: ${status}`,
      productId,
      newStatus: status
    });

  } catch (error) {
    console.error('Error al actualizar estado del producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
