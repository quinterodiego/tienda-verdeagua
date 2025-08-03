# Integración de Métodos de Pago con Configuración del Sitio

## Resumen
Se ha implementado una integración completa entre la configuración de métodos de pago del panel de administración y el checkout de la tienda. Ahora los métodos de pago que aparecen en el checkout son controlados directamente desde la configuración del sitio almacenada en Google Sheets.

## Cambios Implementados

### 1. Hook personalizado `usePaymentMethods`
**Archivo:** `src/lib/usePaymentMethods.ts`

```typescript
export interface PaymentMethodConfig {
  id: 'mercadopago' | 'cashOnPickup';
  name: string;
  description: string;
  icon: 'credit-card' | 'map-pin';
  available: boolean;
}

export function usePaymentMethods() {
  // Obtiene configuración del sitio
  // Retorna solo métodos de pago disponibles
  // Incluye configuración de costos de envío y moneda
}
```

### 2. Modificaciones en MercadoPagoCheckout
**Archivo:** `src/components/MercadoPagoCheckout.tsx`

- ✅ **Integración con configuración del sitio:** El checkout ahora lee la configuración desde Google Sheets
- ✅ **Métodos de pago dinámicos:** Solo muestra los métodos habilitados en el panel de admin
- ✅ **Costos configurables:** Usa los valores de envío, envío gratis y tasa de impuesto configurados
- ✅ **Moneda configurable:** Respeta la moneda seleccionada en configuración
- ✅ **Validación de métodos:** Previene el checkout si no hay métodos de pago disponibles

## Funcionalidades

### Control desde Panel de Administración
En `Configuración > Métodos de Pago`, el administrador puede:

1. **Activar/Desactivar Mercado Pago**
   - Si está desactivado, no aparece en el checkout
   - Si está activado, aparece como opción de pago

2. **Activar/Desactivar Pago al Retirar**
   - Si está desactivado, no aparece en el checkout
   - Si está activado, aparece como opción de retiro

3. **Configurar costos de envío**
   - Costo de envío estándar
   - Monto mínimo para envío gratis
   - Tasa de impuesto

### Comportamiento en Checkout

#### Escenarios de Configuración:

1. **Solo Mercado Pago habilitado:**
   - Se muestra únicamente la opción de pago online
   - Se selecciona automáticamente por defecto

2. **Solo Pago al Retirar habilitado:**
   - Se muestra únicamente la opción de retiro
   - Se selecciona automáticamente por defecto

3. **Ambos métodos habilitados:**
   - Se muestran ambas opciones en grid de 2 columnas
   - Mercado Pago se selecciona por defecto

4. **Ningún método habilitado:**
   - Se muestra mensaje de error
   - El botón de pago se deshabilita
   - Mensaje: "Sin métodos de pago disponibles"

#### Estados de Carga:
- **Cargando configuración:** Muestra spinner con mensaje "Cargando configuración..."
- **Error de configuración:** Fallback a valores por defecto
- **Configuración lista:** Muestra métodos disponibles

## Estructura de Datos

### SiteSettings (actualizada)
```typescript
interface SiteSettings {
  // ... otros campos
  paymentMethods: {
    mercadopago: boolean;
    cashOnPickup: boolean;
  };
  shippingCost: number;
  freeShippingThreshold: number;
  taxRate: number;
  currency: string;
}
```

### PaymentMethodConfig (nueva)
```typescript
interface PaymentMethodConfig {
  id: 'mercadopago' | 'cashOnPickup';
  name: string;
  description: string;
  icon: 'credit-card' | 'map-pin';
  available: boolean;
}
```

## Flujo de Datos

```
Google Sheets (Configuración)
        ↓
   useSettings() hook
        ↓
  usePaymentMethods() hook
        ↓
  MercadoPagoCheckout component
        ↓
   UI dinámico del checkout
```

## Ventajas de la Implementación

1. **Gestión centralizada:** Los métodos de pago se configuran desde un solo lugar
2. **Tiempo real:** Los cambios se reflejan inmediatamente en el checkout
3. **Flexibilidad:** Permite habilitar/deshabilitar métodos según necesidades del negocio
4. **Consistencia:** Los costos de envío y moneda son coherentes en toda la app
5. **Escalabilidad:** Fácil agregar nuevos métodos de pago en el futuro

## Próximos Pasos Sugeridos

1. **Agregar más métodos de pago:**
   - Transferencia bancaria
   - Billeteras digitales
   - Criptomonedas

2. **Configuración avanzada:**
   - Horarios de atención para retiro
   - Múltiples puntos de retiro
   - Descuentos por método de pago

3. **Validaciones de negocio:**
   - Monto mínimo por método de pago
   - Restricciones geográficas
   - Días de entrega estimados

## Testing

Para probar la integración:

1. Ve al panel de admin → Configuración
2. Cambia el estado de los métodos de pago
3. Guarda la configuración
4. Ve al checkout y verifica que los cambios se reflejen
5. Prueba todos los escenarios (solo uno, ambos, ninguno)

La integración está completamente funcional y lista para producción.
