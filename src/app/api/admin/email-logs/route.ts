import { NextRequest, NextResponse } from 'next/server';
import { getEmailLogs, initializeEmailLogsSheet, SPREADSHEET_ID } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Verificar que tenemos configuración de Google Sheets
    if (!SPREADSHEET_ID) {
      return NextResponse.json({
        error: 'Google Sheets no configurado'
      }, { status: 500 });
    }

    // Obtener parámetros de filtro
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const orderId = searchParams.get('orderId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    console.log('Obteniendo email logs con filtros:', { type, status, orderId, limit });

    // Asegurar que la pestaña existe
    await initializeEmailLogsSheet();

    // Obtener logs con filtros
    const logs = await getEmailLogs({
      type: type as 'order_status' | 'welcome' | 'password_reset' | 'admin_notification' | undefined,
      status: status as 'sent' | 'failed' | 'pending' | undefined,
      orderId,
      limit
    });

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
      filters: { type, status, orderId, limit }
    });

  } catch (error) {
    console.error('Error obteniendo email logs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'initialize') {
      // Inicializar la pestaña de logs de emails
      const result = await initializeEmailLogsSheet();
      
      if (result) {
        return NextResponse.json({
          success: true,
          message: 'Pestaña de Email Logs inicializada correctamente'
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Error al inicializar la pestaña de Email Logs'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Acción no válida'
    }, { status: 400 });

  } catch (error) {
    console.error('Error en POST email logs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
