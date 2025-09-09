import { NextRequest, NextResponse } from 'next/server';
import { registerUserWithCredentials, getUserFromSheets } from '@/lib/users-sheets';
import { sendWelcomeEmail, sendEmail } from '@/lib/email';

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

    console.log('✅ Usuario creado exitosamente:', user.email);

    // Enviar email de bienvenida al usuario
    try {
      console.log('📧 Enviando email de bienvenida...');
      await sendWelcomeEmail({
        userEmail: user.email,
        userName: user.name,
        loginUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
      });
      console.log('✅ Email de bienvenida enviado');
    } catch (emailError) {
      console.error('⚠️ Error enviando email de bienvenida (continuando):', emailError);
      // No fallar el registro por error de email
    }

    // Enviar notificación al administrador
    try {
      console.log('🔔 Enviando notificación al administrador...');
      const adminEmail = process.env.EMAIL_ADMIN || 'coderflixarg@gmail.com';
      
      await sendEmail({
        to: adminEmail,
        subject: `🎉 Nuevo Usuario Registrado - ${user.name}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #2d5a27;">🎉 Nuevo Usuario Registrado</h2>
            <div style="background: #f0f8f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>📊 Información del Usuario:</h3>
              <ul>
                <li><strong>Nombre:</strong> ${user.name}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Rol:</strong> ${user.role || 'user'}</li>
                <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px;">
              Este usuario se registró exitosamente en Verde Agua Personalizados.
            </p>
          </div>
        `
      });
      console.log('✅ Notificación al administrador enviada');
    } catch (adminEmailError) {
      console.error('⚠️ Error enviando notificación al admin (continuando):', adminEmailError);
      // No fallar el registro por error de email
    }

    // Retornar usuario sin password
    const { password: userPassword, ...userWithoutPassword } = user;
    
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
