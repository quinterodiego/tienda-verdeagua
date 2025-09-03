import { NextRequest, NextResponse } from 'next/server';
import { registerUserWithCredentials, getUserFromSheets } from '@/lib/users-sheets';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST: Probando el sistema de registro...');
    
    const testEmail = 'test@example.com';
    const testPassword = 'test123';
    const testName = 'Usuario Test';

    // 1. Verificar si el usuario ya existe y eliminarlo
    console.log('🔍 Verificando si el usuario test ya existe...');
    const existingUser = await getUserFromSheets(testEmail);
    if (existingUser) {
      console.log('⚠️ Usuario test ya existe, esto es esperado en producción');
      return NextResponse.json({
        status: 'INFO',
        message: 'Usuario test ya existe',
        existingUser: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          createdAt: existingUser.createdAt
        }
      });
    }

    // 2. Intentar registrar el usuario
    console.log('📝 Intentando registrar usuario test...');
    const newUser = await registerUserWithCredentials(testEmail, testPassword, testName);
    
    if (newUser) {
      console.log('✅ Usuario test registrado exitosamente');
      return NextResponse.json({
        status: 'SUCCESS',
        message: 'Sistema de registro funcionando correctamente',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      });
    } else {
      console.log('❌ Error al registrar usuario test');
      return NextResponse.json({
        status: 'ERROR',
        message: 'Error al registrar usuario test'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en test de registro:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Error en test de registro',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de prueba para el sistema de registro',
    usage: 'Envía POST a este endpoint para probar el registro'
  });
}
