import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const debug = {
      environment: process.env.NODE_ENV,
      nextauth_url: process.env.NEXTAUTH_URL,
      google_client_id: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      google_client_secret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      nextauth_secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      debug
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
