// Script para probar el endpoint de MercadoPago
console.log('🔍 Verificando configuración de MercadoPago...');

// Primero verificar la configuración
fetch('http://localhost:3000/api/mercadopago/debug')
.then(response => {
  console.log(`📊 Status verificación: ${response.status}`);
  return response.json();
})
.then(data => {
  console.log(`✅ Verificación:`, JSON.stringify(data, null, 2));
  
  if (data.status === 'OK') {
    console.log('\n🎉 ¡Configuración correcta! Ahora probando creación de preferencia...\n');
    
    // Si la configuración está OK, probar creación de preferencia
    const testData = {
      items: [
        {
          title: "Producto de Prueba",
          quantity: 1,
          unit_price: 100,
          description: "Test producto para validar MercadoPago"
        }
      ],
      payer: {
        name: "Juan",
        surname: "Perez", 
        email: "test@example.com",
        phone: "+541122334455"
      },
      total: 100
    };

    console.log('📦 Datos de prueba:', JSON.stringify(testData, null, 2));
    
    return fetch('http://localhost:3000/api/mercadopago/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
  } else {
    throw new Error('Configuración de MercadoPago incorrecta');
  }
})
.then(response => {
  if (!response) return;
  
  console.log(`📊 Status preferencia: ${response.status}`);
  console.log(`📋 Headers:`, Object.fromEntries(response.headers));
  return response.text();
})
.then(text => {
  if (!text) return;
  
  console.log(`📄 Respuesta raw:`, text);
  
  try {
    const data = JSON.parse(text);
    console.log(`✅ JSON parseado:`, JSON.stringify(data, null, 2));
    
    if (data.success && data.preferenceId) {
      console.log(`🎉 ¡Éxito! Preferencia creada: ${data.preferenceId}`);
      console.log(`🔗 URL de pago: ${data.initPoint || data.sandboxInitPoint}`);
    } else {
      console.log(`❌ Error en la respuesta:`, data);
    }
  } catch (parseError) {
    console.error(`💥 Error al parsear JSON:`, parseError.message);
    console.error(`📄 Respuesta no es JSON válido`);
  }
})
.catch(error => {
  console.error(`🚨 Error:`, error.message);
});
