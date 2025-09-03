// Script para probar todo el sistema de notificaciones por email

async function testEmailSystem() {
  console.log('🧪 Iniciando test completo del sistema de emails...');
  
  const testEmail = 'd86webs@gmail.com'; // Email de prueba
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/email/complete-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testEmail })
    });
    
    const data = await response.json();
    
    console.log('\n📊 RESULTADOS DEL TEST:');
    console.log('='.repeat(50));
    
    if (data.success) {
      console.log('✅ SISTEMA DE EMAILS: FUNCIONANDO CORRECTAMENTE');
    } else {
      console.log('❌ SISTEMA DE EMAILS: PROBLEMAS DETECTADOS');
    }
    
    console.log(`\n📈 Resumen: ${data.summary.successRate} de éxito`);
    console.log(`   - Total tests: ${data.summary.totalTests}`);
    console.log(`   - Exitosos: ${data.summary.successCount}`);
    console.log(`   - Fallidos: ${data.summary.failureCount}`);
    
    console.log('\n📧 Detalle por tipo de email:');
    console.log('-'.repeat(40));
    
    data.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      
      if (result.success && result.messageId) {
        console.log(`   📨 Message ID: ${result.messageId}`);
      }
      
      if (!result.success && result.error) {
        console.log(`   ⚠️ Error: ${result.error}`);
      }
      console.log('');
    });
    
    console.log('💡 Recomendación:');
    console.log(`   ${data.recommendation}`);
    
    if (data.summary.failureCount > 0) {
      console.log('\n🔧 SUGERENCIAS PARA SOLUCIONAR PROBLEMAS:');
      console.log('   1. Verifica las variables de entorno EMAIL_*');
      console.log('   2. Para Gmail, usa contraseña de aplicación');
      console.log('   3. Revisa la configuración SMTP');
      console.log('   4. Verifica que no haya límites de envío');
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando test:', error.message);
  }
}

// Ejecutar test
testEmailSystem();
