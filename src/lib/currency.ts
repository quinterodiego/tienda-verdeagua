/**
 * Formatea un número como peso argentino (ARS) con 2 decimales
 * @param amount - El monto a formatear
 * @returns String formateado como peso argentino
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formatea un número como peso argentino sin símbolo de moneda
 * @param amount - El monto a formatear  
 * @returns String formateado sin símbolo de moneda
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
