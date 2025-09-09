import { NextResponse } from 'next/server';
import { getEmailLogs } from '@/lib/google-sheets';

export async function GET() {
  try {
    console.log('🔍 Obteniendo logs recientes de emails...');
    
    // Obtener los últimos 20 logs
    const logs = await getEmailLogs({
      limit: 20
    });

    console.log(`📧 Encontrados ${logs.length} logs de emails`);

    // Separar por estado para análisis rápido
    const analysis = {
      total: logs.length,
      sent: logs.filter(log => log.status === 'sent').length,
      failed: logs.filter(log => log.status === 'failed').length,
      pending: logs.filter(log => log.status === 'pending').length,
      byType: {
        order_status: logs.filter(log => log.type === 'order_status').length,
        welcome: logs.filter(log => log.type === 'welcome').length,
        password_reset: logs.filter(log => log.type === 'password_reset').length,
        admin_notification: logs.filter(log => log.type === 'admin_notification').length,
      }
    };

    // Obtener los últimos 5 logs para mostrar detalles
    const recentLogs = logs.slice(0, 5).map(log => ({
      id: log.id.substring(0, 8), // Solo primeros 8 caracteres del ID
      timestamp: log.timestamp,
      type: log.type,
      to: log.to,
      subject: log.subject.substring(0, 50) + (log.subject.length > 50 ? '...' : ''), // Truncar asunto
      status: log.status,
      error: log.errorMessage || null
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis,
      recentLogs,
      message: `Se encontraron ${logs.length} logs de emails. Últimos ${recentLogs.length} mostrados.`
    });

  } catch (error) {
    console.error('❌ Error obteniendo logs de emails:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
      message: 'No se pudieron obtener los logs. Verifica la configuración de Google Sheets.'
    }, { status: 500 });
  }
}
