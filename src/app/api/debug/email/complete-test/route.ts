import { NextRequest, NextResponse } from 'next/server';
import { 
  sendEmail, 
  sendOrderConfirmationEmail, 
  sendOrderNotificationToAdmin,
  createOrderStatusUpdateEmail 
} from '@/lib/email';

// POST /api/debug/email/complete-test - Test completo del sistema de emails
export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return NextResponse.json({ 
        error: 'Email de prueba inválido' 
      }, { status: 400 });
    }

    console.log(`🧪 Iniciando test completo de emails a: ${testEmail}`);
    
    const results = [];
    const testOrderId = `TEST-${Date.now()}`;
    
    // 1. Test de email básico
    try {
      console.log('1️⃣ Probando email básico...');
      const basicResult = await sendEmail({
        to: testEmail,
        subject: '🧪 Test 1: Email Básico - Verde Agua',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">✅ Email Básico Funcionando</h2>
            <p>Este es un test del sistema básico de envío de emails.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
          </div>
        `
      });
      
      results.push({
        test: 'Email Básico',
        success: basicResult.success,
        messageId: basicResult.messageId,
        error: basicResult.error
      });
    } catch (error) {
      results.push({
        test: 'Email Básico',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    // 2. Test de confirmación de pedido
    try {
      console.log('2️⃣ Probando email de confirmación de pedido...');
      const orderResult = await sendOrderConfirmationEmail({
        orderId: testOrderId,
        customerName: 'Cliente de Prueba',
        customerEmail: testEmail,
        items: [
          { productName: 'Producto Test 1', quantity: 2, price: 1500 },
          { productName: 'Producto Test 2', quantity: 1, price: 2500 }
        ],
        total: 5500,
        orderDate: new Date().toISOString()
      });

      results.push({
        test: 'Confirmación de Pedido',
        success: orderResult.success,
        messageId: orderResult.messageId,
        error: orderResult.error
      });
    } catch (error) {
      results.push({
        test: 'Confirmación de Pedido',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    // 3. Test de notificación al admin
    try {
      console.log('3️⃣ Probando notificación al admin...');
      
      // Temporalmente cambiar EMAIL_ADMIN para enviar al email de prueba
      const originalEmailAdmin = process.env.EMAIL_ADMIN;
      process.env.EMAIL_ADMIN = testEmail;

      const adminResult = await sendOrderNotificationToAdmin({
        orderId: testOrderId,
        customerName: 'Cliente de Prueba',
        customerEmail: testEmail,
        items: [
          { productName: 'Producto Test 1', quantity: 2, price: 1500 },
          { productName: 'Producto Test 2', quantity: 1, price: 2500 }
        ],
        total: 5500,
        orderDate: new Date().toISOString()
      });

      // Restaurar EMAIL_ADMIN original
      process.env.EMAIL_ADMIN = originalEmailAdmin;

      results.push({
        test: 'Notificación Admin',
        success: adminResult.success,
        messageId: adminResult.messageId,
        error: adminResult.error
      });
    } catch (error) {
      results.push({
        test: 'Notificación Admin',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    // 4. Test de actualización de estado
    try {
      console.log('4️⃣ Probando email de actualización de estado...');
      const statusTemplate = createOrderStatusUpdateEmail({
        orderId: testOrderId,
        customerName: 'Cliente de Prueba',
        customerEmail: testEmail,
        newStatus: 'shipped',
        items: [
          { productName: 'Producto Test 1', quantity: 2, price: 1500 },
          { productName: 'Producto Test 2', quantity: 1, price: 2500 }
        ],
        total: 5500,
        orderDate: new Date().toISOString(),
        trackingNumber: 'AR123456789',
        estimatedDelivery: '2-3 días hábiles'
      });

      const statusResult = await sendEmail({
        to: testEmail,
        subject: statusTemplate.subject,
        html: statusTemplate.html
      });

      results.push({
        test: 'Actualización de Estado',
        success: statusResult.success,
        messageId: statusResult.messageId,
        error: statusResult.error
      });
    } catch (error) {
      results.push({
        test: 'Actualización de Estado',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    // 5. Test de email de contacto
    try {
      console.log('5️⃣ Probando email de contacto...');
      const contactResult = await sendEmail({
        to: testEmail,
        subject: '📩 Test: Confirmación de Contacto - Verde Agua',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #10b981; margin-bottom: 20px;">✅ Mensaje Recibido</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hola <strong>Cliente de Prueba</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hemos recibido tu mensaje sobre <strong>"Consulta de Prueba"</strong> y te contactaremos a la brevedad.
              </p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}<br>
                  <strong>Email:</strong> ${testEmail}
                </p>
              </div>
              <p style="color: #10b981; font-weight: bold; margin-top: 20px;">
                ¡Gracias por contactarnos!
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                Verde Agua Personalizados<br>
                Este es un email automático, no responder.
              </p>
            </div>
          </div>
        `
      });

      results.push({
        test: 'Email de Contacto',
        success: contactResult.success,
        messageId: contactResult.messageId,
        error: contactResult.error
      });
    } catch (error) {
      results.push({
        test: 'Email de Contacto',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    // Análisis de resultados
    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;
    const successRate = Math.round((successCount / totalTests) * 100);

    console.log(`📊 Test completado: ${successCount}/${totalTests} exitosos (${successRate}%)`);

    return NextResponse.json({
      success: successCount === totalTests,
      summary: {
        totalTests,
        successCount,
        failureCount: totalTests - successCount,
        successRate: `${successRate}%`
      },
      results,
      testEmail,
      timestamp: new Date().toISOString(),
      recommendation: successRate < 100 ? 
        'Algunos emails fallaron. Revisa la configuración SMTP y las credenciales.' :
        'Todos los emails funcionan correctamente. Sistema de notificaciones operativo.'
    });

  } catch (error) {
    console.error('❌ Error en test completo de emails:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
