// Script para probar las notificaciones de pedidos al admin
const API_BASE = 'http://localhost:3000';

// Datos del pedido de prueba
const testOrder = {
  items: [
    {
      product: {
        id: "PROD-1755443587265",
        name: "Microondas",
        description: "Microondas de prueba",
        price: 50000,
        category: "electrodomesticos",
        image: "https://res.cloudinary.com/dsux52cft/image/upload/v1755443505/techstore/products/product_1755443504801_lawbb3bxu.png",
        stock: 10,
        status: "active"
      },
      quantity: 1
    }
  ],
  total: 50000,
  customerInfo: {
    firstName: "Test",
    lastName: "Usuario",
    email: "test@example.com",
    phone: "1234567890"
  },
  deliveryInfo: {
    method: "delivery",
    address: "Calle Test 123, Buenos Aires",
    cost: 5000
  },
  paymentMethod: "mercadopago",
  status: "completed",
  notes: "Pedido de prueba para verificar notificaciones",
  paymentDetails: {
    id: "TEST-PAYMENT-" + Date.now(),
    status: "approved",
    amount: 55000, // total + delivery
    method: "credit_card"
  }
};

async function createTestOrder() {
  try {
    console.log('🔄 Creando pedido de prueba...');
    
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Pedido creado exitosamente:', result);
    console.log('📧 Verifica tu email admin (coderflixarg@gmail.com) para ver la notificación');
    
    return result;
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    throw error;
  }
}

// Función para verificar la configuración de email
async function checkEmailConfig() {
  try {
    console.log('🔍 Verificando configuración de email...');
    
    const response = await fetch(`${API_BASE}/api/debug/email-config`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const config = await response.json();
    console.log('📋 Configuración de email:', JSON.stringify(config, null, 2));
    
    return config;
  } catch (error) {
    console.error('❌ Error al verificar configuración:', error);
    return null;
  }
}

// Ejecutar las pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de notificaciones...\n');
  
  // 1. Verificar configuración
  await checkEmailConfig();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. Crear pedido de prueba
  await createTestOrder();
  
  console.log('\n📝 Instrucciones:');
  console.log('1. Revisa tu email: coderflixarg@gmail.com');
  console.log('2. Busca un email con asunto: "Nuevo pedido recibido"');
  console.log('3. Si no llega en 1-2 minutos, revisa spam/promociones');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}
