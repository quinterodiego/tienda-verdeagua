import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Configuración de Google Sheets
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAMES = {
  ORDERS: 'Pedidos'
};

async function getGoogleSheetsAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('❌ Error configurando Google Sheets Auth:', error);
    throw error;
  }
}

async function debugOrdersDiscrepancy() {
  try {
    console.log('🔍 Iniciando debug de discrepancia de pedidos...');
    console.log('📊 Google Sheet ID:', SPREADSHEET_ID);
    
    if (!SPREADSHEET_ID) {
      console.error('❌ GOOGLE_SHEET_ID no está configurado');
      return;
    }

    const sheets = await getGoogleSheetsAuth();
    
    // Obtener todos los datos del sheet
    console.log('\n📋 Obteniendo datos del Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.ORDERS}!A:Z`,
    });

    const rows = response.data.values || [];
    console.log(`📊 Total de filas encontradas: ${rows.length}`);
    
    if (rows.length === 0) {
      console.log('⚠️ No hay datos en la hoja de pedidos');
      return;
    }

    // Mostrar headers
    const headers = rows[0];
    console.log('\n📌 Headers encontrados:');
    headers.forEach((header, index) => {
      console.log(`  ${index}: ${header}`);
    });

    // Mostrar todos los pedidos
    const orderRows = rows.slice(1);
    console.log(`\n📦 Pedidos encontrados: ${orderRows.length}`);
    
    orderRows.forEach((row, index) => {
      console.log(`\n--- Pedido ${index + 1} ---`);
      console.log(`ID: ${row[0] || 'Sin ID'}`);
      console.log(`Email: ${row[1] || 'Sin email'}`);
      console.log(`Nombre: ${row[2] || 'Sin nombre'}`);
      console.log(`Total: ${row[3] || 'Sin total'}`);
      console.log(`Estado: ${row[4] || 'Sin estado'}`);
      console.log(`Fecha: ${row[9] || 'Sin fecha'}`);
      console.log(`Items: ${row[5] ? 'Sí' : 'No'}`);
      console.log(`Payment ID: ${row[7] || 'Sin payment ID'}`);
      console.log(`Payment Status: ${row[8] || 'Sin payment status'}`);
      console.log(`Payment Method: ${row[10] || 'Sin método de pago'}`);
    });

    // Buscar duplicados por ID
    console.log('\n🔍 Buscando duplicados...');
    const orderIds = orderRows.map(row => row[0]).filter(id => id);
    const duplicateIds = orderIds.filter((id, index) => orderIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      console.log('⚠️ IDs duplicados encontrados:', duplicateIds);
    } else {
      console.log('✅ No se encontraron IDs duplicados');
    }

    // Buscar duplicados por email y fecha
    console.log('\n🔍 Buscando posibles duplicados por email y fecha...');
    const ordersByEmailAndDate = {};
    orderRows.forEach((row, index) => {
      const email = row[1];
      const date = row[9];
      const key = `${email}_${date}`;
      
      if (!ordersByEmailAndDate[key]) {
        ordersByEmailAndDate[key] = [];
      }
      ordersByEmailAndDate[key].push({ index: index + 2, row }); // +2 porque empezamos en fila 2
    });

    let foundDuplicates = false;
    Object.entries(ordersByEmailAndDate).forEach(([key, orders]) => {
      if (orders.length > 1) {
        console.log(`⚠️ Posibles duplicados para ${key}:`);
        orders.forEach(order => {
          console.log(`  Fila ${order.index}: ID=${order.row[0]}, Total=${order.row[3]}`);
        });
        foundDuplicates = true;
      }
    });

    if (!foundDuplicates) {
      console.log('✅ No se encontraron duplicados por email y fecha');
    }

    // Simular lo que devolvería la API para un usuario específico
    console.log('\n🔄 Simulando respuesta de API...');
    
    // Buscar un usuario con pedidos para testear
    const userEmails = [...new Set(orderRows.map(row => row[1]).filter(email => email))];
    console.log('👥 Emails de usuarios encontrados:', userEmails);
    
    if (userEmails.length > 0) {
      const testEmail = userEmails[0];
      console.log(`\n🧪 Testando API para usuario: ${testEmail}`);
      
      const userOrders = orderRows.filter(row => row[1] === testEmail);
      console.log(`📊 Pedidos para ${testEmail}: ${userOrders.length}`);
      
      userOrders.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row[0]}, Total: ${row[3]}, Estado: ${row[4]}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Ejecutar el debug
debugOrdersDiscrepancy().then(() => {
  console.log('\n✅ Debug completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error ejecutando debug:', error);
  process.exit(1);
});
