import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando correctamente',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasGoogleSheetId: !!process.env.GOOGLE_SHEET_ID,
      hasGoogleCredentials: !!process.env.GOOGLE_CLIENT_EMAIL,
    }
  });
}
