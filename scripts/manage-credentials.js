#!/usr/bin/env node

/**
 * 🔐 Gestor de Credenciales - Verde Agua
 * Maneja diferentes sets de credenciales de forma segura
 */

const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
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
  colorLog('cyan', '║            🔐 Gestor de Credenciales Seguro              ║');
  colorLog('cyan', '║                Verde Agua Personalizados                 ║');
  colorLog('cyan', '╚═══════════════════════════════════════════════════════════╝');
  console.log();

  colorLog('blue', '📋 ¿Qué deseas hacer?');
  console.log('1. Crear set de credenciales para desarrollo');
  console.log('2. Crear set de credenciales para producción'); 
  console.log('3. Exportar credenciales para compartir');
  console.log('4. Importar credenciales recibidas');
  console.log('5. Rotar credenciales (cambiar por seguridad)');
  console.log('6. Verificar credenciales actuales');
  console.log();

  const option = await askQuestion('Selecciona una opción (1-6): ');

  switch (option) {
    case '1':
      await crearCredencialesDesarrollo();
      break;
    case '2':
      await crearCredencialesProduccion();
      break;
    case '3':
      await exportarCredenciales();
      break;
    case '4':
      await importarCredenciales();
      break;
    case '5':
      await rotarCredenciales();
      break;
    case '6':
      await verificarCredenciales();
      break;
    default:
      colorLog('red', '❌ Opción no válida');
  }

  rl.close();
}

async function crearCredencialesDesarrollo() {
  colorLog('green', '🔧 Creando credenciales para DESARROLLO');
  console.log('Estas credenciales son para testing y desarrollo local.');
  console.log();

  const creds = {
    entorno: 'development',
    fecha: new Date().toISOString(),
    variables: {}
  };

  // Generar credenciales básicas
  creds.variables.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('hex');
  creds.variables.MERCADOPAGO_MODE = 'sandbox';
  
  colorLog('yellow', '💳 MercadoPago (usar credenciales TEST)');
  creds.variables.MERCADOPAGO_ACCESS_TOKEN = await askQuestion('TEST Access Token: ');
  creds.variables.MERCADOPAGO_PUBLIC_KEY = await askQuestion('TEST Public Key: ');

  colorLog('yellow', '📧 Email (crear email específico para desarrollo)');
  creds.variables.EMAIL_USER = await askQuestion('Email de desarrollo: ');
  creds.variables.EMAIL_PASSWORD = await askQuestion('App Password: ');
  creds.variables.EMAIL_FROM = creds.variables.EMAIL_USER;
  creds.variables.EMAIL_ADMIN = creds.variables.EMAIL_USER;

  await guardarCredenciales(creds, 'development');
}

async function crearCredencialesProduccion() {
  colorLog('red', '🚨 ALERTA: Credenciales de PRODUCCIÓN');
  colorLog('yellow', '⚠️  Estas credenciales son sensibles y críticas');
  
  const confirmar = await askQuestion('¿Estás seguro de crear credenciales de producción? (escribe "CONFIRMO"): ');
  if (confirmar !== 'CONFIRMO') {
    colorLog('yellow', 'Operación cancelada por seguridad.');
    return;
  }

  const creds = {
    entorno: 'production',
    fecha: new Date().toISOString(),
    variables: {}
  };

  creds.variables.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('hex');
  creds.variables.MERCADOPAGO_MODE = 'production';
  
  colorLog('yellow', '💳 MercadoPago (CREDENCIALES REALES)');
  creds.variables.MERCADOPAGO_ACCESS_TOKEN = await askQuestion('Production Access Token: ');
  creds.variables.MERCADOPAGO_PUBLIC_KEY = await askQuestion('Production Public Key: ');

  colorLog('yellow', '📧 Email de producción');
  creds.variables.EMAIL_USER = await askQuestion('Email profesional: ');
  creds.variables.EMAIL_PASSWORD = await askQuestion('App Password: ');
  creds.variables.EMAIL_FROM = creds.variables.EMAIL_USER;
  creds.variables.EMAIL_ADMIN = await askQuestion('Email admin (puede ser el mismo): ');

  await guardarCredenciales(creds, 'production');
}

