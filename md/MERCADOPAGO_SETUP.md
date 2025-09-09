# Configuración de MercadoPago para Desarrollo

## Pasos para configurar MercadoPago

### 1. Crear cuenta en MercadoPago Developers
1. Ve a https://www.mercadopago.com/developers
2. Crea una cuenta o inicia sesión
3. Ve a "Mis aplicaciones" y crea una nueva aplicación

### 2. Obtener credenciales de prueba
1. En tu aplicación, ve a "Credenciales"
2. Copia el "Access Token" de prueba
3. Copia la "Public Key" de prueba

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-super-seguro-aqui

# MercadoPago - Credenciales de PRUEBA (Usuario COMPRADOR)
# Reemplaza con las credenciales reales de tu usuario de prueba comprador
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-de-usuario-comprador
MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-de-usuario-comprador
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret-opcional

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Configurar webhooks para desarrollo (opcional)
Para recibir notificaciones de pago en desarrollo:
1. Usa ngrok: `ngrok http 3000`
2. Configura la URL del webhook en MercadoPago: `https://tu-ngrok-url.ngrok.io/api/mercadopago/webhook`

### 5. Tarjetas de prueba
Para probar pagos, usa estas tarjetas de prueba:

**Visa - Pago aprobado**
- Número: 4509 9535 6623 3704
- CVC: 123
- Fecha: 11/25

**Mastercard - Pago rechazado**
- Número: 5031 7557 3453 0604
- CVC: 123
- Fecha: 11/25

**American Express - Pago pendiente**
- Número: 3711 803032 57522
- CVC: 1234
- Fecha: 11/25

### 6. Usuarios de prueba (IMPORTANTE)
MercadoPago requiere usuarios de prueba separados para evitar el error "No podés pagarte a vos mismo":

**Pasos para crear usuarios de prueba:**
1. Ve a https://www.mercadopago.com/developers
2. En tu aplicación, ve a "Usuarios de Prueba"
3. Crea dos usuarios:
   - **Vendedor (seller)**: Para recibir pagos
   - **Comprador (buyer)**: Para hacer pagos
4. Usa las credenciales del usuario **comprador** en tu `.env.local`

**Usuario de prueba por defecto (Argentina):**
- Email: test_user_123456789@testuser.com
- Password: qatest123

## Producción

### 1. Cambiar a credenciales de producción
Reemplaza las credenciales de prueba por las de producción:
- Quita el prefijo "TEST-" del Access Token
- Actualiza la Public Key de producción

### 2. Configurar dominio real
- Actualiza `NEXT_PUBLIC_BASE_URL` con tu dominio real
- Configura los webhooks con la URL real de producción

### 3. Verificar configuración
- Verifica que todos los URLs de retorno funcionen
- Prueba el flujo completo de pago
- Verifica que los webhooks se reciban correctamente

## Troubleshooting

### Error de credenciales
- Verifica que las credenciales sean correctas
- Asegúrate de usar credenciales de prueba en desarrollo

### Error "Error response from API: {}"
- Verifica que las variables de entorno estén cargadas correctamente
- Reinicia el servidor después de modificar `.env.local`
- Verifica la configuración en: http://localhost:3000/api/mercadopago/test

### Error "auto_return invalid. back_url.success must be defined"
- Este error indica que las URLs de retorno no están configuradas correctamente
- Verifica que `NEXT_PUBLIC_BASE_URL` esté definido en `.env.local`
- Asegúrate de que las páginas de success, failure y pending existan

### Error "No podés pagarte a vos mismo"
- Este error ocurre cuando usas las mismas credenciales para comprador y vendedor
- **Solución**: Crea usuarios de prueba separados en MercadoPago Developers
- Usa credenciales del usuario **comprador** en tu aplicación
- El usuario **vendedor** solo se usa para recibir pagos

### Error "invalid credentials"
- Verifica que las credenciales de MercadoPago sean correctas
- Asegúrate de usar credenciales de PRUEBA (que empiecen con TEST-)
- Revisa que no haya espacios extra en las credenciales

### Webhook no funciona
- Verifica la URL del webhook
- Revisa los logs del servidor
- Usa ngrok para desarrollo local

### Redirección fallida
- Verifica las URLs de retorno
- Asegúrate de que las rutas existan
- Revisa la configuración de Next.js

## Diagnóstico rápido

### 1. Verificar configuración
Ve a: http://localhost:3000/api/mercadopago/test

Deberías ver algo como:
```json
{
  "status": "OK",
  "message": "Configuración de MercadoPago",
  "config": {
    "hasAccessToken": true,
    "hasPublicKey": true,
    "baseUrl": "http://localhost:3000",
    "accessTokenPrefix": "TEST-53131...",
    "publicKeyPrefix": "TEST-36172..."
  }
}
```

### 2. Verificar variables de entorno
En la consola del navegador (F12), ejecuta:
```javascript
console.log('Base URL:', process.env.NEXT_PUBLIC_BASE_URL);
```

## Recursos útiles

- [Documentación de MercadoPago](https://www.mercadopago.com/developers/es)
- [SDK de Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Checkout Pro](https://www.mercadopago.com/developers/es/docs/checkout-pro/landing)
- [Webhooks](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks)
