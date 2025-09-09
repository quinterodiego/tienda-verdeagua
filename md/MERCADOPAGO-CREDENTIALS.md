# 🚀 Guía para Obtener Credenciales Reales de MercadoPago

## 📋 Checklist de Configuración

### 1. Crear Aplicación en MercadoPago

1. **Acceder al panel:** https://www.mercadopago.com.ar/developers
2. **Crear aplicación:**
   - Nombre: "Tienda Online VAP"
   - Tipo: "Aplicación web"
   - Descripción: "E-commerce con Next.js"

### 2. Configurar URLs de la Aplicación

En la configuración de tu aplicación, agrega estas URLs:

**URLs de Redirect (OAuth):**
```
https://tudominio.com/api/auth/callback/mercadopago
https://tudominio.com/checkout/success
https://tudominio.com/checkout/failure
https://tudominio.com/checkout/pending
```

**URL de Notificaciones (Webhooks):**
```
https://tudominio.com/api/mercadopago/webhook
```

**Dominio autorizado:**
```
https://tudominio.com
```

### 3. Obtener Credenciales

Una vez configurada la aplicación, encontrarás:

#### 🧪 **Credenciales de TEST (para desarrollo):**
```
Access Token: TEST-1234567890-XXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXX
Public Key:   TEST-12345678-1234-1234-1234-123456789012
```

#### 🚀 **Credenciales de PRODUCCIÓN (para el sitio real):**
```
Access Token: APP_USR-1234567890-XXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXX
Public Key:   APP_USR-12345678-1234-1234-1234-123456789012
```

### 4. Configurar Variables de Entorno

#### Para DESARROLLO (.env.local):
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-XXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXX
MERCADOPAGO_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012
MERCADOPAGO_MODE=test
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Para PRODUCCIÓN (.env.production.local):
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890-XXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXX
MERCADOPAGO_PUBLIC_KEY=APP_USR-12345678-1234-1234-1234-123456789012
MERCADOPAGO_MODE=production
NEXT_PUBLIC_BASE_URL=https://tudominio.com
NEXTAUTH_URL=https://tudominio.com
```

## 🔍 Verificar Credenciales

### Usando nuestro script automatizado:
```bash
npm run verify-production
```

### Manualmente en el panel:
1. Ve a "Credenciales" en tu aplicación
2. Verifica que las credenciales de producción estén activas
3. Confirma que tu cuenta esté verificada

## ⚠️ Requisitos Importantes

### Para activar PRODUCCIÓN necesitas:

1. **Cuenta verificada de MercadoPago:**
   - Documento de identidad verificado
   - Datos bancarios configurados
   - Teléfono verificado

2. **Aplicación aprobada:**
   - Descripción completa del negocio
   - URLs válidas configuradas
   - Términos y condiciones aceptados

3. **Configuración de webhooks:**
   - URL de notificaciones activa
   - Eventos configurados (payment, merchant_order)

## 🧪 Proceso de Testing

### 1. Primero en TEST:
```bash
# Configurar credenciales TEST en .env.local
MERCADOPAGO_MODE=test
MERCADOPAGO_ACCESS_TOKEN=TEST-...

# Probar pagos
npm run dev
# Hacer compras de prueba
```

### 2. Luego en PRODUCCIÓN:
```bash
# Configurar credenciales REALES
npm run setup-production
# Editar .env.production.local

# Verificar configuración
npm run verify-production

# Deploy
npm run deploy-production
```

## 📞 Soporte

Si tienes problemas:

1. **Centro de ayuda:** https://www.mercadopago.com.ar/ayuda
2. **Documentación técnica:** https://www.mercadopago.com.ar/developers/es/docs
3. **Soporte directo:** Desde tu panel de desarrollador

## 🎯 Próximos Pasos

1. [ ] Crear cuenta/aplicación en MercadoPago
2. [ ] Obtener credenciales TEST
3. [ ] Probar en desarrollo
4. [ ] Verificar cuenta para producción
5. [ ] Obtener credenciales REALES
6. [ ] Configurar producción
7. [ ] Deploy final

---

**💡 Tip:** Siempre prueba primero con credenciales TEST antes de usar las reales.