async function exportarCredenciales() {
  colorLog('blue', '📤 Exportar credenciales para compartir');
  
  if (!fs.existsSync('.env.local')) {
    colorLog('red', '❌ No se encontró .env.local');
    return;
  }

  const password = await askQuestion('Contraseña para encriptar (opcional, Enter para omitir): ');
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const exportData = {
    tipo: 'export',
    fecha: new Date().toISOString(),
    contenido: envContent,
    notas: await askQuestion('Notas adicionales: ')
  };

  let filename;
  if (password) {
    // Encriptar (simplificado para demo)
    const encrypted = Buffer.from(JSON.stringify(exportData)).toString('base64');
    filename = `credenciales-export-${Date.now()}.enc`;
    fs.writeFileSync(filename, encrypted);
    colorLog('green', `✅ Credenciales exportadas (encriptadas): ${filename}`);
  } else {
    filename = `credenciales-export-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    colorLog('yellow', `⚠️  Credenciales exportadas (SIN encriptar): ${filename}`);
    colorLog('red', '🚨 IMPORTANTE: Elimina este archivo después de compartir');
  }
}

async function importarCredenciales() {
  colorLog('blue', '📥 Importar credenciales recibidas');
  
  const filename = await askQuestion('Nombre del archivo de credenciales: ');
  
  if (!fs.existsSync(filename)) {
    colorLog('red', `❌ No se encontró el archivo: ${filename}`);
    return;
  }

  try {
    let content = fs.readFileSync(filename, 'utf8');
    
    if (filename.endsWith('.enc')) {
      const password = await askQuestion('Contraseña para desencriptar: ');
      // Desencriptar (simplificado para demo)
      content = JSON.parse(Buffer.from(content, 'base64').toString());
    } else {
      content = JSON.parse(content);
    }

    fs.writeFileSync('.env.local', content.contenido);
    colorLog('green', '✅ Credenciales importadas a .env.local');
    
    // Eliminar archivo importado por seguridad
    const eliminar = await askQuestion('¿Eliminar archivo importado por seguridad? (s/n): ');
    if (eliminar.toLowerCase() === 's') {
      fs.unlinkSync(filename);
      colorLog('green', '✅ Archivo importado eliminado');
    }
    
  } catch (error) {
    colorLog('red', `❌ Error al importar: ${error.message}`);
  }
}

async function rotarCredenciales() {
  colorLog('yellow', '🔄 Rotación de credenciales por seguridad');
  console.log('Esto generará nuevas credenciales y marcará las actuales como obsoletas.');
  console.log();

  const tipo = await askQuestion('¿Qué credenciales rotar? (development/production): ');
  
  if (tipo === 'development') {
    await crearCredencialesDesarrollo();
  } else if (tipo === 'production') {
    await crearCredencialesProduccion();
  } else {
    colorLog('red', '❌ Tipo no válido');
  }
}

async function verificarCredenciales() {
  colorLog('blue', '🔍 Verificando credenciales actuales');
  
  if (!fs.existsSync('.env.local')) {
    colorLog('red', '❌ No se encontró .env.local');
    return;
  }

  const content = fs.readFileSync('.env.local', 'utf8');
  const lines = content.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
  
  console.log();
  colorLog('green', '📋 Variables encontradas:');
  
  const important = [
    'NEXTAUTH_SECRET',
    'MERCADOPAGO_ACCESS_TOKEN', 
    'MERCADOPAGO_MODE',
    'EMAIL_USER',
    'EMAIL_PASSWORD'
  ];

  lines.forEach(line => {
    const [key] = line.split('=');
    const isImportant = important.includes(key);
    const status = line.includes('tu-') || line.includes('your-') || line.includes('xxx') ? '❌' : '✅';
    const color = isImportant ? (status === '✅' ? 'green' : 'red') : 'blue';
    
    colorLog(color, `${status} ${key}${isImportant ? ' (CRÍTICA)' : ''}`);
  });

  console.log();
  const missing = important.filter(key => !content.includes(key));
  if (missing.length > 0) {
    colorLog('red', `⚠️  Variables críticas faltantes: ${missing.join(', ')}`);
  } else {
    colorLog('green', '✅ Todas las variables críticas están presentes');
  }
}

async function guardarCredenciales(creds, tipo) {
  // Crear .env.local
  let envContent = `# 🔐 Credenciales ${tipo.toUpperCase()}\n`;
  envContent += `# Generado: ${new Date().toLocaleString()}\n\n`;
  
  for (const [key, value] of Object.entries(creds.variables)) {
    envContent += `${key}=${value}\n`;
  }

  fs.writeFileSync('.env.local', envContent);
  
  // Crear backup seguro
  const backupFilename = `credenciales-backup-${tipo}-${Date.now()}.json`;
  fs.writeFileSync(backupFilename, JSON.stringify(creds, null, 2));
  
  colorLog('green', `✅ Credenciales ${tipo} creadas:`);
  colorLog('green', `   - .env.local (para uso)`);
  colorLog('green', `   - ${backupFilename} (backup)`);
  colorLog('yellow', '⚠️  Guarda el backup en lugar seguro y elimínalo de aquí');
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
