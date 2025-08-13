const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
const envVars = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

console.log('=== VERIFICACIÓN DE VARIABLES DE ENTORNO MERCADOPAGO ===');
console.log(`Archivo .env.local: ${envPath}`);
console.log(`Archivo existe: ${fs.existsSync(envPath) ? 'SÍ' : 'NO'}`);

const variables = [
  'MERCADOPAGO_ACCESS_TOKEN',
  'MERCADOPAGO_PUBLIC_KEY',
  'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY',
];

variables.forEach(key => {
  const value = envVars[key] || process.env[key];
  if (value) {
    console.log(`✅ ${key}: Configurado (${value.substring(0, 10)}...${value.substring(value.length - 5)})`);
  } else {
    console.log(`❌ ${key}: NO configurado`);
  }
});

// Verificar si el access token parece válido
const accessToken = envVars.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
if (accessToken) {
  if (accessToken.startsWith('APP_USR-') || accessToken.startsWith('TEST-')) {
    console.log('\n✅ El Access Token tiene formato válido');
  } else {
    console.log('\n⚠️ El Access Token podría tener formato incorrecto');
    console.log(`   Formato actual: ${accessToken.substring(0, 20)}...`);
  }
  
  if (accessToken.includes('TEST-')) {
    console.log('🧪 Modo: SANDBOX/TEST');
  } else if (accessToken.includes('APP_USR-')) {
    console.log('🔴 Modo: PRODUCCIÓN');
  }
} else {
  console.log('\n❌ No se puede verificar el Access Token');
}

console.log('\n=== FIN DE VERIFICACIÓN ===');
