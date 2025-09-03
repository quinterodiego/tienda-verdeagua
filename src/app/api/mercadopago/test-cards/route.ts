import { NextRequest, NextResponse } from 'next/server';

// Endpoint para obtener datos de tarjetas de prueba de MercadoPago
export async function GET(request: NextRequest) {
  try {
    const testCards = {
      argentina: {
        approved: [
          {
            card_number: '4509 9535 6623 3704',
            security_code: '123',
            expiration_date: '11/25',
            cardholder: {
              name: 'APRO',
              identification: {
                type: 'DNI',
                number: '12345678'
              }
            },
            result: 'Pago aprobado'
          },
          {
            card_number: '5031 7557 3453 0604',
            security_code: '123',
            expiration_date: '11/25',
            cardholder: {
              name: 'APRO',
              identification: {
                type: 'DNI',
                number: '12345678'
              }
            },
            result: 'Pago aprobado'
          }
        ],
        rejected: [
          {
            card_number: '4013 5406 8274 6260',
            security_code: '123',
            expiration_date: '11/25',
            cardholder: {
              name: 'OTHE',
              identification: {
                type: 'DNI',
                number: '12345678'
              }
            },
            result: 'Rechazado por datos inválidos'
          },
          {
            card_number: '5031 7557 3453 0604',
            security_code: '123',
            expiration_date: '11/25',
            cardholder: {
              name: 'FUND',
              identification: {
                type: 'DNI',
                number: '12345678'
              }
            },
            result: 'Rechazado por fondos insuficientes'
          }
        ],
        pending: [
          {
            card_number: '4509 9535 6623 3704',
            security_code: '123',
            expiration_date: '11/25',
            cardholder: {
              name: 'CONT',
              identification: {
                type: 'DNI',
                number: '12345678'
              }
            },
            result: 'Pago pendiente'
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      testCards,
      instructions: {
        usage: 'Usa estas tarjetas SOLO en modo de prueba',
        important: 'NUNCA uses estas tarjetas en producción',
        note: 'El nombre del titular determina el resultado del pago'
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener tarjetas de prueba:', error);
    return NextResponse.json(
      { error: 'Error al obtener tarjetas de prueba' },
      { status: 500 }
    );
  }
}
