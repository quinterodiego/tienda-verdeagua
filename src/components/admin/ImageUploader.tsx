'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

export default function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  className = ''
}: ImageUploaderProps) {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length - uploadingImages.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    // Crear previews y comenzar subida
    const newUploadingImages: UploadingImage[] = filesToUpload.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    // Subir cada archivo
    for (const uploadingImage of newUploadingImages) {
      await uploadSingleImage(uploadingImage);
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
          <div key={index} className="relative group">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            </div>
            <button
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
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
        <p>• La primera imagen será la imagen principal del producto</p>
        <p>• Tamaño recomendado: 800x800px mínimo</p>
        <p>• Formato recomendado: JPG o WebP para mejor rendimiento</p>
      </div>
    </div>
  );
}
