// Script para debuggear el cálculo de precios del carrito

async function debugCartCalculation() {
  console.log('🔍 Iniciando debug del cálculo del carrito...');
  
  try {
    // 1. Obtener productos
    console.log('\n1. Obteniendo productos...');
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      console.log('❌ No se encontraron productos');
      return;
    }
    
    console.log(`✅ ${data.products.length} productos encontrados`);
    
    // 2. Mostrar precios de cada producto
    console.log('\n2. Precios de productos:');
    data.products.forEach(product => {
      console.log(`📦 ${product.name}:`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Precio: ${product.price} (tipo: ${typeof product.price})`);
      console.log(`   - Precio Original: ${product.originalPrice || 'N/A'} (tipo: ${typeof product.originalPrice})`);
      console.log(`   - Categoría: ${product.category}`);
      console.log('');
    });
    
    // 3. Simular cálculo del carrito con diferentes productos
    console.log('\n3. Simulando cálculos del carrito:');
    
    const cartTests = [
      { productId: data.products[0].id, quantity: 1 },
      { productId: data.products[0].id, quantity: 2 },
      { productId: data.products[0].id, quantity: 3 },
    ];
    
    if (data.products.length > 1) {
      cartTests.push({ productId: data.products[1].id, quantity: 1 });
    }
    
    cartTests.forEach((test, index) => {
      const product = data.products.find(p => p.id === test.productId);
      if (product) {
        const calculatedTotal = product.price * test.quantity;
        console.log(`Test ${index + 1}:`);
        console.log(`   - Producto: ${product.name}`);
        console.log(`   - Precio unitario: ${product.price}`);
        console.log(`   - Cantidad: ${test.quantity}`);
        console.log(`   - Total calculado: ${calculatedTotal}`);
        console.log(`   - ¿Es correcto?: ${calculatedTotal === (product.price * test.quantity) ? '✅' : '❌'}`);
        console.log('');
      }
    });
    
    // 4. Verificar tipos de datos
    console.log('\n4. Verificación de tipos de datos:');
    data.products.forEach(product => {
      console.log(`${product.name}:`);
      console.log(`   - Precio es número: ${typeof product.price === 'number' ? '✅' : '❌'}`);
      console.log(`   - Precio > 0: ${product.price > 0 ? '✅' : '❌'}`);
      console.log(`   - Precio real: ${JSON.stringify(product.price)}`);
    });
    
    // 5. Test de cálculo como lo haría el store
    console.log('\n5. Test de cálculo como lo hace el store:');
    const mockCartItems = data.products.slice(0, 2).map(product => ({
      product: product,
      quantity: 2
    }));
    
    console.log('Mock cart items:');
    mockCartItems.forEach(item => {
      console.log(`   - ${item.product.name}: ${item.quantity} x ${item.product.price} = ${item.product.price * item.quantity}`);
    });
    
    const totalCalculated = mockCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = mockCartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    console.log(`\nResumen del carrito mock:`);
    console.log(`   - Total items: ${itemCount}`);
    console.log(`   - Total precio: ${totalCalculated}`);
    console.log(`   - Cálculo paso a paso:`);
    
    let runningTotal = 0;
    mockCartItems.forEach(item => {
      const itemTotal = item.product.price * item.quantity;
      runningTotal += itemTotal;
      console.log(`     + ${item.product.name}: ${item.product.price} × ${item.quantity} = ${itemTotal} (total acumulado: ${runningTotal})`);
    });
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Ejecutar debug
debugCartCalculation();
