import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';

// Endpoint para crear usuarios de prueba de MercadoPago
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Token de MercadoPago no configurado' 
      }, { status: 500 });
    }

    // Crear vendedor de prueba
    const sellerResponse = await fetch('https://api.mercadopago.com/users/test_user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_id: 'MLA' // Argentina - cambia según tu país
      })
    });

    const seller = await sellerResponse.json();

    // Crear comprador de prueba
    const buyerResponse = await fetch('https://api.mercadopago.com/users/test_user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_id: 'MLA' // Argentina - cambia según tu país
      })
    });

    const buyer = await buyerResponse.json();

    console.log('👥 Usuarios de prueba creados:');
    console.log('🏪 Vendedor:', seller);
    console.log('🛒 Comprador:', buyer);

    return NextResponse.json({
      success: true,
      testUsers: {
        seller: {
          id: seller.id,
          nickname: seller.nickname,
          email: seller.email,
          password: seller.password,
          site_status: seller.site_status
        },
        buyer: {
          id: buyer.id,
          nickname: buyer.nickname,
          email: buyer.email,
          password: buyer.password,
          site_status: buyer.site_status
        }
      },
      instructions: {
        seller: 'Usa estas credenciales para crear una aplicación de prueba',
        buyer: 'Usa estas credenciales para hacer pagos de prueba',
        next_steps: [
          '1. Inicia sesión en developers.mercadopago.com con el usuario vendedor',
          '2. Crea una nueva aplicación',
          '3. Obtén las credenciales de prueba (TEST)',
          '4. Actualiza las variables de entorno con las credenciales TEST'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error al crear usuarios de prueba:', error);
    return NextResponse.json(
      { error: 'Error al crear usuarios de prueba' },
      { status: 500 }
    );
  }
}
