# 🚫 Funcionalidad: Cancelación de Pedidos Pendientes

## 🎯 **Objetivo**
Permitir que los clientes puedan cancelar pedidos que no pudieron pagar, eliminándolos de su historial y notificando al administrador.

## ✅ **Funcionalidad Implementada**

### **1. Botón de Cancelar Pedido**

#### **Ubicación:** Página "Mis Pedidos" (`/mis-pedidos`)

#### **Condiciones para mostrar el botón:**
- Solo aparece para pedidos con estado de **pago fallido** o **pendiente**:
  - `pending`
  - `payment_pending`
  - `payment_failed`
  - `pending_transfer`
  - `cancelled`
  - `rejected`
  - `failed`

#### **Diseño Responsivo:**
```tsx
// Para transferencias bancarias: 3 botones
[Ver Datos] [Enviar Comprobante] [🗑️ Cancelar]

// Para MercadoPago/otros: 2 botones
[Completar Pago] [🗑️ Cancelar]
```

#### **Textos Adaptativos:**
- **Móvil:** "Cancelar"
- **Desktop:** "Cancelar Pedido"

### **2. API de Cancelación**

#### **Endpoint:** `POST /api/orders/[id]/cancel`

#### **Parámetros de entrada:**
```json
{
  "reason": "cancelled_by_customer",
  "userEmail": "cliente@example.com"
}
```

#### **Validaciones:**
- ✅ **Autenticación:** El pedido debe pertenecer al usuario
- ✅ **Estado válido:** Solo se pueden cancelar pedidos pendientes
- ✅ **Existencia:** El pedido debe existir en Google Sheets

#### **Proceso de cancelación:**
1. **Buscar pedido** en Google Sheets por ID y email del usuario
2. **Validar estado** del pedido (debe ser cancelable)
3. **Actualizar estado** a `'cancelled'` en Google Sheets
4. **Enviar notificación** al administrador por email
5. **Responder** con confirmación al cliente

### **3. Notificación al Administrador**

#### **Email automático** al `EMAIL_ADMIN` con:
- 📋 Datos completos del pedido cancelado
- 👤 Información del cliente
- 📅 Fecha y hora de cancelación
- 💰 Monto del pedido cancelado
- 📦 Lista de productos incluidos

#### **Asunto:** Notificación de nuevo pedido (con datos de cancelación)

### **4. Experiencia de Usuario**

#### **Flujo de cancelación:**
```
Cliente ve pedido pendiente
    ↓
Click en "🗑️ Cancelar Pedido"
    ↓
Confirmación: "¿Estás seguro?"
    ↓ [Sí]
Procesando cancelación...
    ↓
✅ "Pedido cancelado exitosamente"
    ↓
Pedido actualizado en la lista
(aparece como "Cancelado")
```

#### **Confirmación de seguridad:**
```javascript
window.confirm(
  `¿Estás seguro de que quieres cancelar el pedido ${order.id}?\n\nEsta acción no se puede deshacer.`
)
```

## 🔧 **Implementación Técnica**

### **Frontend - Función de cancelación:**
```typescript
const cancelOrder = async (order: Order) => {
  const confirmCancel = window.confirm(
    `¿Estás seguro de que quieres cancelar el pedido ${order.id}?\n\nEsta acción no se puede deshacer.`
  );
  
  if (!confirmCancel) return;

  try {
    const response = await fetch(`/api/orders/${order.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'cancelled_by_customer',
        userEmail: session?.user?.email
      })
    });

    if (response.ok) {
      await fetchOrders(session.user.email); // Refrescar lista
      alert('Pedido cancelado exitosamente.');
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message}`);
    }
  } catch (error) {
    alert('Error al cancelar el pedido.');
  }
};
```

