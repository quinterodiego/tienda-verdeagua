import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { permanentlyDeleteAdminProductFromSheets } from '@/lib/admin-products-sheets';

// DELETE /api/admin/products/[id]/permanent-delete - Eliminar producto DEFINITIVAMENTE
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const productId = params.id;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'ID de producto requerido' }, 
        { status: 400 }
      );
    }

    const success = await permanentlyDeleteAdminProductFromSheets(productId);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Producto eliminado definitivamente'
      });
    } else {
      return NextResponse.json(
        { error: 'Error al eliminar producto definitivamente' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en API de eliminación definitiva:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
