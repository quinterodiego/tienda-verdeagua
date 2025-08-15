# 🛒 **¿Qué pasa con el PEDIDO cuando el pago sale mal?**

## ❓ **Tu Pregunta Específica**
> "Que hay con el pedido, si el pago sale mal?"

---

## 📊 **ESTADO ACTUAL DEL SISTEMA**

### 🔄 **FLUJO COMPLETO DEL PEDIDO**

#### **1. Creación del Pedido (ANTES del pago)**
```typescript
// En MercadoPagoCheckout.tsx - líneas 370-390
// Crear orden temporal para rastreo
const orderData = {
  preferenceId: responseData.preferenceId,
  items: items,
  formData: form,
  paymentMethod: 'mercadopago',
  total: total
};

await fetch('/api/orders/pending', {  // ❌ ESTA RUTA NO EXISTE
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData),
});
```

**❗ PROBLEMA IDENTIFICADO:** El código intenta crear una orden "temporal" en `/api/orders/pending` pero esta ruta **NO EXISTE**.

---

## 🚨 **PROBLEMAS ACTUALES**

### **1. ❌ Orden temporal NO se crea**
- El código intenta llamar `/api/orders/pending` que no existe
- **Resultado:** La llamada falla silenciosamente
- **Impacto:** No hay registro del intento de pago

### **2. ❌ Solo se crea pedido cuando pago es exitoso**
- El pedido se crea únicamente a través del webhook cuando el pago es `approved`
- **Problema:** Si el pago falla, NO HAY REGISTRO del intento

### **3. ❌ Sin trazabilidad de pagos fallidos**
- No hay historial de intentos de pago fallidos
- No hay manera de recuperar carritos abandonados
- No hay métricas de conversión de pagos

---

## 🔍 **ANÁLISIS DETALLADO**

### **Escenario 1: Pago Exitoso** ✅
```mermaid
Usuario llena checkout
    ↓
Se crea preferencia MP
    ↓
Usuario paga en MP
    ↓
Webhook recibe "approved"
    ↓
Se crea pedido en Sheets ✅
    ↓
Se envía email confirmación ✅
```

### **Escenario 2: Pago Fallido** ❌
```mermaid
Usuario llena checkout
    ↓
Se crea preferencia MP
    ↓
Usuario falla pago en MP
    ↓
Webhook recibe "rejected"
    ↓
¡NO se crea pedido! ❌
    ↓
¡NO hay registro del intento! ❌
```

---

## ⚠️ **CONSECUENCIAS ACTUALES**

### **Cuando el pago falla:**
- ❌ **NO se crea ningún pedido**
- ❌ **NO se guarda información del intento**
- ❌ **NO hay trazabilidad**
- ❌ **NO se puede hacer seguimiento**
- ❌ **Se pierde data valiosa** (qué quería comprar, por qué falló)

### **Datos que se pierden:**
- 📧 Email del cliente
- 🛒 Productos que quería comprar
- 💰 Valor del pedido abandonado
- 📱 Información de contacto
- 🔍 Razón del fallo del pago

---

## 💡 **SOLUCIONES RECOMENDADAS**

### **Opción 1: Crear pedido SIEMPRE (Recomendado)**
```typescript
// Modificar el flujo para crear pedido antes del pago
1. Usuario llena checkout
2. Se CREA pedido con status "pending_payment"
3. Se genera preferencia MP con orderId
4. Webhook actualiza estado según resultado:
   - approved → status = "confirmed"
   - rejected → status = "payment_failed"
   - cancelled → status = "cancelled"
```

### **Opción 2: Crear API de órdenes pendientes**
```typescript
// Crear /api/orders/pending/route.ts
export async function POST(request: NextRequest) {
  // Guardar intento de pago con todos los datos
  // Status: "payment_pending"
  // Incluir: items, customer info, payment method
}
```

### **Opción 3: Sistema de recuperación**
```typescript
// Webhook maneja TODOS los estados
switch (payment.status) {
  case 'approved':
    // Crear pedido exitoso
    await createSuccessfulOrder(paymentData);
    break;
    
  case 'rejected':
  case 'cancelled':
    // Crear registro de intento fallido
    await createFailedPaymentRecord(paymentData);
    // Enviar email de recuperación
    await sendRecoveryEmail(customerData);
    break;
}
```

---

## 🛠️ **IMPLEMENTACIÓN SUGERIDA**

### **1. Crear API de órdenes pendientes**
```typescript
// src/app/api/orders/pending/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { preferenceId, items, formData, paymentMethod, total } = await request.json();
    
    // Crear orden con estado "payment_pending"
    const orderData = {
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone
      },
      items,
      total,
      status: 'payment_pending',
      paymentMethod,
      paymentId: preferenceId,
      createdAt: new Date()
    };
    
    const orderId = await saveOrderToSheets(orderData);
    
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Orden pendiente creada'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear orden pendiente' }, { status: 500 });
  }
}
```

### **2. Modificar webhook para manejar todos los estados**
```typescript
// En /api/mercadopago/webhook/route.ts
switch (payment.status) {
  case 'approved':
    // Actualizar orden existente a "confirmed"
    await updateOrderStatus(orderId, 'confirmed', paymentId, paymentMethod);
    await sendOrderConfirmationEmail(orderId);
    break;
    
  case 'rejected':
    // Actualizar orden existente a "payment_failed"
    await updateOrderStatus(orderId, 'payment_failed', paymentId, paymentMethod);
    await sendPaymentFailedEmail(orderId);
    break;
    
  case 'cancelled':
    // Actualizar orden existente a "cancelled"
    await updateOrderStatus(orderId, 'cancelled', paymentId, paymentMethod);
    break;
}
```

### **3. Añadir nuevos estados a los tipos**
```typescript
// En types/index.ts
export type OrderStatus = 
  | 'payment_pending'    // ← NUEVO
  | 'pending' 
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'payment_failed'     // ← NUEVO
  | 'cancelled';
```

---

## 📈 **BENEFICIOS DE LA SOLUCIÓN**

### **Con el sistema mejorado:**
- ✅ **Trazabilidad completa** de todos los intentos
- ✅ **Recuperación de carritos** abandonados
- ✅ **Métricas de conversión** reales
- ✅ **Emails de recuperación** automáticos
- ✅ **Análisis de fallos** de pagos
- ✅ **Mejor experiencia** de usuario

### **Datos que se capturan:**
- 📊 **Tasa de conversión** de checkout
- 💳 **Tipos de errores** más comunes
- 🛒 **Productos más abandonados**
- 👥 **Usuarios con múltiples intentos**
- 📈 **Análisis de recuperación**

---

## 🎯 **RESPUESTA DIRECTA**

### **Actualmente, cuando el pago sale mal:**
❌ **NO se crea ningún pedido**
❌ **NO queda registro del intento**
❌ **Se pierde toda la información**

### **El sistema necesita:**
✅ **Crear pedidos antes del pago**
✅ **Actualizar estados vía webhook**
✅ **Mantener historial completo**

¿Quieres que implemente el sistema de órdenes pendientes para solucionar esto?
