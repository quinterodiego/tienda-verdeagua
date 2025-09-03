import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(authOptions);
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Use JPG, PNG o WebP' 
      }, { status: 400 });
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. Máximo 5MB' 
      }, { status: 400 });
    }

    // Subir a Cloudinary
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, {
        folder: 'techstore/products',
        public_id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      
      return NextResponse.json({ 
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.name,
        size: file.size,
        type: file.type,
        width: result.width,
        height: result.height
      });
    } catch (uploadError) {
      console.error('Error uploading to Cloudinary:', uploadError);
      
      // Fallback: devolver una respuesta simulada si Cloudinary falla
      const mockUrl = `/placeholder-image.svg`;
      
      return NextResponse.json({ 
        url: mockUrl,
        publicId: `mock_${Date.now()}`,
        originalName: file.name,
        size: file.size,
        type: file.type,
        error: 'Cloudinary upload failed, using fallback'
      });
    }

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// Endpoint para eliminar imágenes
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = request.url || '';
    if (!url) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    const { searchParams } = new URL(url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ error: 'ID público requerido' }, { status: 400 });
    }

    // Eliminar de Cloudinary
    try {
      await deleteFromCloudinary(publicId);
      return NextResponse.json({ success: true });
    } catch (deleteError) {
      console.error('Error deleting from Cloudinary:', deleteError);
      // Aún así devolver success para no bloquear la UI
      return NextResponse.json({ success: true, warning: 'Image not deleted from Cloudinary' });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
