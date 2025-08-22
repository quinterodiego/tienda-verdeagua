// Script para ver los datos raw de Google Sheets

async function checkSheetsData() {
  console.log('🔍 Verificando datos en Google Sheets...');
  
  try {
    // Llamar directamente a admin/products que muestra más datos
    const response = await fetch('http://localhost:3000/api/admin/products');
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      console.log('❌ No se encontraron productos');
      return;
    }
    
    console.log(`✅ ${data.products.length} productos encontrados en admin`);
    
    // Mostrar productos completos del admin
    console.log('\n📊 Productos desde admin API:');
    data.products.forEach(product => {
      console.log(`\n🏷️ ${product.name}:`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Precio: ${product.price} (tipo: ${typeof product.price})`);
      console.log(`   - Precio Original: ${product.originalPrice || 'N/A'} (tipo: ${typeof product.originalPrice})`);
      console.log(`   - Activo: ${product.isActive}`);
      console.log(`   - Estado: ${product.status || 'N/A'}`);
      console.log(`   - Stock: ${product.stock}`);
      console.log(`   - Categoría: ${product.category}`);
      console.log(`   - SKU: ${product.sku || 'N/A'}`);
    });
    
    // Ahora comparar con la API pública
    console.log('\n\n📊 Comparando con API pública...');
    const publicResponse = await fetch('http://localhost:3000/api/products');
    const publicData = await publicResponse.json();
    
    if (publicData.products) {
      console.log(`🌍 API pública: ${publicData.products.length} productos`);
      publicData.products.forEach(product => {
        console.log(`\n🌐 ${product.name} (público):`);
        console.log(`   - Precio: ${product.price} (tipo: ${typeof product.price})`);
        console.log(`   - Estado: ${product.status || 'N/A'}`);
        
        // Encontrar el producto equivalente en admin
        const adminProduct = data.products.find(p => p.id === product.id);
        if (adminProduct) {
          console.log(`   - Coincide con admin: ${adminProduct.price === product.price ? '✅' : '❌'}`);
          if (adminProduct.price !== product.price) {
            console.log(`     * Admin: ${adminProduct.price}, Público: ${product.price}`);
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
checkSheetsData();
