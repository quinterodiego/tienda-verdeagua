import { NextResponse } from 'next/server';

export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
  const mode = process.env.MERCADOPAGO_MODE;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  
  return NextResponse.json({
    status: 'debug',
    environment: 'production',
    variables: {
      MERCADOPAGO_MODE: mode || 'NOT_SET',
      MERCADOPAGO_ACCESS_TOKEN: accessToken ? 
        `${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 5)}` : 
        'NOT_SET',
      MERCADOPAGO_PUBLIC_KEY: publicKey ? 
        `${publicKey.substring(0, 10)}...${publicKey.substring(publicKey.length - 5)}` : 
        'NOT_SET',
      NEXT_PUBLIC_BASE_URL: baseUrl || 'NOT_SET',
      NEXTAUTH_URL: nextAuthUrl || 'NOT_SET'
    },
    validation: {
      hasAccessToken: !!accessToken,
      hasPublicKey: !!publicKey,
      isProductionMode: mode === 'production',
      isProductionCredentials: accessToken && !accessToken.includes('TEST-'),
      baseUrlMatches: baseUrl === 'https://vap-copilot.vercel.app'
    },
    timestamp: new Date().toISOString()
  });
}
