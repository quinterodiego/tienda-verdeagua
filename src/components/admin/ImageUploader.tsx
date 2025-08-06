'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Move, Star } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  allowReorder?: boolean;
  minDimensions?: { width: number; height: number };
  maxFileSize?: number; // en MB
}

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

// Función helper para validar dimensiones de imagen
const validateImageDimensions = (file: File, minDimensions?: { width: number; height: number }): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!minDimensions) {
      resolve(true);
      return;
    }

    const img = document.createElement('img');
    img.onload = () => {
      const isValid = img.width >= minDimensions.width && img.height >= minDimensions.height;
      URL.revokeObjectURL(img.src); // Limpiar memoria
      resolve(isValid);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src); // Limpiar memoria
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
};

export default function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  className = '',
  allowReorder = true,
  minDimensions = { width: 400, height: 400 },
  maxFileSize = 5 // 5MB por defecto
}: ImageUploaderProps) {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length - uploadingImages.length;
    
    // Validar archivos uno por uno
    const validatedFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray.slice(0, remainingSlots)) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Tipo de archivo no permitido. Use JPG, PNG o WebP`);
        continue;
      }

      // Validar tamaño
      const maxSizeBytes = maxFileSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: Archivo demasiado grande. Máximo ${maxFileSize}MB`);
        continue;
      }

      // Validar dimensiones
      const hasValidDimensions = await validateImageDimensions(file, minDimensions);
      if (!hasValidDimensions && minDimensions) {
        errors.push(`${file.name}: Dimensiones mínimas requeridas: ${minDimensions.width}x${minDimensions.height}px`);
        continue;
      }

      validatedFiles.push(file);
    }

    // Mostrar errores si los hay
    if (errors.length > 0) {
      alert(`Errores en los archivos:\n${errors.join('\n')}`);
    }

    // Crear previews para archivos válidos
    const newUploadingImages: UploadingImage[] = validatedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    }));

    if (newUploadingImages.length > 0) {
      setUploadingImages(prev => [...prev, ...newUploadingImages]);

      // Subir cada archivo
      for (const uploadingImage of newUploadingImages) {
        await uploadSingleImage(uploadingImage);
      }
    }
  };

  const uploadSingleImage = async (uploadingImage: UploadingImage) => {
    try {
      const formData = new FormData();
      formData.append('file', uploadingImage.file);

      // Simular progreso
      const updateProgress = (progress: number) => {
        setUploadingImages(prev => 
          prev.map(img => 
            img.id === uploadingImage.id 
              ? { ...img, progress }
              : img
          )
        );
      };

      updateProgress(25);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      updateProgress(75);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir imagen');
      }

      const result = await response.json();
      updateProgress(100);

      // Agregar URL a la lista de imágenes
      setTimeout(() => {
        onImagesChange([...images, result.url]);
        setUploadingImages(prev => prev.filter(img => img.id !== uploadingImage.id));
        // Limpiar URL del objeto
        URL.revokeObjectURL(uploadingImage.preview);
      }, 500);

    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadingImages(prev => 
        prev.map(img => 
          img.id === uploadingImage.id 
            ? { ...img, error: error instanceof Error ? error.message : 'Error al subir' }
            : img
        )
      );
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const removeUploadingImage = (id: string) => {
    setUploadingImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  // Funciones para reordenar imágenes
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    if (!allowReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    if (!allowReorder || draggedIndex === null) return;
    e.preventDefault();
    
    if (draggedIndex !== index) {
      const newImages = [...images];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedImage);
      onImagesChange(newImages);
      setDraggedIndex(index);
    }
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveImageUp = (index: number) => {
    if (index > 0) {
      const newImages = [...images];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      onImagesChange(newImages);
    }
  };

  const moveImageDown = (index: number) => {
    if (index < images.length - 1) {
      const newImages = [...images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      onImagesChange(newImages);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = images.length + uploadingImages.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Imágenes ({images.length + uploadingImages.length}/{maxImages})
        </span>
        {!canAddMore && (
          <span className="text-xs text-gray-500">Máximo alcanzado</span>
        )}
      </div>

      {/* Área de subida */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging 
              ? 'border-[#68c3b7] bg-[#68c3b7]/5' 
              : 'border-gray-300 hover:border-[#68c3b7] hover:bg-gray-50'
            }
          `}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG o WebP hasta 5MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Imágenes subidas */}
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`relative group cursor-pointer transition-all duration-200 ${
              draggedIndex === index ? 'opacity-50 scale-95' : ''
            }`}
            draggable={allowReorder}
            onDragStart={(e) => handleImageDragStart(e, index)}
            onDragOver={(e) => handleImageDragOver(e, index)}
            onDragEnd={handleImageDragEnd}
          >
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-[#68c3b7]">
              <Image
                src={image}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
              
              {/* Indicador de imagen principal */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Principal
                </div>
              )}
              
              {/* Overlay con controles de reorden */}
              {allowReorder && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImageUp(index);
                        }}
                        className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 rounded p-1 transition-all"
                        title="Mover hacia arriba"
                      >
                        <Move className="w-4 h-4 rotate-180" />
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImageDown(index);
                        }}
                        className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 rounded p-1 transition-all"
                        title="Mover hacia abajo"
                      >
                        <Move className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Botón eliminar */}
            <button
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Indicador de posición */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Imágenes en proceso de subida */}
        {uploadingImages.map((uploadingImage) => (
          <div key={uploadingImage.id} className="relative group">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={uploadingImage.preview}
                alt="Subiendo..."
                fill
                className="object-cover"
              />
              
              {/* Overlay de progreso */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                {uploadingImage.error ? (
                  <div className="text-center">
                    <X className="w-6 h-6 text-red-400 mx-auto mb-1" />
                    <p className="text-xs text-red-400">Error</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-1" />
                    <p className="text-xs text-white">{uploadingImage.progress}%</p>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => removeUploadingImage(uploadingImage.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Placeholder cuando no hay imágenes */}
        {images.length === 0 && uploadingImages.length === 0 && (
          <div className="col-span-full">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay imágenes agregadas</p>
              <button
                onClick={openFileDialog}
                className="mt-2 text-[#68c3b7] hover:text-[#64b7ac] text-sm font-medium"
              >
                Agregar primera imagen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ayuda */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• La primera imagen será la imagen principal del producto (marcada con ⭐)</p>
        <p>• Tamaño mínimo: {minDimensions.width}x{minDimensions.height}px | Máximo por archivo: {maxFileSize}MB</p>
        <p>• Formatos permitidos: JPG, PNG, WebP</p>
        {allowReorder && <p>• Arrastra las imágenes para reordenarlas o usa los botones de movimiento</p>}
        <p>• Máximo {maxImages} imágenes por producto</p>
      </div>
    </div>
  );
}
