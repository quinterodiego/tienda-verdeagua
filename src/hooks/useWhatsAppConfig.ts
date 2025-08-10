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
        console.log('🔍 WhatsApp Hook: Iniciando carga de configuración...');
        
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
        console.log('🔍 WhatsApp Hook: Respuesta completa:', data);
        
        if (data.success && data.settings && data.settings.whatsapp && isMounted) {
          const whatsappSettings = data.settings.whatsapp;
          console.log('🔍 WhatsApp Hook: Configuración WhatsApp encontrada:', whatsappSettings);
          
          const newConfig: WhatsAppConfig = {
            phoneNumber: whatsappSettings.phone || defaultConfig.phoneNumber,
            welcomeMessage: whatsappSettings.welcomeMessage || defaultConfig.welcomeMessage,
            chatMessage: whatsappSettings.chatMessage || defaultConfig.chatMessage,
            businessName: data.settings.storeName || defaultConfig.businessName,
            isEnabled: whatsappSettings.enabled !== false
          };
          
          console.log('🔍 WhatsApp Hook: APLICANDO nueva configuración:', newConfig);
          setConfig(newConfig);
        } else {
          console.log('🚨 WhatsApp Hook: No se encontró configuración válida, usando defaults');
        }
      } catch (error) {
        console.error('🚨 WhatsApp Hook: Error cargando configuración:', error);
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
