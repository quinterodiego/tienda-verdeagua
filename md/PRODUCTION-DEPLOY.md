# 🚀 Guía de Deployment a Producción

## 📋 Checklist Pre-Deployment

### 1. **Configuración de MercadoPago**
- [ ] Crear aplicación en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
- [ ] Obtener credenciales de **PRODUCCIÓN** (no TEST)
- [ ] Configurar `MERCADOPAGO_MODE=production`
- [ ] Actualizar `MERCADOPAGO_ACCESS_TOKEN` con token real
- [ ] Actualizar `MERCADOPAGO_PUBLIC_KEY` con key real

### 2. **Configuración de Dominio**
- [ ] Registrar dominio para producción
- [ ] Configurar DNS y certificado SSL
- [ ] Actualizar `NEXT_PUBLIC_BASE_URL=https://tu-dominio.com`
- [ ] Actualizar `NEXTAUTH_URL=https://tu-dominio.com`

### 3. **Google OAuth**
- [ ] Ir a [Google Cloud Console](https://console.cloud.google.com)
- [ ] Actualizar URLs autorizadas:
  - Origin: `https://tu-dominio.com`
  - Redirect: `https://tu-dominio.com/api/auth/callback/google`
- [ ] Obtener nuevas credenciales si es necesario

### 4. **Seguridad**
- [ ] Generar nuevo `NEXTAUTH_SECRET` (32+ caracteres)
- [ ] Verificar que no hay datos sensibles en el código
- [ ] Configurar variables de entorno en el hosting

### 5. **Base de Datos**
- [ ] Crear Google Sheet nuevo para producción
- [ ] Actualizar `GOOGLE_SHEET_ID`
- [ ] Verificar permisos del service account

## 🔧 Variables de Entorno para Producción

Copia el archivo `.env.production.example` y actualiza con tus valores reales:

```bash
cp .env.production.example .env.production
```

## 🧪 Testing Pre-Deploy

### Verificar Configuración
```bash
# Endpoint de verificación
GET /api/debug/production-readiness
```

### Tests Manuales
1. **Autenticación**
   - [ ] Login con Google funciona
   - [ ] Sesiones se mantienen correctamente

2. **E-commerce**
   - [ ] Productos se cargan desde Google Sheets
   - [ ] Carrito funciona correctamente
   - [ ] Checkout completo funciona

3. **Pagos**
   - [ ] ⚠️ **TEST CON DINERO REAL** - Usar monto mínimo
   - [ ] Verificar que se procesa pago real
   - [ ] Verificar webhooks de MercadoPago
   - [ ] Verificar que se guarda en Google Sheets

4. **Admin**
   - [ ] Panel admin accesible
   - [ ] CRUD de productos funciona
   - [ ] Gestión de pedidos funciona

## 🚀 Platforms de Deployment

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variables de entorno en dashboard
# https://vercel.com/dashboard
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
.next

# Configurar variables en dashboard
# https://app.netlify.com/
```

### Railway
```bash
# Conectar repo y configurar variables
# https://railway.app/
```

## 📊 Monitoreo Post-Deploy

### Endpoints de Health Check
- `GET /api/debug/production-readiness` - Estado del sistema
- `GET /api/debug/mercadopago-config` - Config de MercadoPago
- `GET /api/products` - Test de Google Sheets

### Logs a Monitorear
- Errores de autenticación
- Fallos en pagos de MercadoPago
- Errores de conexión a Google Sheets
- Timeouts y performance

### Métricas Importantes
- Tiempo de respuesta de APIs
- Tasa de conversión de pagos
- Errores 5xx
- Disponibilidad del servicio

## 🔒 Seguridad en Producción

### Variables de Entorno
- ✅ Nunca commitear `.env.production`
- ✅ Usar secretos seguros (32+ caracteres)
- ✅ Rotar credenciales periódicamente

### APIs Externas
- ✅ Verificar rate limits de Google Sheets
- ✅ Configurar timeouts apropiados
- ✅ Implementar retry logic

### Datos Sensibles
- ✅ No loggear datos de tarjetas
- ✅ No exponer IDs internos
- ✅ Validar todos los inputs

## 🚨 Plan de Rollback

En caso de problemas:

1. **Rollback inmediato**
   ```bash
   vercel --rollback
   ```

2. **Fallback a modo demo**
   - Cambiar `MERCADOPAGO_MODE=test`
   - Sistema automáticamente usará modo demo

3. **Contactos de emergencia**
   - Support MercadoPago: [Link]
   - Google Cloud Support: [Link]
   - Hosting Support: [Link]

## 📈 Optimizaciones Post-Launch

### Performance
- Implementar caching de productos
- Optimizar imágenes con Cloudinary
- Configurar CDN

### SEO
- Generar sitemap
- Configurar meta tags
- Implementar structured data

### Analytics
- Google Analytics
- Conversion tracking
- Error monitoring (Sentry)

## 📞 Support y Mantenimiento

### Actualizaciones Regulares
- [ ] Dependencias de npm mensualmente
- [ ] Credenciales cada 6 meses
- [ ] Backup de Google Sheets semanalmente

### Monitoring
- [ ] Configurar alertas de uptime
- [ ] Monitor de errores
- [ ] Dashboard de métricas

---

## ⚡ Quick Deploy

Para deploy rápido (después de configurar todo):

```bash
# 1. Verificar configuración
curl https://tu-dominio.com/api/debug/production-readiness

# 2. Deploy
vercel --prod

# 3. Test final
curl https://tu-dominio.com/api/products
```

¡Listo para producción! 🎉
