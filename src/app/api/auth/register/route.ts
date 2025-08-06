import { NextRequest, NextResponse } from 'next/server';
import { registerUserWithCredentials, getUserFromSheets } from '@/lib/users-sheets';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/auth/register iniciado');
    
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Datos de la solicitud inválidos' },
        { status: 400 }
      );
    }

    const { email, password, name } = requestData;
    console.log('📝 Datos recibidos:', { email, name });

    // Validación básica
    if (!email || !password || !name) {
      console.log('❌ Datos faltantes:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { error: 'Email, password y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email inválido:', email);
      return NextResponse.json(
        { error: 'Por favor ingresa un email válido' },
        { status: 400 }
      );
    }

    // Validar longitud del password
    if (password.length < 6) {
      console.log('❌ Password muy corto');
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar longitud del nombre
    if (name.trim().length < 2) {
      console.log('❌ Nombre muy corto');
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe...');
    let existingUser;
    try {
      existingUser = await getUserFromSheets(email);
    } catch (checkError) {
      console.error('❌ Error verificando usuario existente:', checkError);
      return NextResponse.json(
        { error: 'Error verificando usuario existente. Inténtalo nuevamente.' },
        { status: 500 }
      );
    }
    
    if (existingUser) {
      console.log('❌ Usuario ya existe:', email);
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      );
    }

    // Crear usuario
    console.log('➕ Creando nuevo usuario...');
    let user;
    try {
      user = await registerUserWithCredentials(email.trim().toLowerCase(), password, name.trim());
    } catch (createError) {
      console.error('❌ Error creando usuario:', createError);
      return NextResponse.json(
        { error: 'Error al crear el usuario. Inténtalo nuevamente.' },
        { status: 500 }
      );
    }
    
    if (!user) {
      console.log('❌ No se pudo crear el usuario');
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      );
    }

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('✅ Usuario creado exitosamente:', user.email);
    return NextResponse.json(
      { 
        message: 'Usuario creado exitosamente', 
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Error general en register route:', error);
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    } else {
      console.error('❌ Error no-Error object:', error);
    }
    
    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes('ya existe')) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 409 }
        );
      }
      
      // Error específico para problemas de conexión/timeout
      if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        return NextResponse.json(
          { error: 'Timeout de conexión. Inténtalo nuevamente.' },
          { status: 503 }
        );
      }
    }
    
    // Error genérico pero controlado
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo nuevamente.' },
      { status: 500 }
    );
  }
}
