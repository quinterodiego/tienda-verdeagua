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
    console.log('🗑️ API: Solicitud de eliminación definitiva para producto:', params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      console.log('❌ API: Usuario no autorizado:', session?.user?.email);
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const productId = params.id;
    
    if (!productId) {
      console.log('❌ API: ID de producto faltante');
      return NextResponse.json(
        { error: 'ID de producto requerido' }, 
        { status: 400 }
      );
    }

    console.log('🔄 API: Ejecutando eliminación definitiva para:', productId);
    const success = await permanentlyDeleteAdminProductFromSheets(productId);
    
    if (success) {
      console.log('✅ API: Producto eliminado definitivamente:', productId);
      return NextResponse.json({
        success: true,
        message: 'Producto eliminado definitivamente'
      });
    } else {
      console.log('❌ API: Error al eliminar producto:', productId);
      return NextResponse.json(
        { error: 'Error al eliminar producto definitivamente' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ API: Error en eliminación definitiva:', error);
    console.error('❌ API: Stack trace:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' }, 
      { status: 500 }
    );
  }
}
