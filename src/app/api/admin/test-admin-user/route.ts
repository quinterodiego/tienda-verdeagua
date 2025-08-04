import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSheets } from '@/lib/users-sheets';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test endpoint - verificando usuario sebastianperez6@hotmail.com');
    
    const user = await getUserFromSheets('sebastianperez6@hotmail.com');
    
    if (user) {
      console.log('✅ Usuario encontrado:', user);
      return NextResponse.json({
        found: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.role === 'admin',
          createdAt: user.createdAt
        }
      });
    } else {
      console.log('❌ Usuario no encontrado');
      return NextResponse.json({
        found: false,
        message: 'Usuario no encontrado en Google Sheets'
      });
    }
    
  } catch (error) {
    console.error('💥 Error en test endpoint:', error);
    return NextResponse.json({
      error: 'Error al verificar usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
