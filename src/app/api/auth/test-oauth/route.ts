import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const redirectUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    const authorizeUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
      `response_type=code&` +
      `scope=openid%20profile%20email`

    return NextResponse.json({
      success: true,
      config: {
        nextauth_url: process.env.NEXTAUTH_URL,
        redirect_url: redirectUrl,
        google_client_id: process.env.GOOGLE_CLIENT_ID,
        authorize_url: authorizeUrl
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
