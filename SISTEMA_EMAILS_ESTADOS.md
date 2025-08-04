# Sistema de Notificaciones por Email - Estados de Pedido

## 🎯 Descripción General

Se ha implementado un sistema completo de notificaciones por email que se activa automáticamente cuando cambia el estado de un pedido. Los clientes recibirán emails personalizados para cada estado del proceso de compra.

## 📧 Estados y Emails Implementados

### 1. **PENDING** (Pendiente) 🟡
- **Título**: "⏳ Tu pedido está pendiente"
- **Cuándo se envía**: Cuando el pedido se crea o vuelve a estado pendiente
- **Contenido**: Verificación de pago en proceso, información sobre disponibilidad
- **Color**: Amarillo (#f59e0b)

### 2. **CONFIRMED** (Confirmado) 🔵
- **Título**: "✅ ¡Tu pedido ha sido confirmado!"
- **Cuándo se envía**: Cuando el pago es verificado y aprobado
- **Contenido**: Confirmación de pago, preparación para procesamiento
- **Color**: Azul (#3b82f6)

### 3. **PROCESSING** (Procesando) 🟢
- **Título**: "📦 Tu pedido está siendo procesado"
- **Cuándo se envía**: Cuando comienza la preparación del pedido
- **Contenido**: Empaquetado en proceso, preparación para envío
- **Color**: Verde azulado (#14b8a6)

### 4. **SHIPPED** (Enviado) 🟣
- **Título**: "🚚 ¡Tu pedido está en camino!"
- **Cuándo se envía**: Cuando el pedido es despachado
- **Contenido**: Código de seguimiento, información de envío
- **Color**: Púrpura (#8b5cf6)
- **Campos especiales**: Tracking number, fecha estimada de entrega

### 5. **DELIVERED** (Entregado) 🟢
- **Título**: "🎉 ¡Tu pedido ha sido entregado!"
- **Cuándo se envía**: Cuando el pedido llega al cliente
- **Contenido**: Confirmación de entrega, solicitud de feedback
- **Color**: Verde (#10b981)

### 6. **CANCELLED** (Cancelado) 🔴
- **Título**: "❌ Tu pedido ha sido cancelado"
- **Cuándo se envía**: Cuando el pedido es cancelado
- **Contenido**: Razón de cancelación, instrucciones de contacto
- **Color**: Rojo (#ef4444)
- **Campos especiales**: Razón de cancelación

## 🛠️ Implementación Técnica

### Archivos Modificados/Creados:

1. **`/src/types/email.ts`**
   - Agregado: `OrderStatusUpdateEmailData` interface
   - Actualizado: `EmailType` para incluir 'order_status_update'

2. **`/src/lib/email.ts`**
   - Agregado: `createOrderStatusUpdateEmail()` - Template generator
   - Agregado: `sendOrderStatusUpdateEmail()` - Función de envío
   - Agregado: `getStatusDisplayName()` - Helper para nombres en español

3. **`/src/lib/orders-sheets.ts`**
   - Modificado: `updateOrderStatus()` - Ahora envía emails automáticamente
   - Agregado: Validación para evitar emails duplicados
   - Agregado: Manejo de errores para emails

4. **`/src/app/api/admin/test-status-email/route.ts`**
   - Nuevo: API endpoint para pruebas de emails de estado
   - Funciones GET y POST para testing

5. **`/src/components/admin/OrderStatusEmailTestPanel.tsx`**
   - Nuevo: Panel de pruebas en el admin
   - Formulario completo para envío de emails de prueba

6. **`/src/app/admin/page.tsx`**
   - Agregado: Integración del panel de pruebas de emails

## ⚡ Activación Automática

El sistema se activa automáticamente en los siguientes casos:

### 1. **Desde el Panel de Administración**
- Cuando un admin cambia el estado de un pedido
- Endpoint: `PATCH /api/orders/[id]`
- Función: `updateOrderStatus()` en `orders-sheets.ts`

### 2. **Desde MercadoPago Webhook**
- Cuando cambia el estado del pago
- Endpoint: `POST /api/mercadopago/webhook`
- Función: `updateOrderStatus()` automáticamente

### 3. **Desde Actualizaciones Manuales**
- Cualquier llamada a `updateOrderStatus()` en el código
- Evita duplicados verificando si el estado realmente cambió

## 🎨 Características del Template

### Diseño Responsive:
- Funciona en desktop y móvil
- Colores de marca consistentes
- Logo de la empresa incluido

### Información Incluida:
- Detalles completos del pedido
- Lista de productos con precios
- Total del pedido
- Fecha y ID del pedido
- Estado actual con descripción

### Elementos Dinámicos:
- Colores específicos por estado
- Íconos representativos
- Mensajes personalizados por estado
- Enlaces a "Mis Pedidos"
- Información de contacto

## 🧪 Sistema de Pruebas

### Panel de Administración:
1. Ir a **Admin > Pruebas de Email**
2. Usar el panel "**Prueba de Emails de Estado**"
3. Llenar formulario con datos de prueba
4. Seleccionar estado deseado
5. Enviar email de prueba

### API de Pruebas:
```bash
POST /api/admin/test-status-email
```

### Datos de Ejemplo:
```json
{
  "orderId": "TEST-123",
  "customerName": "Juan Pérez",
  "customerEmail": "juan@example.com",
  "newStatus": "shipped",
  "trackingNumber": "MP123456789",
  "estimatedDelivery": "3-5 días hábiles"
}
```

## 🔧 Configuración

### Variables de Entorno Requeridas:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=noreply@verdeagua.com
EMAIL_FROM_NAME=Verde Agua Personalizados
EMAIL_LOGO_URL=https://tu-dominio.com/logo.png
```

## 📊 Logs y Monitoreo

### Logs Incluidos:
- ✅ Email enviado exitosamente
- ⚠️ Estado no cambió (evita spam)
- ❌ Error en envío de email
- 📧 Información del email enviado

### Ejemplo de Log:
```
📧 Enviando email de notificación a juan@example.com para pedido ORD-123 - Estado: shipped
✅ Email de notificación enviado exitosamente
```

## 🚀 Flujo Completo

1. **Cliente hace pedido** → Email de confirmación (existente)
2. **Admin/Sistema cambia estado** → Email de actualización automático
3. **MercadoPago confirma pago** → Email de confirmación automático
4. **Admin marca como enviado** → Email con tracking automático
5. **Admin marca como entregado** → Email de completado automático

## 🛡️ Manejo de Errores

- **Email falla**: No afecta la actualización del pedido
- **Estado duplicado**: No envía email duplicado
- **Datos faltantes**: Usa valores por defecto o omite campos opcionales
- **Configuración incorrecta**: Logs detallados para debugging

## 📈 Beneficios Implementados

1. **Para el Cliente**:
   - Transparencia total del proceso
   - Comunicación proactiva
   - Información de tracking incluida
   - Diseño profesional y claro

2. **Para el Negocio**:
   - Reducción de consultas sobre estados
   - Mejor experiencia del cliente
   - Automatización completa
   - Branding consistente

3. **Para el Administrador**:
   - Sistema automático sin intervención manual
   - Panel de pruebas completo
   - Logs detallados para debugging
   - Integración transparente

## 🔄 Próximas Mejoras

- [ ] Integración con sistema de tracking real
- [ ] Templates personalizables desde admin
- [ ] Estadísticas de emails enviados
- [ ] Soporte para múltiples idiomas
- [ ] Programación de emails diferidos
- [ ] Notificaciones SMS opcionales

---

## 🔧 Corrección del Cálculo de IVA

### ❌ Problema Identificado:
Se detectaron inconsistencias en el cálculo del IVA en el sistema:

1. **Inconsistencia de formato**: 
   - Admin guardaba IVA como porcentaje (21)
   - Aplicación lo trataba como decimal (0.1 en vez de 0.21)

2. **Aplicación incorrecta**:
   - IVA se aplicaba sobre (productos + envío)
   - **Correcto**: IVA solo sobre productos

### ✅ Soluciones Implementadas:

#### 1. **Estandarización del taxRate**:
- **Admin**: Sigue guardando como porcentaje (21)
- **Aplicación**: Convierte a decimal automáticamente (21/100 = 0.21)
- **Archivo**: `src/lib/usePaymentMethods.ts`

```typescript
// ANTES (incorrecto):
taxRate: settings?.taxRate ?? 0.1  // 10% por defecto

// DESPUÉS (correcto):
taxRate: (settings?.taxRate ?? 21) / 100  // 21% convertido a 0.21
```

#### 2. **Corrección del Cálculo**:
- **Archivo**: `src/components/MercadoPagoCheckout.tsx`

```typescript
// ANTES (incorrecto):
const tax = (total >= freeShippingThreshold ? total : total + shipping) * taxRate;

// DESPUÉS (correcto):
const tax = subtotal * taxRate; // IVA solo sobre productos
```

#### 3. **Estructura Correcta del Total**:
```
Subtotal:     $100.00  (productos)
Envío:        $ 15.00  (costo de envío)
IVA (21%):    $ 21.00  (solo sobre productos: 100 * 0.21)
-----------------------------------
Total:        $136.00
```

### 🎯 Impacto de la Corrección:

**Antes** (ejemplo con productos $100 + envío $15):
- IVA: (100 + 15) * 0.1 = $11.50 ❌
- Total: $126.50

**Después** (mismo ejemplo):
- IVA: 100 * 0.21 = $21.00 ✅
- Total: $136.00

### 📍 Archivos Modificados:
1. `src/lib/usePaymentMethods.ts` - Conversión de porcentaje a decimal
2. `src/components/MercadoPagoCheckout.tsx` - Cálculo correcto del IVA

### ✅ Estado: CORREGIDO
- El IVA ahora se calcula correctamente al 21%
- Se aplica solo sobre el subtotal de productos
- El envío no tiene IVA aplicado
- La configuración del admin funciona correctamente
