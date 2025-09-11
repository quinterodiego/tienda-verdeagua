/**
 * Utilidades para generar y manejar IDs de pedidos
 */

/**
 * Genera un ID único para pedidos
 * Formato: ORD-YYYYMMDD-XXXX donde XXXX es un número secuencial
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Usar timestamp para garantizar unicidad, pero más corto
  const timestamp = Date.now();
  const shortId = timestamp.toString().slice(-6); // Últimos 6 dígitos
  
  return `ORD-${year}${month}${day}-${shortId}`;
}

/**
 * Genera un ID simple para pedidos (formato anterior)
 * Mantenido por compatibilidad
 */
export function generateSimpleOrderId(): string {
  return `ORD-${Date.now()}`;
}

/**
 * Valida si un ID de pedido tiene el formato correcto
 */
export function isValidOrderId(orderId: string): boolean {
  // Formato: ORD-YYYYMMDD-XXXXXX o ORD-timestamp
  const patterns = [
    /^ORD-\d{8}-\d{6}$/, // Nuevo formato: ORD-20250911-123456
    /^ORD-\d{13}$/       // Formato anterior: ORD-1757595901807
  ];
  
  return patterns.some(pattern => pattern.test(orderId));
}

/**
 * Extrae información de fecha de un ID de pedido
 */
export function getOrderDateFromId(orderId: string): Date | null {
  try {
    // Nuevo formato: ORD-YYYYMMDD-XXXXXX
    const newFormatMatch = orderId.match(/^ORD-(\d{4})(\d{2})(\d{2})-\d{6}$/);
    if (newFormatMatch) {
      const [, year, month, day] = newFormatMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Formato anterior: ORD-timestamp
    const oldFormatMatch = orderId.match(/^ORD-(\d{13})$/);
    if (oldFormatMatch) {
      const timestamp = parseInt(oldFormatMatch[1]);
      return new Date(timestamp);
    }
    
    return null;
  } catch {
    return null;
  }
}
