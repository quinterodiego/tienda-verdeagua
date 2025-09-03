import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';
import type { TestEmailData } from '@/types/email';

export async function POST(request: NextRequest) {
  try {
    const { previewData, ...body }: TestEmailData & { previewData?: any } = await request.json();
    
    // Validación básica
    if (!body.recipientEmail) {
      return NextResponse.json(
        { error: 'El email del destinatario es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.recipientEmail)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Validar tipo de email
    const validTypes: TestEmailData['testType'][] = ['welcome', 'order_confirmation', 'custom'];
    if (!validTypes.includes(body.testType)) {
      return NextResponse.json(
        { error: 'Tipo de email no válido' },
        { status: 400 }
      );
    }

    // Validar campos requeridos para email personalizado
    if (body.testType === 'custom') {
      if (!body.customSubject && !body.customMessage) {
        return NextResponse.json(
          { error: 'Para email personalizado se requiere al menos asunto o mensaje' },
          { status: 400 }
        );
      }
    }

    // Validar configuración de email
    const requiredEnvVars = [
      'EMAIL_HOST',
      'EMAIL_USER', 
      'EMAIL_PASSWORD',
      'EMAIL_FROM'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          error: 'Configuración de email incompleta',
          details: `Variables faltantes: ${missingVars.join(', ')}`
        },
        { status: 500 }
      );
    }

    // Enviar email de prueba
    const result = await sendTestEmail(body);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de prueba enviado exitosamente',
        messageId: result.messageId,
        emailType: body.testType,
        recipient: body.recipientEmail,
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Error al enviar email de prueba',
          details: result.error 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en endpoint de prueba de email:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar estado del sistema de email
export async function GET() {
  try {
    // Verificar configuración
    const requiredEnvVars = [
      'EMAIL_HOST',
      'EMAIL_USER', 
      'EMAIL_PASSWORD',
      'EMAIL_FROM'
    ];

    const envStatus = requiredEnvVars.reduce((acc, varName) => {
      acc[varName] = !!process.env[varName];
      return acc;
    }, {} as Record<string, boolean>);

    const isConfigured = Object.values(envStatus).every(Boolean);

    return NextResponse.json({
      configured: isConfigured,
      status: isConfigured ? 'ready' : 'needs_configuration',
      environment_variables: envStatus,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error al verificar configuración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
