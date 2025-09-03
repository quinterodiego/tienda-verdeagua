import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { updateOrderTrackingInSheets } from '@/lib/orders-sheets';

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si es admin
    const userRole = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/user-role`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const roleData = await userRole.json();
    if (!roleData.success || roleData.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { orderId, trackingNumber, shippingUrl } = await request.json();
    
    if (!orderId || !trackingNumber) {
      return NextResponse.json({ 
        error: 'ID de pedido y número de tracking requeridos' 
      }, { status: 400 });
    }

    // Validar formato del tracking number (básico)
    if (trackingNumber.length < 5 || trackingNumber.length > 50) {
      return NextResponse.json({ 
        error: 'El número de tracking debe tener entre 5 y 50 caracteres' 
      }, { status: 400 });
    }

    console.log('📦 Actualizando tracking para pedido:', orderId, 'con número:', trackingNumber, 'y URL:', shippingUrl);

    // Actualizar el tracking number y URL en Google Sheets
    const result = await updateOrderTrackingInSheets(orderId, trackingNumber, shippingUrl);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Error al actualizar tracking' 
      }, { status: 500 });
    }

    // Enviar email de notificación al cliente
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: result.customerEmail,
          customerName: result.customerName,
          orderId,
          trackingNumber
        })
      });
      console.log('📧 Email de tracking enviado a:', result.customerEmail);
    } catch (emailError) {
      console.error('Error enviando email de tracking:', emailError);
      // No fallar la operación por error de email
    }

    return NextResponse.json({ 
      success: true,
      message: 'Número de tracking actualizado exitosamente',
      customerNotified: true
    });

  } catch (error) {
    console.error('Error actualizando tracking:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
