import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Obtener logs de Vercel Functions (últimas ejecuciones)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const response = {
      success: true,
      timestamp: now.toISOString(),
      checkResults: {
        googleSheetsConfig: {
          hasSheetId: !!process.env.GOOGLE_SHEET_ID,
          hasCredentials: !!(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
          status: (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) 
            ? '✅ Configurado' 
            : '❌ Falta configuración'
        },
        emailConfig: {
          hasHost: !!process.env.EMAIL_HOST,
          hasUser: !!process.env.EMAIL_USER,
          hasPassword: !!process.env.EMAIL_PASSWORD,
          hasFrom: !!process.env.EMAIL_FROM,
          status: (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_FROM)
            ? '✅ Configurado'
            : '❌ Falta configuración'
        }
      },
      recommendations: [
        'Verificar /admin/email-logs para ver logs de emails enviados',
        'Usar /debug/email-production para diagnóstico completo',
        'Revisar /api/debug/email/recent-logs para análisis rápido',
        'Comprobar Google Sheets directamente en la pestaña Logs_Emails'
      ],
      quickTests: {
        adminEmailLogs: '/admin/email-logs',
        productionDiagnostic: '/debug/email-production',
        recentLogsApi: '/api/debug/email/recent-logs',
        passwordResetTest: '/api/debug/email/password-reset-production-test'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en verificación rápida:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
