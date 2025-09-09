# 🔧 Variables de Entorno Actualizadas para Vercel

## ⚠️ IMPORTANTE: Usa TUS credenciales reales, no copies estos valores de ejemplo

## 📋 Ir a: https://vercel.com/quinterodiegos-projects/vap-copilot/settings/environment-variables

### Variables a ACTUALIZAR (reemplaza con TUS valores reales):

```env
# URLs Actualizadas
NEXT_PUBLIC_BASE_URL=https://vap-copilot-ncxhul0j4-quinterodiegos-projects.vercel.app
NEXTAUTH_URL=https://vap-copilot-ncxhul0j4-quinterodiegos-projects.vercel.app

# MercadoPago Producción (USAR TUS CREDENCIALES REALES)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-TU_ACCESS_TOKEN_AQUI
MERCADOPAGO_PUBLIC_KEY=APP_USR-TU_PUBLIC_KEY_AQUI
MERCADOPAGO_MODE=production

# NextAuth (GENERAR UN SECRETO SEGURO)
NEXTAUTH_SECRET=TU_NEXTAUTH_SECRET_SEGURO_AQUI

# Google OAuth
GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=TU_GOOGLE_CLIENT_SECRET

# Cloudinary (USAR TUS CREDENCIALES)
CLOUDINARY_CLOUD_NAME=TU_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=TU_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=TU_CLOUDINARY_API_SECRET

# Google Sheets (USAR TUS CREDENCIALES DE SERVICE ACCOUNT)
GOOGLE_SHEET_ID=TU_GOOGLE_SHEET_ID
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=TU_GOOGLE_PROJECT_ID
GOOGLE_PRIVATE_KEY_ID=TU_PRIVATE_KEY_ID
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_COMPLETA_AQUI\n-----END PRIVATE KEY-----"
GOOGLE_CLIENT_EMAIL=TU_SERVICE_ACCOUNT@TU_PROJECT.iam.gserviceaccount.com
GOOGLE_CLIENT_ID_SERVICE=TU_CLIENT_ID_SERVICE
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/TU_SERVICE_ACCOUNT

# Configuración adicional
NEXT_PUBLIC_ENABLE_LOGGING=false
```

## 🔄 También actualizar en MercadoPago:

Ve a tu aplicación en MercadoPago y actualiza:

**URLs de Redirect:**
```
https://vap-copilot-ncxhul0j4-quinterodiegos-projects.vercel.app/checkout/success
https://vap-copilot-ncxhul0j4-quinterodiegos-projects.vercel.app/checkout/failure
https://vap-copilot-ncxhul0j4-quinterodiegos-projects.vercel.app/checkout/pending
```

**URL de Notificaciones:**
```
https://vap-copilot-ncxhul0j4-quinterodiegos-projects.vercel.app/api/mercadopago/webhook
```
