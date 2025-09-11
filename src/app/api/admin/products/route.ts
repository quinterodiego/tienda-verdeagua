import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { 
  getAdminProductsFromSheets, 
  addAdminProductToSheets, 
  updateAdminProductInSheets, 
  deleteAdminProductFromSheets,
  permanentlyDeleteAdminProductFromSheets,
  AdminProduct 
} from '@/lib/admin-products-sheets';

// GET /api/admin/products - Obtener todos los productos para admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const products = await getAdminProductsFromSheets();
    
    return NextResponse.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error al obtener productos de admin:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Crear un nuevo producto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.name || !body.description || !body.price || !body.category) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    // Preparar datos del producto
    const productData: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'> = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : undefined,
      category: body.category,
      subcategory: body.subcategory || '',
      images: body.images || [],
      stock: parseInt(body.stock) || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      sku: body.sku || `SKU-${Date.now()}`,
      brand: body.brand || '',
      tags: body.tags || [],
      medidas: body.medidas || '', // Campo medidas
      color: body.color || '' // Campo color
    };

    // Guardar producto en Google Sheets
    const productId = await addAdminProductToSheets(productData);
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Error al crear el producto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productId: productId
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products - Actualizar un producto
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID del producto requerido' }, { status: 400 });
    }

    // Preparar actualizaciones
    const updates: Partial<AdminProduct> = {};
    
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) updates.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : undefined;
    if (body.category !== undefined) updates.category = body.category;
    if (body.subcategory !== undefined) updates.subcategory = body.subcategory;
    if (body.images !== undefined) updates.images = body.images;
    if (body.stock !== undefined) updates.stock = parseInt(body.stock);
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.brand !== undefined) updates.brand = body.brand;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.medidas !== undefined) updates.medidas = body.medidas; // Campo medidas
    if (body.color !== undefined) updates.color = body.color; // Campo color

    // Actualizar en Google Sheets
    const success = await updateAdminProductInSheets(body.id, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar el producto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products - Eliminar (desactivar) un producto
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const productId = body.id;

    if (!productId) {
      return NextResponse.json({ error: 'ID del producto requerido' }, { status: 400 });
    }

    // Eliminar (desactivar) en Google Sheets
    const success = await deleteAdminProductFromSheets(productId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar el producto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
