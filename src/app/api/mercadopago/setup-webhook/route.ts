import { NextRequest, NextResponse } from 'next/server';
import { getPreferenceService } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl } = body;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'URL del webhook requerida' }, { status: 400 });
    }

    const preferenceService = getPreferenceService();
    
    // Crear una preferencia de prueba con webhook configurado
    const preference = {
      items: [
        {
          id: 'webhook-test',
          title: 'Test de configuración de webhook',
          quantity: 1,
          unit_price: 100,
          currency_id: 'ARS'
        }
      ],
      notification_url: webhookUrl,
      external_reference: `webhook-test-${Date.now()}`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/webhook-test-success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/webhook-test-failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/webhook-test-pending`
      },
      auto_return: 'approved'
    };

    const result = await preferenceService.create({ body: preference });

    return NextResponse.json({
      success: true,
      message: 'Webhook configurado correctamente',
      webhookUrl: webhookUrl,
      testPreferenceId: result.id,
      testUrl: result.init_point
    });

  } catch (error) {
    console.error('Error configurando webhook:', error);
    return NextResponse.json(
      { error: 'Error configurando webhook', details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`;
  
  return NextResponse.json({
    webhookUrl,
    status: 'active',
    instructions: [
      '1. Copia la URL del webhook mostrada arriba',
      '2. Ve a tu panel de MercadoPago: https://www.mercadopago.com.ar/developers/panel/notifications/webhooks',
      '3. Configura la URL del webhook',
      '4. Selecciona los eventos: payments, merchant_orders',
      '5. Guarda la configuración'
    ]
  });
}
