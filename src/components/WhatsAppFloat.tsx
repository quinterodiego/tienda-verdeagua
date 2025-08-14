'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useWhatsAppConfig } from '@/hooks/useWhatsAppConfig';
import { XIcon } from './Icons';

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
      <div className="fixed bottom-8 right-4 z-[9999] max-w-none">
        <div className="relative">
          {/* Animación de pulso de fondo */}
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-pulse"></div>
          
          {/* Botón principal - usando clases del tema */}
          <button
            onClick={handleWhatsAppClick}
            className="relative bg-[#25D366] hover:bg-[#20c55a] active:bg-[#1cb552] text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 touch-manipulation block"
            aria-label="Contactar por WhatsApp"
            style={{ minWidth: '50px', minHeight: '50px' }}
          >
            {/* Icono */}
            <Image
              src="/whatsapp.png"
              alt="WhatsApp"
              width={24}
              height={24}
              className="object-contain relative z-10 w-6 h-6 mx-auto"
            />
          </button>

          {/* Botón de cerrar - solo visible en hover/focus */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -top-1 -right-1 bg-gray-800 hover:bg-gray-900 text-white p-1 rounded-full shadow-lg text-xs opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
            aria-label="Ocultar WhatsApp"
            title="Ocultar chat"
          >
            <XIcon className="w-2 h-2" />
          </button>
        </div>
      </div>
    </>
  );
}
