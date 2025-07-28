import { NextRequest, NextResponse } from 'next/server';
import { registerUserWithCredentials } from '../../../../lib/users-sheets';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing credentials system...');
    
    const { email, password, name } = await request.json();
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password y name son requeridos' },
        { status: 400 }
      );
    }

    console.log('📝 Intentando registrar usuario de prueba:', email);
    
    const user = await registerUserWithCredentials(email, password, name);
    
    if (user) {
      console.log('✅ Usuario registrado exitosamente');
      return NextResponse.json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } else {
      console.log('❌ Error al registrar usuario');
      return NextResponse.json(
        { error: 'Error al registrar usuario' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error en test de credenciales:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
