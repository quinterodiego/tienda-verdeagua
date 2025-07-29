import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-config';
import { migrateAdminProductsToSheets } from '@/lib/admin-products-sheets';
import { setupAdminUsersHeaders } from '@/lib/admin-users-sheets';
import { ensureSheetsExist } from '@/lib/google-sheets';
import { setupCategoriesHeaders } from '@/lib/categories-sheets';

// POST /api/admin/setup - Configurar hojas de Google Sheets para admin
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const results = {
      sheetsCreated: false,
      productsSetup: false,
      usersSetup: false,
      categoriesSetup: false,
      errors: [] as string[]
    };

    try {
      // 1. Asegurar que las hojas existan
      await ensureSheetsExist();
      results.sheetsCreated = true;
      console.log('✅ Hojas de Google Sheets verificadas/creadas');
    } catch (error) {
      const errorMsg = 'Error al crear hojas de Google Sheets';
      console.error(errorMsg, error);
      results.errors.push(errorMsg);
    }

    try {
      // 2. Configurar productos de admin
      await migrateAdminProductsToSheets();
      results.productsSetup = true;
      console.log('✅ Configuración de productos de admin completada');
    } catch (error) {
      const errorMsg = 'Error al configurar productos de admin';
      console.error(errorMsg, error);
      results.errors.push(errorMsg);
    }

    try {
      // 3. Configurar usuarios de admin
      await setupAdminUsersHeaders();
      results.usersSetup = true;
      console.log('✅ Configuración de usuarios de admin completada');
    } catch (error) {
      const errorMsg = 'Error al configurar usuarios de admin';
      console.error(errorMsg, error);
      results.errors.push(errorMsg);
    }

    try {
      // 4. Configurar categorías
      await setupCategoriesHeaders();
      results.categoriesSetup = true;
      console.log('✅ Configuración de categorías completada');
    } catch (error) {
      const errorMsg = 'Error al configurar categorías';
      console.error(errorMsg, error);
      results.errors.push(errorMsg);
    }

    const allSuccess = results.sheetsCreated && results.productsSetup && results.usersSetup && results.categoriesSetup;

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess 
        ? 'Configuración de admin completada exitosamente' 
        : 'Configuración de admin completada con algunos errores',
      results: results
    });

  } catch (error) {
    console.error('Error en configuración de admin:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
