import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { promises as dns } from 'dns';

export async function GET() {
  try {
    console.log('🔍 Iniciando diagnóstico completo de configuración SMTP...');
    
    // 1. Verificar variables de entorno
    const envCheck = {
      EMAIL_HOST: process.env.EMAIL_HOST || 'NO CONFIGURADO',
      EMAIL_PORT: process.env.EMAIL_PORT || 'NO CONFIGURADO',
      EMAIL_USER: process.env.EMAIL_USER ? '✅ Configurado' : '❌ No configurado',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ No configurado',
      EMAIL_FROM: process.env.EMAIL_FROM || 'NO CONFIGURADO'
    };

    console.log('📋 Variables de entorno:', envCheck);

    // 2. Verificar configuración del transporter
    let transporterConfig;
    try {
      transporterConfig = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false // Para desarrollo/testing
        }
      };
      
      console.log('⚙️ Configuración del transporter:', {
        ...transporterConfig,
        auth: { user: transporterConfig.auth.user, pass: '***' }
      });
    } catch (error) {
      console.error('❌ Error creando configuración:', error);
      return NextResponse.json({
        success: false,
        error: 'Error en configuración del transporter',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    // 3. Crear transporter y verificar conexión
    let verificationResult;
    try {
      const transporter = nodemailer.createTransporter(transporterConfig);
      
      console.log('🔗 Intentando verificar conexión SMTP...');
      verificationResult = await transporter.verify();
      console.log('✅ Verificación SMTP exitosa:', verificationResult);
      
    } catch (error) {
      console.error('❌ Error en verificación SMTP:', error);
      verificationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    // 4. Test de DNS lookup específico para Gmail
    let dnsTest;
    try {
      const addresses = await dns.lookup('smtp.gmail.com');
      dnsTest = {
        success: true,
        addresses
      };
      console.log('🌐 DNS lookup exitoso:', addresses);
    } catch (error) {
      console.error('❌ DNS lookup falló:', error);
      dnsTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    const response = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
      envVariables: envCheck,
      transporterConfig: {
        ...transporterConfig,
        auth: { user: transporterConfig.auth.user, pass: '***' }
      },
      smtpVerification: verificationResult,
      dnsTest,
      recommendations: []
    };

    // Generar recomendaciones
    if (!verificationResult || verificationResult.success === false) {
      response.recommendations.push('❌ Conexión SMTP falló - verificar credenciales');
    }
    
    if (!dnsTest.success) {
      response.recommendations.push('❌ DNS lookup falló - problema de red o configuración');
    }
    
    if (envCheck.EMAIL_HOST !== 'smtp.gmail.com') {
      response.recommendations.push('⚠️ HOST debería ser smtp.gmail.com para Gmail');
    }
    
    if (envCheck.EMAIL_PORT !== '587' && envCheck.EMAIL_PORT !== '465') {
      response.recommendations.push('⚠️ Puerto debería ser 587 (STARTTLS) o 465 (SSL)');
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Error general en diagnóstico:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
