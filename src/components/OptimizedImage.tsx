'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  transformation?: 'card' | 'thumbnail' | 'gallery' | 'hero' | 'mobile';
  priority?: boolean;
  sizes?: string;
}

// Transformaciones para diferentes usos
const imageTransformations = {
  thumbnail: 'w_150,h_150,c_fill,q_auto,f_auto',
  card: 'w_300,h_300,c_fill,q_auto,f_auto',
  gallery: 'w_800,h_800,c_limit,q_auto,f_auto',
  hero: 'w_1200,h_800,c_fill,q_auto,f_auto',
  mobile: 'w_400,h_400,c_fill,q_auto,f_auto'
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  transformation = 'card',
  priority = false,
  sizes
}: OptimizedImageProps) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generar URL optimizada para Cloudinary
  const getOptimizedSrc = (originalSrc: string, transform: string) => {
    if (originalSrc.includes('res.cloudinary.com')) {
      // Si ya es una URL de Cloudinary, agregar transformaciones
      return originalSrc.replace('/upload/', `/upload/${transform}/`);
    } else if (originalSrc.includes('cloudinary.com')) {
      // Otras variantes de URL de Cloudinary
      return originalSrc.replace('/upload/', `/upload/${transform}/`);
    }
    // Si no es Cloudinary, devolver la URL original
    return originalSrc;
  };
  
  const optimizedSrc = getOptimizedSrc(src, imageTransformations[transformation]);
  const fallbackSrc = '/placeholder-image.svg';
  
  // Placeholder blur (1x1 pixel gris)
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoading(false);
  };

  const imageProps = {
    src: isError ? fallbackSrc : optimizedSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onLoad: handleLoad,
    onError: handleError,
    placeholder: 'blur' as const,
    blurDataURL,
    priority,
    sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return (
    <Image
      {...imageProps}
      width={width || 300}
      height={height || 300}
    />
  );
}

// Hook para generar URLs optimizadas manualmente
export function useOptimizedImageUrl(src: string, transformation: keyof typeof imageTransformations = 'card') {
  if (src.includes('res.cloudinary.com')) {
    return src.replace('/upload/', `/upload/${imageTransformations[transformation]}/`);
  }
  return src;
}
