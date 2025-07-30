#!/usr/bin/env node

console.log('🔧 Asistente de Configuración de MercadoPago\n');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureMercadoPago() {
  console.log('📋 Vamos a configurar tus credenciales de MercadoPago paso a paso\n');
  
  // Verificar tipo de credenciales
  console.log('🎯 ¿Qué tipo de credenciales tienes?');
  console.log('   1. TEST (para desarrollo/pruebas)');
  console.log('   2. PRODUCCIÓN (credenciales reales APP_USR-)');
  console.log('   3. No tengo credenciales aún\n');
  
  const tipo = await question('Selecciona una opción (1/2/3): ');
  
  if (tipo === '3') {
    console.log('\n📖 Para obtener credenciales:');
    console.log('   1. Ve a: https://www.mercadopago.com.ar/developers');
    console.log('   2. Crea una cuenta de desarrollador');
    console.log('   3. Crea una nueva aplicación');
    console.log('   4. Obtén tus credenciales TEST primero');
    console.log('   5. Consulta MERCADOPAGO-CREDENTIALS.md para más detalles');
    console.log('\n💡 Ejecuta este script nuevamente cuando tengas las credenciales');
    rl.close();
    return;
  }
  
  console.log('\n🔑 Ingresa tus credenciales:\n');
  
  const accessToken = await question('Access Token: ');
  const publicKey = await question('Public Key: ');
  
  // Detectar tipo automáticamente
  const isProduction = accessToken.startsWith('APP_USR-');
  const isTest = accessToken.startsWith('TEST-');
  
  if (!isProduction && !isTest) {
    console.log('\n❌ Error: Access Token no válido');
    console.log('   Debe empezar con "TEST-" o "APP_USR-"');
    rl.close();
    return;
  }
  
  const mode = isProduction ? 'production' : 'test';
  console.log(`\n✅ Credenciales detectadas como: ${mode.toUpperCase()}`);
  
  // URLs
  let baseUrl, nextAuthUrl;
  
  if (isProduction) {
    console.log('\n🌐 Configuración para PRODUCCIÓN:');
    baseUrl = await question('URL de tu sitio (ej: https://tutienda.com): ');
    nextAuthUrl = baseUrl;
    
    if (!baseUrl.startsWith('https://')) {
      console.log('\n⚠️  Advertencia: Se recomienda HTTPS para producción');
    }
  } else {
    baseUrl = 'http://localhost:3000';
    nextAuthUrl = 'http://localhost:3000';
    console.log('\n🧪 Configuración para TEST/DESARROLLO');
  }
  
  // Generar configuración
  const envConfig = `
# MercadoPago Configuration - ${mode.toUpperCase()}
MERCADOPAGO_ACCESS_TOKEN=${accessToken}
MERCADOPAGO_PUBLIC_KEY=${publicKey}
MERCADOPAGO_MODE=${mode}

# URLs
NEXT_PUBLIC_BASE_URL=${baseUrl}
NEXTAUTH_URL=${nextAuthUrl}

# NextAuth Secret (genera uno nuevo para producción)
NEXTAUTH_SECRET=${isProduction ? 'CAMBIAR-POR-SECRETO-SEGURO-32-CHARS' : 'dev-secret-not-secure'}

# Google OAuth (configura si usas login con Google)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
`;

  console.log('\n📄 Configuración generada:');
  console.log('─'.repeat(50));
  console.log(envConfig);
  console.log('─'.repeat(50));
  
  const envFile = isProduction ? '.env.production.local' : '.env.local';
  
  console.log(`\n💾 ¿Guardar en ${envFile}?`);
  const save = await question('(y/N): ');
  
  if (save.toLowerCase() === 'y') {
    const fs = require('fs');
    fs.writeFileSync(envFile, envConfig);
    console.log(`\n✅ Configuración guardada en ${envFile}`);
    
    if (isProduction) {
      console.log('\n🚨 IMPORTANTE para PRODUCCIÓN:');
      console.log('   • Cambia NEXTAUTH_SECRET por un valor seguro');
      console.log('   • Configura Google OAuth si lo usas');
      console.log('   • Verifica que tu dominio esté configurado en MercadoPago');
      console.log('\n🔍 Ejecuta: npm run verify-production');
    } else {
      console.log('\n🧪 Para TEST:');
      console.log('   • Ejecuta: npm run dev');
      console.log('   • Prueba hacer una compra');
      console.log('   • Usa tarjetas de prueba de MercadoPago');
    }
  } else {
    console.log('\n📋 Copia la configuración manualmente al archivo correspondiente');
  }
  
  console.log('\n📖 Más información en:');
  console.log('   • MERCADOPAGO-CREDENTIALS.md');
  console.log('   • PRODUCTION-DEPLOY.md');
  
  rl.close();
}

configureMercadoPago().catch(console.error);
