# 🔄 Guía para Cambiar Cuenta de MercadoPago

## 📋 Pasos para cambiar a una nueva cuenta de MercadoPago

### 1. **Obtener credenciales de la nueva cuenta**

1. **Inicia sesión** en tu nueva cuenta de MercadoPago
2. **Ve a**: https://www.mercadopago.com.ar/developers
3. **Crea una aplicación** o selecciona una existente
4. **Obtén las credenciales**:
   - **Test**: Para desarrollo y pruebas
   - **Production**: Para el sitio en vivo

### 2. **Actualizar archivo .env.local (Desarrollo)**

Edita el archivo `.env.local` y reemplaza estas líneas:

```bash
# Credenciales de TEST (para desarrollo)
MERCADOPAGO_ACCESS_TOKEN=TEST-TU_NUEVO_ACCESS_TOKEN_AQUI
MERCADOPAGO_PUBLIC_KEY=TEST-TU_NUEVO_PUBLIC_KEY_AQUI
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-TU_NUEVO_PUBLIC_KEY_AQUI

# Para producción (cuando tengas las credenciales reales)
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-TU_ACCESS_TOKEN_PRODUCCION
# MERCADOPAGO_PUBLIC_KEY=APP_USR-TU_PUBLIC_KEY_PRODUCCION
```

### 3. **Configurar webhook en MercadoPago**

1. **Ve a tu aplicación** en MercadoPago
2. **Configura las URLs**:
   - **Desarrollo**: `http://localhost:3000/api/mercadopago/webhook`
   - **Producción**: `https://tu-dominio.com/api/mercadopago/webhook`

### 4. **Actualizar variables en Vercel (Producción)**

Ve a: https://vercel.com/tu-proyecto/settings/environment-variables

**Variables a actualizar:**
```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu_access_token_produccion
MERCADOPAGO_PUBLIC_KEY=APP_USR-tu_public_key_produccion
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu_public_key_produccion
MERCADOPAGO_MODE=production
```

### 5. **Reiniciar y probar**

```bash
# Reiniciar servidor de desarrollo
npm run dev

# Probar pago de prueba
# Ve a http://localhost:3000 y realiza una compra de prueba
```

### 6. **Verificar configuración**

1. **Realiza un pago de prueba**
2. **Verifica que los webhooks funcionen**
3. **Revisa los logs** para errores

---

## 🔧 Solución de problemas

### Error de credenciales inválidas
- Verifica que las credenciales sean correctas
- Asegúrate de usar TEST para desarrollo y APP_USR para producción

### Webhook no funciona
- Verifica la URL en MercadoPago
- Revisa los logs del servidor
- Usa ngrok para desarrollo local si es necesario

### Error 401 Unauthorized
- Las credenciales son incorrectas o expiradas
- Regenera las credenciales en MercadoPago

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la documentación de MercadoPago
2. Verifica los logs de la aplicación
3. Asegúrate de que las URLs estén correctas

---

## ✅ Checklist de migración

- [ ] Obtenidas credenciales de nueva cuenta
- [ ] Actualizado .env.local
- [ ] Configurado webhook en MercadoPago
- [ ] Probado pago de prueba en desarrollo
- [ ] Actualizado variables en Vercel
- [ ] Probado en producción
- [ ] Documentado cambio

---

**¡Importante!** Guarda las credenciales anteriores como backup hasta confirmar que todo funciona correctamente.
