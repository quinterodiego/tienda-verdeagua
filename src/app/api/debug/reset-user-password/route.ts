import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersFromSheets, updateUserPassword } from '@/lib/users-sheets-new';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('🔍 Listando usuarios desde Google Sheets...');
    
    const users = await getAllUsersFromSheets();
    
    return NextResponse.json({
      success: true,
      message: `Se encontraron ${users.length} usuarios`,
      users: users.map(user => ({
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: true, // Asumimos activos por defecto
        hasPassword: !!user.password,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Error listando usuarios:', error);
    
    return NextResponse.json({
      error: 'Error listando usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, newPassword } = await request.json();
    
    if (action === 'reset-password') {
      if (!email || !newPassword) {
        return NextResponse.json({
          error: 'Email y nueva contraseña son requeridos'
        }, { status: 400 });
      }
      
      if (newPassword.length < 6) {
        return NextResponse.json({
          error: 'La contraseña debe tener al menos 6 caracteres'
        }, { status: 400 });
      }
      
      console.log(`🔄 Reseteando contraseña para: ${email}`);
      
      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Actualizar en Google Sheets
      await updateUserPassword(email, hashedPassword);
      
      console.log('✅ Contraseña actualizada exitosamente');
      
      return NextResponse.json({
        success: true,
        message: `Contraseña actualizada exitosamente para ${email}`,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      error: 'Acción no válida'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Error en reset de contraseña:', error);
    
    return NextResponse.json({
      error: 'Error reseteando contraseña',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
