import { NextRequest, NextResponse } from 'next/server';
import { 
  addCategoryToSheets, 
  updateCategoryInSheets, 
  deleteCategoryFromSheets
} from '../../../../lib/categories-sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, isActive = true } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const newCategoryId = await addCategoryToSheets({
      name,
      description,
      isActive,
    });

    if (newCategoryId) {
      return NextResponse.json({ 
        success: true, 
        id: newCategoryId,
        message: 'Categoría creada exitosamente' 
      });
    } else {
      return NextResponse.json(
        { error: 'Error al crear categoría' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en POST /api/admin/categories:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (name) {
      updates.name = name;
    }
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const success = await updateCategoryInSheets(id, updates);

    if (success) {
      return NextResponse.json({ 
        success: true,
        message: 'Categoría actualizada exitosamente' 
      });
    } else {
      return NextResponse.json(
        { error: 'Error al actualizar categoría' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en PUT /api/admin/categories:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const success = await deleteCategoryFromSheets(id);

    if (success) {
      return NextResponse.json({ 
        success: true,
        message: 'Categoría eliminada exitosamente' 
      });
    } else {
      return NextResponse.json(
        { error: 'Error al eliminar categoría' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en DELETE /api/admin/categories:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
