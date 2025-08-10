import { useState, useEffect } from 'react';

interface WhatsAppConfig {
  phoneNumber: string;
  welcomeMessage: string;
  chatMessage: string;
  businessName: string;
  isEnabled: boolean;
}

const defaultConfig: WhatsAppConfig = {
  phoneNumber: '5491234567890',
  welcomeMessage: '¡Hola! 👋 ¿Tienes alguna consulta sobre nuestros productos personalizados?',
  chatMessage: '¡Hola! Me interesa conocer más sobre los productos personalizados de Verde Agua.',
  businessName: 'Verde Agua Personalizados',
  isEnabled: true
};

export function useWhatsAppConfig(): WhatsAppConfig {
  const [config, setConfig] = useState<WhatsAppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        // Usar timestamp para evitar cache
        const response = await fetch(`/api/admin/settings?_t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.settings && data.settings.whatsapp && isMounted) {
          const whatsappSettings = data.settings.whatsapp;
          
          const newConfig: WhatsAppConfig = {
            phoneNumber: whatsappSettings.phone || defaultConfig.phoneNumber,
            welcomeMessage: whatsappSettings.welcomeMessage || defaultConfig.welcomeMessage,
            chatMessage: whatsappSettings.chatMessage || defaultConfig.chatMessage,
            businessName: data.settings.storeName || defaultConfig.businessName,
            isEnabled: whatsappSettings.enabled !== false
          };
          
          setConfig(newConfig);
        }
      } catch (error) {
        console.error('Error cargando configuración de WhatsApp:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  return config;
}
