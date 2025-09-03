import { NextRequest, NextResponse } from 'next/server';

// Endpoint para verificar si las credenciales de MercadoPago funcionan
export async function POST() {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'ACCESS_TOKEN no configurado' 
      }, { status: 500 });
    }

    // Hacer una llamada simple a la API de MercadoPago para validar credenciales
    const response = await fetch('https://api.mercadopago.com/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas',
        status: response.status,
        details: data
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Credenciales válidas',
      user: {
        id: data.id,
        email: data.email,
        country: data.site_id,
        status: data.status
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error validando credenciales:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
