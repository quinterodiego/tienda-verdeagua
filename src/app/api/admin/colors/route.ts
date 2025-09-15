import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { 
  getColorsFromSheets,
  addColorToSheets,
  updateColorInSheets,
  deleteColorFromSheets
} from '@/lib/colors-sheets';

// GET /api/admin/colors - Obtener todos los colores
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const colors = await getColorsFromSheets();
    
    return NextResponse.json({
      success: true,
      colors: colors
    });
  } catch (error) {
    console.error('Error al obtener colores:', error);
    return NextResponse.json(
      { error: 'Error al obtener colores' },
      { status: 500 }
    );
  }
}

// POST /api/admin/colors - Crear un nuevo color
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.nombre) {
      return NextResponse.json({ error: 'El nombre del color es requerido' }, { status: 400 });
    }

    // Preparar datos del color
    const colorData = {
      nombre: body.nombre,
      disponible: body.disponible !== undefined ? body.disponible : true,
    };

    // Guardar color en Google Sheets
    const colorId = await addColorToSheets(colorData);
    
    if (!colorId) {
      return NextResponse.json(
        { error: 'Error al crear el color' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      colorId: colorId
    });

  } catch (error) {
    console.error('Error al crear color:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/colors - Actualizar un color
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID del color requerido' }, { status: 400 });
    }

    // Preparar actualizaciones
    const updates: any = {};
    
    if (body.nombre !== undefined) updates.nombre = body.nombre;
    if (body.disponible !== undefined) updates.disponible = body.disponible;

    // Actualizar en Google Sheets
    const success = await updateColorInSheets(body.id, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar el color' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Color actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar color:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/colors - Eliminar un color
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const colorId = searchParams.get('id');

    if (!colorId) {
      return NextResponse.json({ error: 'ID del color requerido' }, { status: 400 });
    }

    // Eliminar de Google Sheets
    const success = await deleteColorFromSheets(colorId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar el color' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Color eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar color:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
