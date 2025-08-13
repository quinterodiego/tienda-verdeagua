# 🔧 CONFIGURAR CREDENCIALES DE MERCADOPAGO

## ❌ PROBLEMA ACTUAL

El error `SyntaxError: Unexpected token '<'` ocurre porque las credenciales de MercadoPago en `.env.local` son placeholders:

```bash
MERCADOPAGO_ACCESS_TOKEN=TUS_CREDENCIALES_DE_TEST_AQUI
MERCADOPAGO_PUBLIC_KEY=TUS_CREDENCIALES_DE_TEST_AQUI
```

## ✅ SOLUCIÓN: OBTENER CREDENCIALES REALES

### Paso 1: Ingresar a MercadoPago Developers

1. Ve a: https://www.mercadopago.com.ar/developers/
2. Inicia sesión con tu cuenta de MercadoPago
3. Si no tienes cuenta, créala gratis

### Paso 2: Crear una Aplicación

1. Haz clic en "Crear aplicación"
2. Completa los datos:
   - **Nombre**: `Tienda Verde Agua`
   - **Descripción**: `Tienda online de productos personalizados`
   - **URL del sitio**: `http://localhost:3000` (para desarrollo)
3. Guarda la aplicación

### Paso 3: Obtener Credenciales de TEST

1. En el panel de tu aplicación, ve a **"Credenciales"**
2. Selecciona **"Credenciales de prueba"**
3. Copia los siguientes valores:

```bash
# Access Token (empieza con TEST-)
ACCESS_TOKEN=TEST-1234567890-123456-abcdef...

# Public Key (empieza con TEST-)  
PUBLIC_KEY=TEST-abcdef123456-789012-abcdef...
```

### Paso 4: Actualizar .env.local

Reemplaza en tu archivo `.env.local`:

```bash
# CAMBIAR ESTAS LÍNEAS:
MERCADOPAGO_ACCESS_TOKEN=TUS_CREDENCIALES_DE_TEST_AQUI
MERCADOPAGO_PUBLIC_KEY=TUS_CREDENCIALES_DE_TEST_AQUI

# POR ESTAS (con tus credenciales reales):
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef...
MERCADOPAGO_PUBLIC_KEY=TEST-abcdef123456-789012-abcdef...
```

### Paso 5: Agregar Variable Pública

También agrega la public key como variable pública:

```bash
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-abcdef123456-789012-abcdef...
```

### Paso 6: Reiniciar el Servidor

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
npm run dev
```

## 🧪 VERIFICAR CONFIGURACIÓN

Ejecuta el script de verificación:

```bash
node test-mercadopago-env.js
```

Deberías ver:
```
✅ MERCADOPAGO_ACCESS_TOKEN: Configurado (TEST-12345...67890)
✅ MERCADOPAGO_PUBLIC_KEY: Configurado (TEST-abcde...fghij)
✅ NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: Configurado
✅ El Access Token tiene formato válido
🧪 Modo: SANDBOX/TEST
```

## 🎯 PROBAR PAGOS

Una vez configurado, puedes usar estas tarjetas de prueba:

### Tarjetas de TEST aprobadas:
- **Visa**: 4009175332806176
- **Mastercard**: 5031433215406351
- **CVV**: Cualquier número de 3 dígitos
- **Fecha**: Cualquier fecha futura
- **Nombre**: Cualquier nombre

### Estados de prueba:
- **Aprobado**: 4009175332806176
- **Rechazado**: 4000000000000002
- **Pendiente**: 4000000000000051

## ⚠️ IMPORTANTE

- **NUNCA** subas las credenciales reales a Git
- Las credenciales de TEST no procesan pagos reales
- Para producción necesitarás credenciales de producción
- El archivo `.env.local` está en `.gitignore` (seguro)

## 🔄 FLUJO COMPLETO

1. Usuario hace clic en "Pagar con MercadoPago"
2. Se crea una preferencia con las credenciales
3. MercadoPago devuelve URL de pago
4. Usuario es redirigido a MercadoPago
5. Completa el pago en ambiente de prueba
6. MercadoPago notifica via webhook
7. Se envía email de confirmación

¿Necesitas ayuda para obtener las credenciales? Puedo guiarte paso a paso.
