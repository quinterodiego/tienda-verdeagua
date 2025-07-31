// Test script para verificar el filtrado de productos
async function testProductFilter() {
  try {
    console.log('🧪 Testeando API de productos...');
    
    const response = await fetch('/api/products');
    const data = await response.json();
    
    console.log('📊 Respuesta completa:', data);
    console.log('📦 Productos recibidos:', data.products?.length || 0);
    
    if (data.products) {
      console.log('🔍 Estados de productos:');
      data.products.forEach(p => {
        console.log(`- ${p.name}: ${p.status || 'NO STATUS'}`);
      });
      
      const inactiveProducts = data.products.filter(p => p.status === 'inactive');
      const pendingProducts = data.products.filter(p => p.status === 'pending');
      
      console.log(`❌ Productos inactivos encontrados: ${inactiveProducts.length}`);
      console.log(`⏳ Productos pendientes encontrados: ${pendingProducts.length}`);
      
      if (inactiveProducts.length > 0) {
        console.log('🚨 PROBLEMA: Productos inactivos visibles:', inactiveProducts.map(p => p.name));
      }
      
      if (pendingProducts.length > 0) {
        console.log('🚨 PROBLEMA: Productos pendientes visibles:', pendingProducts.map(p => p.name));
      }
    }
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

// Ejecutar test
testProductFilter();