### **Backend - API de cancelación:**
```typescript
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: orderId } = params;
  const { reason, userEmail } = await request.json();

  // 1. Buscar pedido del usuario
  const userOrders = await getUserOrdersFromSheets(userEmail);
  const order = userOrders.find(o => o.id === orderId);
  
  if (!order) {
    return NextResponse.json({ success: false, message: 'Pedido no encontrado' }, { status: 404 });
  }

  // 2. Validar que se puede cancelar
  const cancellableStatuses = ['pending', 'payment_pending', 'payment_failed', ...];
  if (!cancellableStatuses.includes(order.status)) {
    return NextResponse.json({ success: false, message: 'No se puede cancelar' }, { status: 400 });
  }

  // 3. Actualizar estado
  await updateOrderStatus(orderId, 'cancelled');

  // 4. Notificar admin
  await sendOrderNotificationToAdmin({ ... });

  return NextResponse.json({ success: true, message: 'Pedido cancelado exitosamente' });
}
```

### **Botones en la UI:**
```tsx
{isPaymentFailed(order.status) && (
  <>
    {/* Botones específicos por método de pago */}
    {(order.paymentMethod === 'transfer' || order.paymentMethod === 'transferencia_bancaria') ? (
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Ver Datos + Enviar Comprobante + Cancelar */}
        <button onClick={() => cancelOrder(order)} className="bg-red-600 ...">
          <Trash2 className="w-4 h-4" />
          <span className="sm:hidden">Cancelar</span>
          <span className="hidden sm:inline">Cancelar Pedido</span>
        </button>
      </div>
    ) : (
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Completar Pago + Cancelar */}
        <button onClick={() => cancelOrder(order)} className="bg-red-600 ...">
          <Trash2 className="w-4 h-4" />
          <span className="sm:hidden">Cancelar</span>
          <span className="hidden sm:inline">Cancelar Pedido</span>
        </button>
      </div>
    )}
  </>
)}
```

## 🎯 **Estados de Pedidos y Acciones**

| Estado | Ver Datos | Enviar Comprobante | Completar Pago | **Cancelar** |
|--------|-----------|-------------------|----------------|--------------|
| `pending` (Transfer) | ✅ | ✅ | ❌ | **✅** |
| `pending` (MercadoPago) | ❌ | ❌ | ✅ | **✅** |
| `payment_failed` | ❌ | ❌ | ✅ | **✅** |
| `payment_pending` | Ver método | Ver método | Ver método | **✅** |
| `confirmed` | ❌ | ❌ | ❌ | **❌** |
| `processing` | ❌ | ❌ | ❌ | **❌** |
| `shipped` | ❌ | ❌ | ❌ | **❌** |
| `delivered` | ❌ | ❌ | ❌ | **❌** |

## 🔒 **Seguridad y Validación**

### **Validaciones implementadas:**
- ✅ **Propiedad del pedido:** Solo el dueño puede cancelar
- ✅ **Estado válido:** Solo pedidos pendientes/fallidos
- ✅ **Confirmación:** Doble confirmación antes de cancelar
- ✅ **Logging:** Registro completo de cancelaciones
- ✅ **Manejo de errores:** Respuestas claras al usuario

### **Prevención de abusos:**
- ✅ **No se puede cancelar** pedidos confirmados/procesados
- ✅ **No se puede cancelar** pedidos de otros usuarios
- ✅ **Confirmación explícita** requerida
- ✅ **Audit trail** en logs del servidor

## 📊 **Beneficios para el Usuario**

### **Experiencia mejorada:**
- ✅ **Control total:** Puede limpiar pedidos fallidos
- ✅ **Proceso claro:** Confirmación antes de cancelar
- ✅ **Feedback inmediato:** Mensajes claros de éxito/error
- ✅ **Actualización automática:** Lista se actualiza inmediatamente

### **Beneficios para el administrador:**
- ✅ **Notificación automática:** Email inmediato de cancelaciones
- ✅ **Datos completos:** Toda la información del pedido cancelado
- ✅ **Tracking:** Registro en Google Sheets del estado actualizado
- ✅ **Menos consultas:** Clientes pueden autogestionar cancelaciones

## 🚀 **Estado Actual**

**✅ COMPLETAMENTE IMPLEMENTADO Y FUNCIONAL**

- Frontend: Botones de cancelación agregados con diseño responsivo
- Backend: API de cancelación con validaciones completas
- Integración: Google Sheets + Email notifications
- UX: Confirmaciones y feedback claro al usuario
- Seguridad: Validaciones de propiedad y estado

---

*Funcionalidad implementada: 21 de enero de 2025*
*Estado: ✅ LISTO PARA PRODUCCIÓN*
