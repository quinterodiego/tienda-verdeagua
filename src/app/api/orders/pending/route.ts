import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveOrderToSheets } from '@/lib/orders-sheets';
import { Product } from '@/types';

// POST /api/orders/pending - Crear orden pendiente antes del pago
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creando orden pendiente...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('❌ Usuario no autenticado');
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Datos recibidos para orden pendiente:', JSON.stringify(body, null, 2));
    
    const { preferenceId, items, formData, paymentMethod, total } = body;
    
    // Validar datos requeridos
    if (!preferenceId || !items || !formData || !total) {
      return NextResponse.json({ 
        error: 'Faltan datos requeridos: preferenceId, items, formData, total' 
      }, { status: 400 });
    }

    // Preparar datos del cliente
    const customerName = formData.firstName && formData.lastName 
      ? `${formData.firstName} ${formData.lastName}`
      : (session.user?.name || '');
    
    const customerEmail = formData.email || session.user?.email || '';
    
    // Preparar dirección de envío
    const shippingAddress = {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      zipCode: formData.zipCode || '',
      phone: formData.phone || ''
    };
    
    // Transformar items a estructura CartItem
    const transformedItems = items.map((item: {
      id?: string;
      name?: string;
      price?: number;
      image?: string;
      description?: string;
      category?: string;
      stock?: number;
      quantity?: number;
      product?: Partial<Product>;
    }) => {
      if (item.product && typeof item.quantity === 'number') {
        return item;
      }
      
      return {
        product: {
          id: item.id || item.product?.id || '',
          name: item.name || item.product?.name || '',
          price: item.price || item.product?.price || 0,
          image: item.image || item.product?.image || '',
          description: item.description || item.product?.description || '',
          category: item.category || item.product?.category || '',
          stock: item.stock || item.product?.stock || 0
        },
        quantity: item.quantity || 1
      };
    });

    // Crear objeto de orden pendiente
    const orderData = {
      customer: {
        id: customerEmail,
        name: customerName,
        email: customerEmail,
      },
      items: transformedItems,
      total,
      status: 'payment_pending' as const, // Nuevo estado
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentId: preferenceId, // Usar preferenceId como paymentId inicial
      paymentMethod: paymentMethod || 'mercadopago',
      paymentStatus: 'pending' as const,
      shippingAddress,
      shippingMethod: 'pickup',
      shippingCost: 0
    };
    
    console.log('💾 Guardando orden pendiente en Google Sheets...');
    
    // Modo DEBUG si no hay credenciales
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_CLIENT_EMAIL) {
      console.log('⚠️ MODO DEBUG: Simulando guardado de orden pendiente');
      const mockOrderId = `ORD-PENDING-${Date.now()}`;
      
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        message: 'Orden pendiente simulada (Google Sheets no configurado)',
        debug: true
      });
    }
    
    // Guardar orden pendiente en Google Sheets
    const orderId = await saveOrderToSheets(orderData);
    
    if (!orderId) {
      console.error('❌ Error al guardar orden pendiente');
      throw new Error('Error al guardar la orden pendiente en Google Sheets');
    }
    
    console.log('✅ Orden pendiente creada exitosamente:', orderId);
    
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Orden pendiente creada exitosamente',
      status: 'payment_pending'
    });

  } catch (error) {
    console.error('❌ Error al crear orden pendiente:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear orden pendiente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// GET /api/orders/pending - Obtener órdenes pendientes (para admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo para propósitos de debugging - en producción podrías agregar lógica de admin
    console.log('📋 Consultando órdenes pendientes...');
    
    return NextResponse.json({
      success: true,
      message: 'Endpoint para consultar órdenes pendientes',
      note: 'Implementar lógica de consulta según necesidades'
    });

  } catch (error) {
    console.error('❌ Error al obtener órdenes pendientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener órdenes pendientes' },
      { status: 500 }
    );
  }
}
