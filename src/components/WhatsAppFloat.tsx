'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useWhatsAppConfig } from '@/hooks/useWhatsAppConfig';

export default function WhatsAppFloat() {
  const config = useWhatsAppConfig();
  const [isVisible, setIsVisible] = useState(true);

  // No renderizar si WhatsApp está deshabilitado
  if (!config.isEnabled) return null;

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(config.chatMessage);
    const whatsappUrl = `https://wa.me/${config.phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Botón flotante principal */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="relative">
          {/* Botón principal */}
          <button
            onClick={handleWhatsAppClick}
            className="relative bg-white hover:bg-gray-50 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group"
            aria-label="Contactar por WhatsApp"
          >
            {/* Animación de pulso */}
            {/* <div className="absolute inset-0 rounded-full bg-gray-100 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full bg-white animate-pulse"></div> */}
            
            {/* Icono */}
            <Image
              src="/whatsapp.png"
              alt="WhatsApp"
              width={40}
              height={40}
              className="object-contain relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 drop-shadow-md"
            />
          </button>
        </div>
      </div>

      {/* Botón de cerrar (solo visible al hacer hover en el área) */}
      <div className="fixed bottom-4 right-16 sm:bottom-6 sm:right-24 z-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => setIsVisible(false)}
          className="bg-gray-600 hover:bg-gray-700 text-white p-1.5 sm:p-2 rounded-full shadow-lg text-xs"
          aria-label="Ocultar WhatsApp"
          title="Ocultar chat"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </>
  );
}
