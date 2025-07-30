#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('🏥 Verificando salud del sistema en producción...\n');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            data: JSON.parse(data) 
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data 
          });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function healthCheck() {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  console.log(`🔗 Verificando: ${baseUrl}`);
  
  const endpoints = [
    { path: '/', name: 'Página principal' },
    { path: '/api/auth/session', name: 'Autenticación' },
    { path: '/api/debug/production-readiness', name: 'Estado del sistema' },
    { path: '/api/mercadopago/preference-production', name: 'MercadoPago', method: 'POST' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Verificando: ${endpoint.name}...`);
      
      const url = `${baseUrl}${endpoint.path}`;
      const result = await makeRequest(url);
      
      const status = result.status === 200 ? '✅' : '❌';
      console.log(`   ${status} ${endpoint.name}: ${result.status}`);
      
      results.push({
        endpoint: endpoint.name,
        status: result.status,
        ok: result.status === 200
      });
      
      // Mostrar datos específicos para ciertos endpoints
      if (endpoint.path === '/api/debug/production-readiness' && result.data) {
        console.log(`      Modo: ${result.data.config?.mercadopago?.mode || 'unknown'}`);
        console.log(`      Listo: ${result.data.ready ? 'Sí' : 'No'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: Error - ${error.message}`);
      results.push({
        endpoint: endpoint.name,
        status: 'error',
        ok: false,
        error: error.message
      });
    }
  }
  
  // Resumen
  console.log('\n📊 Resumen del health check:');
  const healthyEndpoints = results.filter(r => r.ok).length;
  const totalEndpoints = results.length;
  
  console.log(`   Endpoints funcionando: ${healthyEndpoints}/${totalEndpoints}`);
  
  if (healthyEndpoints === totalEndpoints) {
    console.log('   🎉 Sistema funcionando correctamente!');
  } else {
    console.log('   ⚠️  Algunos endpoints presentan problemas');
    
    const failedEndpoints = results.filter(r => !r.ok);
    console.log('\n❌ Endpoints con problemas:');
    failedEndpoints.forEach(endpoint => {
      console.log(`   • ${endpoint.endpoint}: ${endpoint.error || endpoint.status}`);
    });
  }
  
  // Recomendaciones
  console.log('\n💡 Recomendaciones:');
  console.log('   • Ejecuta health checks regularmente');
  console.log('   • Monitorea los logs del servidor');
  console.log('   • Verifica las métricas de rendimiento');
  console.log('   • Mantén backups actualizados');
}

// Ejecutar health check
healthCheck().catch(error => {
  console.error('\n❌ Error ejecutando health check:');
  console.error('   ', error.message);
  process.exit(1);
});
