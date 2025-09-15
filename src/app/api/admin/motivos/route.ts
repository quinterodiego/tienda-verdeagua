import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { 
  getMotivosFromSheets,
  addMotivoToSheets,
  updateMotivoInSheets,
  deleteMotivoFromSheets
} from '@/lib/motivos-sheets';

// GET /api/admin/motivos - Obtener todos los motivos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const motivos = await getMotivosFromSheets();
    
    return NextResponse.json({
      success: true,
      motivos: motivos
    });
  } catch (error) {
    console.error('Error al obtener motivos:', error);
    return NextResponse.json(
      { error: 'Error al obtener motivos' },
      { status: 500 }
    );
  }
}

// POST /api/admin/motivos - Crear un nuevo motivo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.nombre) {
      return NextResponse.json({ error: 'El nombre del motivo es requerido' }, { status: 400 });
    }

    // Preparar datos del motivo
    const motivoData = {
      nombre: body.nombre,
      disponible: body.disponible !== undefined ? body.disponible : true,
    };

    // Guardar motivo en Google Sheets
    const motivoId = await addMotivoToSheets(motivoData);
    
    if (!motivoId) {
      return NextResponse.json(
        { error: 'Error al crear el motivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      motivoId: motivoId
    });

  } catch (error) {
    console.error('Error al crear motivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/motivos - Actualizar un motivo
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID del motivo requerido' }, { status: 400 });
    }

    // Preparar actualizaciones
    const updates: Record<string, any> = {};
    
    if (body.nombre !== undefined) updates.nombre = body.nombre;
    if (body.disponible !== undefined) updates.disponible = body.disponible;

    // Actualizar en Google Sheets
    const success = await updateMotivoInSheets(body.id, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar el motivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Motivo actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar motivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/motivos - Eliminar un motivo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const motivoId = searchParams.get('id');

    if (!motivoId) {
      return NextResponse.json({ error: 'ID del motivo requerido' }, { status: 400 });
    }

    // Eliminar de Google Sheets
    const success = await deleteMotivoFromSheets(motivoId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar el motivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Motivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar motivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
