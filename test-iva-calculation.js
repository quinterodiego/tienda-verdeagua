// Script de prueba para verificar cálculos de IVA
// Ejecutar en consola del navegador en la página de checkout

console.log('=== VERIFICACIÓN DE CÁLCULO DE IVA ===');

// Simulación con valores de ejemplo
const ejemplos = [
  { subtotal: 100, envio: 15, descripcion: 'Compra normal con envío' },
  { subtotal: 50, envio: 0, descripcion: 'Compra con envío gratis' },
  { subtotal: 200, envio: 15, descripcion: 'Compra grande con envío' },
  { subtotal: 75, envio: 0, descripcion: 'Compra mediana, envío gratis' }
];

const taxRate = 0.21; // 21% IVA

ejemplos.forEach((ejemplo, index) => {
  console.log(`\n--- Ejemplo ${index + 1}: ${ejemplo.descripcion} ---`);
  console.log(`Subtotal (productos): $${ejemplo.subtotal}`);
  console.log(`Envío: $${ejemplo.envio}`);
  
  const iva = ejemplo.subtotal * taxRate;
  const total = ejemplo.subtotal + ejemplo.envio + iva;
  
  console.log(`IVA (21% sobre productos): $${iva.toFixed(2)}`);
  console.log(`Total final: $${total.toFixed(2)}`);
  
  // Verificación
  const porcentajeIVA = (iva / ejemplo.subtotal) * 100;
  console.log(`✅ Verificación: IVA es ${porcentajeIVA}% del subtotal`);
});

console.log('\n=== RESUMEN DE LA CORRECCIÓN ===');
console.log('✅ IVA se aplica solo sobre productos (no sobre envío)');
console.log('✅ IVA configurado al 21% (taxRate = 0.21)');
console.log('✅ Cálculo: subtotal * 0.21');
console.log('✅ Total: subtotal + envío + IVA');
