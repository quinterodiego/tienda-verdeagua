// Script de prueba para verificar el rol de administrador
const testEmail = 'sebastianperez6@hotmail.com';

async function testAdminRole() {
  try {
    console.log('🔍 Probando rol de administrador para:', testEmail);
    
    // Importar las funciones necesarias
    const { getUserFromSheets } = require('./src/lib/users-sheets.ts');
    
    console.log('📡 Consultando usuario en Google Sheets...');
    const user = await getUserFromSheets(testEmail);
    
    if (user) {
      console.log('✅ Usuario encontrado:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
      
      if (user.role === 'admin') {
        console.log('🎉 El usuario tiene rol de administrador en Sheets');
      } else {
        console.log('❌ El usuario NO tiene rol de administrador en Sheets. Rol actual:', user.role);
      }
    } else {
      console.log('❌ Usuario no encontrado en Google Sheets');
    }
    
  } catch (error) {
    console.error('💥 Error al probar rol de admin:', error);
  }
}

if (require.main === module) {
  testAdminRole();
}
