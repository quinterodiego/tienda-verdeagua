#!/usr/bin/env node

/**
 * 🚀 Script de Configuración Inicial - Verde Agua
 * Automatiza la configuración de variables de entorno en nueva PC
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.clear();
  
  colorLog('cyan', '╔═══════════════════════════════════════════════════════════╗');
  colorLog('cyan', '║         🚀 Configuración Inicial - Verde Agua            ║');
  colorLog('cyan', '║               Setup en Nueva Computadora                 ║');
  colorLog('cyan', '╚═══════════════════════════════════════════════════════════╝');
  console.log();

  // Verificar si .env.local ya existe
  const envLocalPath = '.env.local';
  const envExamplePath = '.env.example';

  if (fs.existsSync(envLocalPath)) {
    colorLog('yellow', '⚠️  Ya existe un archivo .env.local');
    const overwrite = await askQuestion('¿Deseas sobrescribirlo? (s/n): ');
    if (overwrite.toLowerCase() !== 's') {
      colorLog('blue', 'ℹ️  Operación cancelada. Archivo .env.local conservado.');
      rl.close();
      return;
    }
  }

  if (!fs.existsSync(envExamplePath)) {
    colorLog('red', '❌ No se encontró .env.example');
    colorLog('yellow', 'Este archivo debería estar en el repositorio.');
    rl.close();
    return;
  }

  colorLog('green', '✅ Encontrado .env.example');
  console.log();

  // Preguntar qué tipo de configuración
  colorLog('cyan', '🔧 ¿Qué tipo de configuración necesitas?');
  console.log('1. Desarrollo completo (todas las credenciales)');
  console.log('2. Solo ver la tienda (credenciales mínimas)');
  console.log('3. Copiar desde .env.example y configurar manualmente');
  console.log();

  const option = await askQuestion('Selecciona una opción (1-3): ');

  switch (option) {
    case '1':
      await setupCompleto();
      break;
    case '2':
      await setupMinimo();
      break;
    case '3':
      await setupManual();
      break;
    default:
      colorLog('red', '❌ Opción no válida');
      rl.close();
      return;
  }

  colorLog('green', '✅ Configuración completada!');
  colorLog('cyan', '🚀 Próximos pasos:');
  console.log('1. Instalar dependencias: npm install');
  console.log('2. Iniciar servidor: npm run dev');
  console.log('3. Abrir: http://localhost:3000');
  
  rl.close();
}

async function setupCompleto() {
  colorLog('yellow', '🔧 Configuración Completa de Desarrollo');
  console.log('Necesitarás todas las credenciales de servicios externos.');
  console.log();

  const credenciales = {};
  
  // NextAuth
  colorLog('blue', '🔑 NextAuth');
  credenciales.NEXTAUTH_SECRET = await askQuestion('NEXTAUTH_SECRET (32 caracteres aleatorios): ') || generateRandomSecret();
  
  // MercadoPago
  colorLog('blue', '💳 MercadoPago');
  credenciales.MERCADOPAGO_ACCESS_TOKEN = await askQuestion('MERCADOPAGO_ACCESS_TOKEN: ');
  credenciales.MERCADOPAGO_PUBLIC_KEY = await askQuestion('MERCADOPAGO_PUBLIC_KEY: ');
  
  // Google OAuth
  colorLog('blue', '🔐 Google OAuth');
  credenciales.GOOGLE_CLIENT_ID = await askQuestion('GOOGLE_CLIENT_ID: ');
  credenciales.GOOGLE_CLIENT_SECRET = await askQuestion('GOOGLE_CLIENT_SECRET: ');
  
  // Emails
  colorLog('blue', '📧 Configuración de Emails');
  credenciales.EMAIL_USER = await askQuestion('EMAIL_USER: ');
  credenciales.EMAIL_PASSWORD = await askQuestion('EMAIL_PASSWORD (App Password): ');
  credenciales.EMAIL_FROM = credenciales.EMAIL_USER;
  credenciales.EMAIL_ADMIN = credenciales.EMAIL_USER;

  await crearEnvLocal(credenciales, 'completo');
}

async function setupMinimo() {
  colorLog('yellow', '⚡ Configuración Mínima');
  console.log('Solo lo necesario para ver la tienda funcionando.');
  console.log();

  const credenciales = {
    NEXTAUTH_SECRET: generateRandomSecret(),
    MERCADOPAGO_MODE: 'sandbox',
    NEXT_PUBLIC_ENABLE_LOGGING: 'true'
  };

  await crearEnvLocal(credenciales, 'minimo');
}

async function setupManual() {
  colorLog('yellow', '📋 Configuración Manual');
  
  // Copiar .env.example a .env.local
  const exampleContent = fs.readFileSync('.env.example', 'utf8');
  fs.writeFileSync('.env.local', exampleContent);
  
  colorLog('green', '✅ Archivo .env.local creado desde .env.example');
  colorLog('cyan', 'ℹ️  Edita .env.local manualmente con tus credenciales');
}

async function crearEnvLocal(credenciales, tipo) {
  const template = fs.readFileSync('.env.example', 'utf8');
  let content = template;

  // Reemplazar valores
  for (const [key, value] of Object.entries(credenciales)) {
    const regex = new RegExp(`${key}=.*`, 'g');
    if (content.includes(`${key}=`)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }

  // Agregar comentario sobre el tipo de configuración
  content = `# 🔧 Configuración: ${tipo.toUpperCase()}\n# Generado: ${new Date().toLocaleString()}\n\n${content}`;

  fs.writeFileSync('.env.local', content);
  colorLog('green', `✅ Archivo .env.local creado con configuración ${tipo}`);
}

function generateRandomSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Manejo de errores
process.on('SIGINT', () => {
  console.log();
  colorLog('yellow', 'Operación cancelada por el usuario.');
  rl.close();
  process.exit(0);
});

rl.on('close', () => {
  process.exit(0);
});

main().catch((error) => {
  colorLog('red', `❌ Error: ${error.message}`);
  rl.close();
  process.exit(1);
});
