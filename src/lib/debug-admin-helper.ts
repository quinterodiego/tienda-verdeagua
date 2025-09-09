import { verifyAdminAccess } from '@/lib/admin-config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Función helper para verificar acceso administrativo en endpoints de debug
 * Reemplaza los hardcoded adminEmails con verificación dinámica
 */
export async function verifyDebugAdminAccess(): Promise<{
  success: boolean;
  response?: NextResponse;
  userEmail?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return {
        success: false,
        response: NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      };
    }

    const isAdmin = await verifyAdminAccess(session.user.email);
    
    if (!isAdmin) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
      };
    }

    return {
      success: true,
      userEmail: session.user.email
    };
  } catch (error) {
    console.error('Error al verificar acceso debug admin:', error);
    return {
      success: false,
      response: NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    };
  }
}
