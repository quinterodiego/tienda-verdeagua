#!/usr/bin/env node

/**
 * Script para actualizar credenciales de MercadoPago
 * Uso: node scripts/update-mercadopago-credentials.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function updateCredentials() {
  console.log('🔄 Actualizador de Credenciales de MercadoPago\n');
  console.log('📋 Necesitarás las credenciales de tu nueva cuenta de MercadoPago');
  console.log('🔗 Obténlas en: https://www.mercadopago.com.ar/developers\n');

  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ No se encontró el archivo .env.local');
    process.exit(1);
  }

  // Leer archivo actual
  let envContent = fs.readFileSync(envPath, 'utf8');

  console.log('📝 Por favor, proporciona las nuevas credenciales:\n');

  const mode = await askQuestion('🔸 Modo (test/production) [test]: ') || 'test';
  const accessToken = await askQuestion('🔸 Access Token: ');
  const publicKey = await askQuestion('🔸 Public Key: ');

  if (!accessToken || !publicKey) {
    console.error('❌ Access Token y Public Key son requeridos');
    process.exit(1);
  }

  // Validar formato de credenciales
  const expectedPrefix = mode === 'test' ? 'TEST-' : 'APP_USR-';
  if (!accessToken.startsWith(expectedPrefix) || !publicKey.startsWith(expectedPrefix)) {
    const confirm = await askQuestion(`⚠️  Las credenciales no tienen el prefijo esperado (${expectedPrefix}). ¿Continuar? (y/N): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Operación cancelada');
      process.exit(1);
    }
  }

  // Actualizar variables
  const updates = {
    'MERCADOPAGO_MODE': mode,
    'MERCADOPAGO_ACCESS_TOKEN': accessToken,
    'MERCADOPAGO_PUBLIC_KEY': publicKey,
    'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY': publicKey
  };

  console.log('\n🔄 Actualizando credenciales...');

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
      console.log(`✅ ${key} actualizado`);
    } else {
      console.log(`⚠️  ${key} no encontrado, agregando...`);
      envContent += `\n${key}=${value}`;
    }
  }

  // Crear backup
  const backupPath = `${envPath}.backup.${Date.now()}`;
  fs.writeFileSync(backupPath, fs.readFileSync(envPath));
  console.log(`💾 Backup creado: ${backupPath}`);

  // Escribir nuevo archivo
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Credenciales actualizadas exitosamente!');
  console.log('🔄 Reinicia el servidor de desarrollo para aplicar los cambios');
  console.log('📋 También actualiza las variables en Vercel para producción\n');

  console.log('📝 Próximos pasos:');
  console.log('1. Reinicia: npm run dev');
  console.log('2. Prueba un pago de prueba');
  console.log('3. Actualiza variables en Vercel (ver VERCEL-ENV-UPDATE.md)');
  console.log('4. Configura webhook en MercadoPago con tu nueva URL\n');

  rl.close();
}

updateCredentials().catch(console.error);
