#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

console.log('🔍 Verificando configuración antes del deploy...\n');

// Función para hacer request HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Error parsing JSON: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkProduction() {
  try {
    // Verificar si el servidor está corriendo
    console.log('📡 Verificando servidor...');
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const checkUrl = `${baseUrl}/api/debug/production-readiness`;
    
    console.log(`🔗 Consultando: ${checkUrl}`);
    
    const result = await makeRequest(checkUrl);
    
    console.log('\n📊 Resultado de la verificación:');
    console.log(`   Estado: ${result.ready ? '✅ LISTO' : '⚠️ NO LISTO'}`);
    console.log(`   Modo: ${result.config.mercadopago.mode.toUpperCase()}`);
    console.log(`   Entorno: ${result.config.environment.toUpperCase()}`);
    
    // Mostrar issues
    const allIssues = [
      ...result.productionChecks.mercadopago.issues,
      ...result.productionChecks.nextauth.issues,
      ...result.productionChecks.google.issues
    ];
    
    if (allIssues.length > 0) {
      console.log('\n❌ Issues encontrados:');
      allIssues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    // Mostrar recomendaciones
    if (result.recommendations) {
      console.log('\n💡 Recomendaciones:');
      result.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    if (!result.ready) {
      console.log('\n🚨 El sistema NO está listo para producción.');
      console.log('📖 Consulta PRODUCTION-DEPLOY.md para configuración completa.');
      process.exit(1);
    }
    
    console.log('\n✅ Sistema listo para producción!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Error verificando configuración:');
    console.error('   ', error.message);
    console.log('\n💡 Sugerencias:');
    console.log('   • Asegúrate de que el servidor esté corriendo: npm run dev');
    console.log('   • Verifica que todas las variables de entorno estén configuradas');
    console.log('   • Consulta PRODUCTION-DEPLOY.md para más información');
    process.exit(1);
  }
}

// Ejecutar verificación
checkProduction();
