// Configuración de Cloudinary
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Sube una imagen a Cloudinary
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: Record<string, unknown>;
  } = {}
): Promise<UploadResult> {
  try {
    let fileToUpload: string;
    
    if (Buffer.isBuffer(file)) {
      // Convert Buffer to base64 data URL
      fileToUpload = `data:image/jpeg;base64,${file.toString('base64')}`;
    } else if (typeof file === 'string') {
      fileToUpload = file;
    } else {
      throw new Error('Invalid file type. Expected string or Buffer.');
    }

    const result = await cloudinary.uploader.upload(fileToUpload, {
      folder: options.folder || 'techstore',
      public_id: options.public_id,
      transformation: options.transformation,
      resource_type: 'auto',
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Elimina una imagen de Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

/**
 * Extrae el publicId de una URL de Cloudinary
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // URLs de Cloudinary típicas:
    // https://res.cloudinary.com/[cloud_name]/image/upload/[transformations]/[publicId].[format]
    // https://res.cloudinary.com/[cloud_name]/image/upload/[publicId].[format]
    
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    // Dividir la URL por '/'
    const parts = url.split('/');
    
    // Encontrar el índice de 'upload'
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return null;
    }

    // El publicId puede estar después de transformaciones o directamente después de upload
    // Tomar todo desde después de upload hasta el final
    const afterUpload = parts.slice(uploadIndex + 1);
    
    // Si hay transformaciones (v1_1, c_fill, etc.), saltarlas
    let publicIdParts = afterUpload;
    
    // Filtrar transformaciones comunes
    publicIdParts = publicIdParts.filter(part => 
      !part.startsWith('c_') &&
      !part.startsWith('w_') &&
      !part.startsWith('h_') &&
      !part.startsWith('f_') &&
      !part.startsWith('q_') &&
      !part.startsWith('v') &&
      part !== 'auto'
    );

    if (publicIdParts.length === 0) {
      return null;
    }

    // Unir las partes y remover la extensión
    const publicIdWithExtension = publicIdParts.join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remover extensión
    
    return publicId;
  } catch (error) {
    console.error('Error extracting publicId from URL:', error);
    return null;
  }
}

/**
 * Elimina una imagen de Cloudinary usando su URL
 */
export async function deleteImageByUrl(imageUrl: string): Promise<boolean> {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      console.warn('No se pudo extraer publicId de la URL:', imageUrl);
      return false;
    }

    console.log('🗑️ Eliminando imagen de Cloudinary con publicId:', publicId);
    const result = await deleteFromCloudinary(publicId);
    
    if (result) {
      console.log('✅ Imagen eliminada exitosamente de Cloudinary');
    } else {
      console.warn('⚠️ No se pudo eliminar la imagen de Cloudinary');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error al eliminar imagen por URL:', error);
    return false;
  }
}

/**
 * Genera una URL optimizada para una imagen de Cloudinary
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width || 'auto',
    height: options.height || 'auto',
    quality: options.quality || 'auto',
    format: options.format || 'auto',
    crop: options.crop || 'fill',
    fetch_format: 'auto',
    dpr: 'auto',
    responsive: true,
    secure: true,
  });
}

/**
 * Genera una URL de transformación para una imagen
 */
export function getTransformedImageUrl(
  publicId: string,
  transformations: Record<string, unknown>
): string {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true,
  });
}

/**
 * Genera múltiples tamaños para una imagen responsiva
 */
export function getResponsiveImageUrls(publicId: string): {
  small: string;
  medium: string;
  large: string;
  thumbnail: string;
} {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 1200 }),
  };
}

/**
 * Verifica si Cloudinary está configurado correctamente
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export default cloudinary;
