#!/usr/bin/env node

/**
 * 🔧 Script de Migración de Emails a Producción
 * Verde Agua Personalizados
 * 
 * Este script te ayuda a migrar la configuración de emails
 * de desarrollo a producción de forma segura.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.clear();
  
  colorLog('cyan', '╔══════════════════════════════════════════════════════════╗');
  colorLog('cyan', '║           🚀 Migración de Emails a Producción            ║');
  colorLog('cyan', '║                Verde Agua Personalizados                 ║');
  colorLog('cyan', '╚══════════════════════════════════════════════════════════╝');
  console.log();

  colorLog('yellow', '⚠️  IMPORTANTE: Este script te ayudará a configurar emails para producción');
  colorLog('yellow', '   Los valores actuales son para desarrollo solamente.');
  console.log();

  // Mostrar configuración actual
  colorLog('blue', '📊 CONFIGURACIÓN ACTUAL (Desarrollo):');
  console.log('   EMAIL_USER: d86webs@gmail.com');
  console.log('   EMAIL_FROM: d86webs@gmail.com');
  console.log('   EMAIL_ADMIN: d86webs@gmail.com');
  console.log();

  const continuar = await askQuestion('¿Deseas configurar emails para producción? (s/n): ');
  
  if (continuar.toLowerCase() !== 's') {
    colorLog('yellow', 'Operación cancelada.');
    rl.close();
    return;
  }

  console.log();
  colorLog('green', '🔧 CONFIGURACIÓN DE PRODUCCIÓN');
  console.log();

  // Preguntar tipo de configuración
  colorLog('cyan', '📧 ¿Qué tipo de email quieres usar?');
  console.log('1. Gmail Personal (Gratuito, recomendado para empezar)');
  console.log('2. Google Workspace (Profesional, $6/mes)');
  console.log('3. SendGrid (Alto volumen, desde $0)');
  console.log('4. Otro proveedor SMTP');
  console.log();

  const tipoEmail = await askQuestion('Selecciona una opción (1-4): ');

  let emailConfig = {};

  switch (tipoEmail) {
    case '1':
      colorLog('green', '📧 Configurando Gmail Personal...');
      emailConfig = await configurarGmailPersonal();
      break;
    case '2':
      colorLog('green', '🏢 Configurando Google Workspace...');
      emailConfig = await configurarGoogleWorkspace();
      break;
    case '3':
      colorLog('green', '📬 Configurando SendGrid...');
      emailConfig = await configurarSendGrid();
      break;
    case '4':
      colorLog('green', '⚙️ Configurando SMTP personalizado...');
      emailConfig = await configurarSMTPCustom();
      break;
    default:
      colorLog('red', '❌ Opción no válida');
      rl.close();
      return;
  }

  // Generar configuración
  console.log();
  colorLog('yellow', '📋 VARIABLES DE ENTORNO GENERADAS:');
  console.log();
  
  const envVars = generarVariablesEntorno(emailConfig);
  console.log(envVars);

  // Guardar en archivo
  const guardar = await askQuestion('\n¿Deseas guardar esta configuración en un archivo? (s/n): ');
  
  if (guardar.toLowerCase() === 's') {
    const filename = `email-config-production-${Date.now()}.txt`;
    fs.writeFileSync(filename, envVars);
    colorLog('green', `✅ Configuración guardada en: ${filename}`);
  }

  console.log();
  colorLog('cyan', '🚀 PRÓXIMOS PASOS:');
  console.log('1. Copia las variables de entorno');
  console.log('2. Ve a Vercel Dashboard > Settings > Environment Variables');
  console.log('3. Actualiza las variables EMAIL_*');
  console.log('4. Espera el redeploy automático');
  console.log('5. Prueba con: /api/debug/email/complete-test');
  console.log();

  colorLog('green', '✅ ¡Migración de emails configurada exitosamente!');
  
  rl.close();
}

async function configurarGmailPersonal() {
  console.log();
  colorLog('yellow', '📧 Gmail Personal - Pasos requeridos:');
  console.log('1. Crear un email específico para la tienda (ej: verdeagua.tienda@gmail.com)');
  console.log('2. Activar verificación en 2 pasos');
  console.log('3. Generar App Password específica');
  console.log();

  const emailPrincipal = await askQuestion('Email principal de la tienda (ej: verdeagua.tienda@gmail.com): ');
  const appPassword = await askQuestion('App Password generada (16 caracteres): ');
  const emailAdmin = await askQuestion('Email para notificaciones admin (puede ser el mismo): ');
  const nombreTienda = await askQuestion('Nombre de la tienda (ej: Verde Agua Personalizados): ');

  return {
    tipo: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: emailPrincipal,
    password: appPassword,
    from: emailPrincipal,
    fromName: nombreTienda,
    admin: emailAdmin
  };
}

async function configurarGoogleWorkspace() {
  console.log();
  colorLog('yellow', '🏢 Google Workspace - Configuración profesional:');
  console.log('Requiere dominio propio y suscripción a Google Workspace');
  console.log();

  const dominio = await askQuestion('Tu dominio (ej: verdeagua.ar): ');
  const emailPrincipal = await askQuestion(`Email principal (ej: info@${dominio}): `);
  const appPassword = await askQuestion('App Password de Google Workspace: ');
  const emailAdmin = await askQuestion(`Email admin (ej: ventas@${dominio}): `);
  const nombreTienda = await askQuestion('Nombre de la tienda: ');

  return {
    tipo: 'workspace',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: emailPrincipal,
    password: appPassword,
    from: emailPrincipal,
    fromName: nombreTienda,
    admin: emailAdmin,
    dominio: dominio
  };
}

async function configurarSendGrid() {
  console.log();
  colorLog('yellow', '📬 SendGrid - Alta capacidad de envío:');
  console.log('Requiere cuenta en SendGrid y verificación de dominio');
  console.log();

  const apiKey = await askQuestion('SendGrid API Key: ');
  const emailFrom = await askQuestion('Email FROM verificado en SendGrid: ');
  const emailAdmin = await askQuestion('Email para notificaciones admin: ');
  const nombreTienda = await askQuestion('Nombre de la tienda: ');

  return {
    tipo: 'sendgrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    user: 'apikey',
    password: apiKey,
    from: emailFrom,
    fromName: nombreTienda,
    admin: emailAdmin
  };
}

async function configurarSMTPCustom() {
  console.log();
  colorLog('yellow', '⚙️ SMTP Personalizado:');
  console.log();

  const host = await askQuestion('Host SMTP: ');
  const port = await askQuestion('Puerto (ej: 587): ');
  const secure = await askQuestion('¿Usar SSL? (s/n): ');
  const user = await askQuestion('Usuario SMTP: ');
  const password = await askQuestion('Contraseña SMTP: ');
  const emailFrom = await askQuestion('Email FROM: ');
  const emailAdmin = await askQuestion('Email admin: ');
  const nombreTienda = await askQuestion('Nombre de la tienda: ');

  return {
    tipo: 'custom',
    host: host,
    port: parseInt(port),
    secure: secure.toLowerCase() === 's',
    user: user,
    password: password,
    from: emailFrom,
    fromName: nombreTienda,
    admin: emailAdmin
  };
}

function generarVariablesEntorno(config) {
  return `# 📧 CONFIGURACIÓN DE EMAILS PARA PRODUCCIÓN
# Generado el: ${new Date().toLocaleString()}
# Tipo: ${config.tipo.toUpperCase()}

# Configuración SMTP
EMAIL_HOST=${config.host}
EMAIL_PORT=${config.port}
EMAIL_SECURE=${config.secure}
EMAIL_USER=${config.user}
EMAIL_PASSWORD=${config.password}

# Configuración de envío
EMAIL_FROM=${config.from}
EMAIL_FROM_NAME=${config.fromName}
EMAIL_ADMIN=${config.admin}

# URLs y branding (ACTUALIZAR CON TUS VALORES)
EMAIL_LOGO_URL=https://tu-dominio.com/logo.png
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# IMPORTANTE:
# 1. Copia estas variables a Vercel Dashboard
# 2. Actualiza EMAIL_LOGO_URL y NEXT_PUBLIC_APP_URL con tus valores reales
# 3. Prueba el sistema después del deploy
`;
}

// Manejo de errores y cierre limpio
process.on('SIGINT', () => {
  console.log();
  colorLog('yellow', 'Operación cancelada por el usuario.');
  rl.close();
  process.exit(0);
});

rl.on('close', () => {
  process.exit(0);
});

// Ejecutar script
main().catch((error) => {
  colorLog('red', `❌ Error: ${error.message}`);
  rl.close();
  process.exit(1);
});
