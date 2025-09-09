# 📋 Sistema de Órdenes Pendientes - Implementación Completa

## 🎯 **PROBLEMA RESUELTO**

**Antes:** Si un pago fallaba en MercadoPago, se perdían todos los datos del cliente y productos seleccionados. No había manera de rastrear intentos de compra fallidos.

**Ahora:** El sistema crea una orden con estado `payment_pending` antes de redirigir a MercadoPago, preservando todos los datos del cliente y permitiendo seguimiento completo del ciclo de vida de la orden.

---

## 🔄 **FLUJO COMPLETO DE ÓRDENES**

### 1. **Creación de Orden Pendiente** 
```
Cliente llena checkout → API crea orden con estado 'payment_pending' → Redirección a MercadoPago
```

### 2. **Actualización por Webhook**
```
MercadoPago envía webhook → API actualiza estado según resultado de pago → Email de confirmación (si aplica)
```

### 3. **Estados Posibles**
- `payment_pending`: Orden creada, esperando resultado de pago
- `pending`: Pago en proceso (ej: transferencias bancarias)  
- `confirmed`: Pago aprobado, orden confirmada
- `cancelled`: Pago rechazado o cancelado
- `processing`: En preparación
- `shipped`: Enviado
- `delivered`: Entregado

---

## 🛠️ **IMPLEMENTACIÓN TÉCNICA**

### **1. Tipos Actualizados** (`src/types/index.ts`)
```typescript
export type OrderStatus = 'payment_pending' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: OrderStatus; // Ahora incluye 'payment_pending'
  createdAt: Date;
  updatedAt: Date;
  paymentId?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  // ... otros campos
}
```

### **2. API de Órdenes Pendientes** (`/api/orders/pending`)

**POST**: Crear orden pendiente antes del pago
```typescript
// Datos requeridos:
{
  preferenceId: string,    // ID de preferencia de MercadoPago
  items: CartItem[],       // Productos en el carrito
  formData: CheckoutForm,  // Datos del cliente
  paymentMethod: string,   // Método de pago seleccionado
  total: number           // Monto total
}

// Respuesta:
{
  success: true,
  orderId: string,
  message: "Orden pendiente creada exitosamente",
  status: "payment_pending"
}
```

**GET**: Consultar órdenes pendientes (para admin)

### **3. Webhook Actualizado** (`/api/mercadopago/webhook`)

Ahora maneja la transición de órdenes desde `payment_pending`:
```typescript
// Mapeo de estados de MercadoPago:
switch (paymentStatus) {
  case 'approved':
    orderStatus = 'confirmed';
    // → Envía email de confirmación
    break;
  case 'pending':
  case 'in_process':
    orderStatus = 'pending';
    break;
  case 'rejected':
  case 'cancelled':
    orderStatus = 'cancelled';
    break;
}
```

### **4. Integración en Checkout** (`MercadoPagoCheckout.tsx`)

```typescript
// ANTES de redirigir a MercadoPago:
const orderData = {
  preferenceId: responseData.preferenceId,
  items: items,
  formData: form,
  paymentMethod: 'mercadopago',
  total: total
};

await fetch('/api/orders/pending', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData),
});

// DESPUÉS se hace la redirección
window.location.href = redirectUrl;
```

---

## 📊 **BENEFICIOS DEL SISTEMA**

### **1. Para el Negocio**
- ✅ **Cero pérdida de datos**: Todos los intentos de compra se registran
- ✅ **Análisis completo**: Puedes ver qué pagos fallan y por qué
- ✅ **Seguimiento de abandono**: Identificar clientes que no completan pagos
- ✅ **Recovery de ventas**: Posibilidad de contactar clientes con pagos fallidos

### **2. Para el Cliente**
- ✅ **Transparencia**: Siempre hay un registro de su intento de compra
- ✅ **Soporte mejorado**: El equipo puede ayudar con datos específicos
- ✅ **Experiencia consistente**: El sistema maneja todos los casos de uso

### **3. Para el Desarrollo**
- ✅ **Debugging mejorado**: Logs completos de todo el proceso
- ✅ **Consistencia de datos**: Estado centralizado en Google Sheets
- ✅ **Escalabilidad**: Sistema preparado para múltiples métodos de pago

---

## 🔧 **CONFIGURACIÓN REQUERIDA**

### **Variables de Entorno**
```bash
# MercadoPago (para webhooks)
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_PUBLIC_KEY=tu_public_key
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret

# Google Sheets (para almacenamiento)
GOOGLE_SHEET_ID=tu_sheet_id
GOOGLE_CLIENT_EMAIL=tu_service_email
GOOGLE_PRIVATE_KEY=tu_private_key

# Base URL (para webhooks y redirects)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

### **Google Sheets - Estructura de la hoja "orders"**
```
A: ID | B: Email Usuario | C: Nombre Usuario | D: Total | E: Estado | 
F: Items | G: Dirección | H: Payment ID | I: Payment Status | 
J: Fecha | K: Método de Pago | L: Número de Seguimiento
```

---

## 🎮 **MODO DEBUG**

Para desarrollo sin credenciales de Google Sheets:
```typescript
// En /api/orders/pending
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
```

---

## 📈 **PRÓXIMOS PASOS RECOMENDADOS**

### **1. Dashboard de Órdenes Pendientes**
- Panel de admin para ver órdenes con pagos fallidos
- Filtros por fecha, monto, método de pago
- Acciones: reenviar link de pago, marcar como cancelada

### **2. Sistema de Recovery**
- Emails automáticos para pagos fallidos
- Links para reintentar el pago con los mismos datos
- Descuentos especiales para recovery

### **3. Analytics Avanzados**
- Métricas de conversión de pago
- Análisis de abandono por método de pago
- Reportes de eficiencia del checkout

### **4. Notificaciones en Tiempo Real**
- WebSockets para actualizar estado en tiempo real
- Notificaciones push al admin cuando hay pagos pendientes
- Estados intermedios más granulares

---

## 🎉 **RESULTADO FINAL**

Con este sistema implementado, la tienda online ahora tiene:

1. **Rastreo completo** de todos los intentos de compra
2. **Cero pérdida de datos** en pagos fallidos
3. **Webhooks robustos** que actualizan estados correctamente
4. **Tipos TypeScript** consistentes en todo el sistema
5. **Logging detallado** para debugging y monitoreo
6. **Modo debug** para desarrollo sin dependencias externas

¡El sistema está listo para manejar tanto pagos exitosos como fallidos de manera profesional y completa! 🚀
