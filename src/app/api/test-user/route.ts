import { NextRequest, NextResponse } from 'next/server';
import { saveUserToSheets } from '@/lib/users-sheets';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    
    console.log('🧪 Test: Guardando usuario:', { name, email });
    
    const result = await saveUserToSheets({ 
      name, 
      email,
      role: 'user',
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: result,
      message: result ? 'Usuario guardado exitosamente' : 'Error al guardar usuario'
    });
  } catch (error) {
    console.error('Error en test:', error);
    return NextResponse.json({
      success: false,
      message: 'Error: ' + (error as Error).message
    }, { status: 500 });
  }
}
