#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variables de entorno para producción...\n');

// Verificar que existe .env.production.example
const examplePath = path.join(process.cwd(), '.env.production.example');
const prodPath = path.join(process.cwd(), '.env.production.local');

if (!fs.existsSync(examplePath)) {
  console.error('❌ No se encuentra .env.production.example');
  console.log('💡 Ejecuta: npm run setup-production para crear el template');
  process.exit(1);
}

// Leer template
const template = fs.readFileSync(examplePath, 'utf8');

// Verificar si ya existe .env.production.local
if (fs.existsSync(prodPath)) {
  console.log('⚠️  Ya existe .env.production.local');
  console.log('¿Deseas sobrescribirlo? (y/N)');
  
  // En un entorno real, aquí usarías readline para input del usuario
  // Por simplicidad, solo mostramos el mensaje
  console.log('💡 Para continuar manualmente:');
  console.log(`   1. Copia ${examplePath} a ${prodPath}`);
  console.log('   2. Completa todas las variables con valores reales de producción');
  console.log('   3. Ejecuta: npm run verify-production');
  process.exit(0);
}

// Crear archivo de producción
fs.writeFileSync(prodPath, template);

console.log('✅ Creado .env.production.local');
console.log('\n📝 Próximos pasos:');
console.log('   1. Edita .env.production.local con tus credenciales reales');
console.log('   2. Configura las variables de MercadoPago de producción');
console.log('   3. Actualiza las URLs y secretos para tu dominio');
console.log('   4. Ejecuta: npm run verify-production');
console.log('\n📖 Consulta PRODUCTION-DEPLOY.md para instrucciones detalladas');

// Mostrar variables críticas que necesitan configuración
console.log('\n🔑 Variables críticas a configurar:');
const criticalVars = [
  'MERCADOPAGO_ACCESS_TOKEN',
  'MERCADOPAGO_PUBLIC_KEY', 
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

criticalVars.forEach(varName => {
  console.log(`   • ${varName}`);
});
