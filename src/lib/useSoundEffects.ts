'use client';

import { useCallback } from 'react';
import { useThemeStore } from '@/lib/theme-store';

// Tipos de sonidos disponibles
type SoundType = 'click' | 'hover' | 'success' | 'error' | 'notification';

// URLs de sonidos (puedes reemplazar con archivos reales)
const sounds: Record<SoundType, string> = {
  click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2slCDOW2e+8diMFjoHO8tiJOQgZZ7zp5qRRFAxPqOLwt2MdBjOR2/LNeSsFJHfH8N6QQgkTXrPq66hWFAlGns/0vmsqBjOV2u/AeSMFjoHO8tiJOQgZZ7zp5qRRFAxPpuHxtHMdBjiS2e+8diMFjoHO8tiJOQgZZ7zp5aVSFAxOpODyu2wlBzSU2e6+eCUFmCOD...', // Sonido de click suave
  hover: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2slCDOW2e+8diMFjoHO8tiJOQgZZ7zp5qRRFAxPqOLwt2MdBjOR2/LNeSsFJHfH8N6QQgkTXrPq66hWFAlGns/0vmsqBjOV2u/AeSMFjoHO8tiJOQgZZ7zp5qRRFAxPpuHxtHMdBjiS2e+8diMFjoHO8tiJOQgZZ7zp5aVSFAxOpODyu2wlBzSU2e6+eCUFmCOD...', // Sonido de hover más suave
  success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2slCDOW2e+8diMFjoHO8tiJOQgZZ7zp5qRRFAxPqOLwt2MdBjOR2/LNeSsFJHfH8N6QQgkTXrPq66hWFAlGns/0vmsqBjOV2u/AeSMFjoHO8tiJOQgZZ7zp5qRRFAxPpuHxtHMdBjiS2e+8diMFjoHO8tiJOQgZZ7zp5aVSFAxOpODyu2wlBzSU2e6+eCUFmCOD...', // Sonido de éxito
  error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2slCDOW2e+8diMFjoHO8tiJOQgZZ7zp5qRRFAxPqOLwt2MdBjOR2/LNeSsFJHfH8N6QQgkTXrPq66hWFAlGns/0vmsqBjOV2u/AeSMFjoHO8tiJOQgZZ7zp5qRRFAxPpuHxtHMdBjiS2e+8diMFjoHO8tiJOQgZZ7zp5aVSFAxOpODyu2wlBzSU2e6+eCUFmCOD...', // Sonido de error
  notification: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2slCDOW2e+8diMFjoHO8tiJOQgZZ7zp5qRRFAxPqOLwt2MdBjOR2/LNeSsFJHfH8N6QQgkTXrPq66hWFAlGns/0vmsqBjOV2u/AeSMFjoHO8tiJOQgZZ7zp5qRRFAxPpuHxtHMdBjiS2e+8diMFjoHO8tiJOQgZZ7zp5aVSFAxOpODyu2wlBzSU2e6+eCUFmCOD...', // Sonido de notificación
};

export const useSoundEffects = () => {
  const { soundEffects } = useThemeStore();

  const playSound = useCallback((type: SoundType, volume: number = 0.1) => {
    if (!soundEffects || typeof window === 'undefined') return;

    try {
      const audio = new Audio(sounds[type]);
      audio.volume = Math.min(Math.max(volume, 0), 1); // Asegurar que el volumen esté entre 0 y 1
      audio.play().catch(() => {
        // Silenciar errores de audio para evitar logs en consola
        // Los errores de audio pueden ocurrir si el usuario no ha interactuado con la página
      });
    } catch (error) {
      // Silenciar errores de creación de audio
    }
  }, [soundEffects]);

  return {
    playClickSound: () => playSound('click'),
    playHoverSound: () => playSound('hover', 0.05),
    playSuccessSound: () => playSound('success'),
    playErrorSound: () => playSound('error'),
    playNotificationSound: () => playSound('notification'),
    playSound,
  };
};
