#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando deploy de producción...\n');

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`⚡ Ejecutando: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falló con código ${code}`));
      }
    });
  });
}

async function deployProduction() {
  try {
    // 1. Verificación pre-deploy
    console.log('📋 Paso 1: Verificación pre-deploy');
    await runCommand('node', ['scripts/pre-deploy-check.js']);
    console.log('✅ Verificación completada\n');
    
    // 2. Linting y type checking
    console.log('🔍 Paso 2: Linting y verificación de tipos');
    await runCommand('npm', ['run', 'lint']);
    await runCommand('npx', ['tsc', '--noEmit']);
    console.log('✅ Código verificado\n');
    
    // 3. Build de producción
    console.log('🏗️  Paso 3: Build de producción');
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Build completado\n');
    
    // 4. Verificación post-build (opcional)
    if (fs.existsSync('.next')) {
      console.log('📦 Build generado correctamente');
    }
    
    console.log('🎉 Deploy completado exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Sube los archivos a tu servidor de producción');
    console.log('   2. Configura las variables de entorno en el servidor');
    console.log('   3. Ejecuta: npm start en el servidor');
    console.log('   4. Verifica: npm run health-check');
    
  } catch (error) {
    console.error('\n❌ Error durante el deploy:');
    console.error('   ', error.message);
    console.log('\n💡 Sugerencias:');
    console.log('   • Verifica que todas las variables estén configuradas');
    console.log('   • Ejecuta: npm run verify-production');
    console.log('   • Consulta PRODUCTION-DEPLOY.md para más información');
    process.exit(1);
  }
}

// Ejecutar deploy
deployProduction();
