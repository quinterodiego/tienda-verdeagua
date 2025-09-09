import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyDebugAdminAccess } from '@/lib/debug-admin-helper';
import { getAdminEmailsFromSheets } from '@/lib/admin-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Verificando sesión actual:', session);
    
    // Obtener administradores dinámicamente
    const adminEmails = await getAdminEmailsFromSheets();
    const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);
    
    return NextResponse.json({
      success: true,
      session: {
        user: session?.user || null,
        expires: session?.expires || null,
      },
      adminCheck: {
        email: session?.user?.email || 'NO EMAIL',
        isAdmin,
        adminEmails,
        isInList: adminEmails.includes(session?.user?.email || ''),
        dynamicAdmin: true // Indica que usa sistema dinámico
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error verificando sesión:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error verificando sesión',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
