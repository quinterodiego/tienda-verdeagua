/**
 * Utilidades para manejar URLs de seguimiento de paquetes
 */

export interface TrackingUrlData {
  url: string;
  trackingNumber: string;
}

/**
 * Genera la URL completa de seguimiento reemplazando el placeholder
 * @param trackingUrlTemplate - URL template con {tracking} como placeholder
 * @param trackingNumber - Número de seguimiento
 * @returns URL completa para el seguimiento
 */
export function generateTrackingUrl(trackingUrlTemplate: string, trackingNumber: string): string {
  if (!trackingUrlTemplate || !trackingNumber) {
    return '';
  }

  // Reemplazar {tracking} con el número de seguimiento
  return trackingUrlTemplate.replace('{tracking}', encodeURIComponent(trackingNumber));
}

/**
 * Valida si una URL de tracking template es válida
 * @param url - URL template a validar
 * @returns true si es válida, false si no
 */
export function validateTrackingUrlTemplate(url: string): boolean {
  if (!url) return true; // Permitir URL vacía
  
  try {
    // Verificar que contenga el placeholder {tracking}
    if (!url.includes('{tracking}')) {
      return false;
    }
    
    // Verificar que sea una URL válida reemplazando el placeholder
    const testUrl = url.replace('{tracking}', 'TEST123');
    new URL(testUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * URLs predefinidas de empresas de paquetería populares en Argentina
 */
export const POPULAR_TRACKING_URLS = {
  correoArgentino: {
    name: 'Correo Argentino',
    url: 'https://seguimiento.correoargentino.com.ar/seguimiento/{tracking}',
    description: 'Seguimiento oficial de Correo Argentino'
  },
  oca: {
    name: 'OCA',
    url: 'https://www1.oca.com.ar/OcaEpaktracking/Tracking.aspx?numero={tracking}',
    description: 'Seguimiento de paquetes OCA'
  },
  andreani: {
    name: 'Andreani',
    url: 'https://www.andreani.com/seguimiento?numero={tracking}',
    description: 'Seguimiento de envíos Andreani'
  },
  mercadoEnvios: {
    name: 'Mercado Envíos',
    url: 'https://www.mercadolibre.com.ar/ayuda/seguimiento?tracking={tracking}',
    description: 'Seguimiento de Mercado Envíos'
  },
  correoUruguayo: {
    name: 'Correo Uruguayo',
    url: 'https://www.correo.com.uy/seguimiento?codigo={tracking}',
    description: 'Seguimiento de Correo Uruguayo'
  },
  dhl: {
    name: 'DHL',
    url: 'https://www.dhl.com/ar-es/home/tracking.html?tracking-id={tracking}',
    description: 'Seguimiento internacional DHL'
  },
  fedex: {
    name: 'FedEx',
    url: 'https://www.fedex.com/es-ar/tracking.html?trknbr={tracking}',
    description: 'Seguimiento internacional FedEx'
  }
};

/**
 * Obtiene sugerencias de URLs basadas en el nombre de la empresa
 * @param companyName - Nombre de la empresa (parcial o completo)
 * @returns Array de sugerencias
 */
export function getTrackingUrlSuggestions(companyName: string = '') {
  const searchTerm = companyName.toLowerCase();
  
  return Object.entries(POPULAR_TRACKING_URLS)
    .filter(([key, data]) => 
      data.name.toLowerCase().includes(searchTerm) ||
      key.toLowerCase().includes(searchTerm)
    )
    .map(([key, data]) => ({
      key,
      ...data
    }));
}

/**
 * Extrae información de la URL para mostrar de forma amigable
 * @param url - URL de seguimiento
 * @returns Información formateada
 */
export function parseTrackingUrlInfo(url: string) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url.replace('{tracking}', 'TRACKING_NUMBER'));
    return {
      domain: urlObj.hostname,
      isSecure: urlObj.protocol === 'https:',
      hasPlaceholder: url.includes('{tracking}')
    };
  } catch {
    return null;
  }
}
