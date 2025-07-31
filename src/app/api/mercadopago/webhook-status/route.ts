import { NextResponse } from 'next/server';

export async function GET() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const mode = process.env.MERCADOPAGO_MODE;

  return NextResponse.json({
    status: 'webhook-ready',
    configuration: {
      webhookUrl,
      baseUrl,
      mode,
      hasAccessToken: !!accessToken,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 15)}...${accessToken.substring(accessToken.length - 5)}` : 'NO_SET'
    },
    instructions: {
      step1: 'Ve a tu panel de MercadoPago',
      step2: 'Configura el webhook URL mostrado arriba',
      step3: 'Selecciona eventos: payments, merchant_orders',
      step4: 'Realiza un pago de prueba',
      step5: 'Verifica que el estado se actualice automáticamente'
    },
    webhookEndpoints: {
      webhook: `${baseUrl}/api/mercadopago/webhook`,
      setupWebhook: `${baseUrl}/api/mercadopago/setup-webhook`,
      webhookStatus: `${baseUrl}/api/mercadopago/webhook-status`
    },
    testUrls: {
      makeTestPayment: `${baseUrl}/`,
      checkOrders: `${baseUrl}/admin`,
      viewLogs: 'Vercel Functions Logs'
    }
  });
}
