# 🚀 Guía de Deployment - Tienda Online

## 📋 Pre-requisitos

### ✅ Verificaciones Completadas
- [x] Código commiteado y subido a GitHub
- [x] Build de producción verificado
- [x] Sistema de fallback implementado
- [x] Configuración de Vercel creada

## 🌐 Deployment en Vercel (Recomendado)

### Paso 1: Preparar Variables de Entorno
Antes del deployment, asegúrate de tener estas variables configuradas en Vercel:

```env
# Base Configuration
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-super-seguro-aqui

# Google Sheets (Opcional - con fallback)
GOOGLE_SHEETS_CLIENT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-clave-privada\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=tu-spreadsheet-id

# MercadoPago (Producción)
MERCADOPAGO_MODE=production
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-token-real
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-real

# Cloudinary (Opcional)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### Paso 2: Deployment Automático

#### Opción A: Conectar GitHub con Vercel (Más fácil)

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en "New Project"
4. Selecciona tu repositorio `vap-copilot`
5. Configura las variables de entorno
6. Haz clic en "Deploy"

#### Opción B: Deployment via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy
vercel --prod
```

### Paso 3: Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega todas las variables necesarias
4. Redeploy si es necesario

## 🔄 Sistema de Fallback Implementado

### ✅ Características
- **Resiliente**: Funciona sin Google Sheets
- **Automático**: Fallback transparente a datos estáticos
- **Consistente**: Misma experiencia de usuario
- **Observable**: Logs para debugging

### 📊 Productos de Fallback
Si Google Sheets no está disponible, la app usará productos estáticos desde `/src/data/products.ts`

## 🚨 Verificación Post-Deployment

### 1. Health Check
```bash
curl https://tu-dominio.vercel.app/api/health
```

### 2. Verificar Funcionalidades Críticas
- ✅ Cargar homepage
- ✅ Ver productos
- ✅ Agregar al carrito
- ✅ Proceso de checkout
- ✅ Autenticación (si configurada)

## 🔧 Troubleshooting

### Problema: Build Falla
**Solución**: Verificar errores de TypeScript
```bash
npm run lint
npx tsc --noEmit
```

### Problema: API de Productos Falla
**Solución**: El sistema de fallback activará automáticamente

### Problema: MercadoPago No Funciona
**Solución**: Verificar que uses credenciales de producción `APP_USR-`

## 📈 Monitoreo

### Logs en Vercel
- Functions → View Function Logs
- Monitorea errores de API
- Revisa performance metrics

### Analytics
- Vercel Analytics incluido automáticamente
- Métricas de performance y uso

## 🎯 Próximos Pasos Sugeridos

1. **DNS Personalizado**: Configura tu dominio propio
2. **Monitoreo**: Configura alertas para errores
3. **SEO**: Optimizar metadatos y sitemap
4. **Analytics**: Google Analytics o Vercel Analytics Pro
5. **CDN**: Las imágenes automáticamente en Vercel CDN

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica variables de entorno
3. El sistema de fallback debería mantener la app funcionando

**¡Tu tienda está lista para producción!** 🎉
