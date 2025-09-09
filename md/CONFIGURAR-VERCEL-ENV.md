# 🚀 Configuración de Variables de Entorno en Vercel

## Paso 1: Acceder al Dashboard
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Busca tu proyecto **vap-copilot**
3. Haz clic en **Settings**
4. En el menú lateral, haz clic en **Environment Variables**

## Paso 2: Agregar Variables Una por Una

### Variables Críticas de MercadoPago (OBLIGATORIAS)
```
MERCADOPAGO_MODE = production
MERCADOPAGO_ACCESS_TOKEN = APP_USR-3055031989051158-072922-a8909d0d1567155a714c60e12af006c5-52770305
MERCADOPAGO_PUBLIC_KEY = APP_USR-5a8b657e-06e8-4443-815e-18ee961bf3c2
```

### Variables de NextAuth (OBLIGATORIAS)
```
NEXTAUTH_URL = https://vap-copilot.vercel.app
NEXTAUTH_SECRET = prod-a8f3k9d2m5n7q1w4e6r8t0y2u4i9o7p3s6d8f1g4h7j2k5l8
```

### Variables de Google OAuth (OBLIGATORIAS)
```
GOOGLE_CLIENT_ID = TU_GOOGLE_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET = TU_GOOGLE_CLIENT_SECRET_AQUI
```

### Variables de Base URL (OBLIGATORIAS)
```
NEXT_PUBLIC_BASE_URL = https://vap-copilot.vercel.app
```

### Variables de Cloudinary (OPCIONALES)
```
CLOUDINARY_CLOUD_NAME = dsux52cft
CLOUDINARY_API_KEY = 896156681542828
CLOUDINARY_API_SECRET = qsD1tkvGnlzbP9HuFuy7ArnysWg
```

### Variables de Google Sheets (OPCIONALES)
```
GOOGLE_SHEET_ID = 1bjSawahcUFK6A7j8MPC0kvxuvKNd63fcdouI82jOlE8
```

## Paso 3: Configurar Environment para Production

**IMPORTANTE**: Para cada variable que agregues:
- **Name**: El nombre exacto de la variable (ej: `MERCADOPAGO_MODE`)
- **Value**: El valor exacto (ej: `production`)
- **Environments**: Selecciona **Production** únicamente

## Paso 4: Re-deployar la Aplicación

Después de agregar todas las variables:
1. Ve a la pestaña **Deployments** en tu proyecto Vercel
2. Busca el último deployment
3. Haz clic en los **3 puntos** (...) 
4. Selecciona **Redeploy**
5. Confirma con **Redeploy**

## Paso 5: Verificar Funcionamiento

Una vez re-deployado, verifica en:
- `https://tu-app.vercel.app/api/production-readiness`
- Debería mostrar: `{"status":"ready","mode":"production","mercadopago":"enabled"}`

## ⚠️ Notas Importantes

1. **Variables Obligatorias**: Sin las variables de MercadoPago, seguirá funcionando en modo demo
2. **Environment**: Solo seleccionar "Production", no Development ni Preview
3. **Re-deploy**: Es obligatorio re-deployar después de agregar variables
4. **Seguridad**: Nunca compartir estas credenciales reales

## 🔍 Troubleshooting

Si después de configurar todo sigue sin funcionar:
1. Verifica que todas las variables estén en "Production"
2. Confirma que el re-deploy fue exitoso
3. Revisa los logs en Vercel > Functions
4. Prueba el endpoint de verificación

---

**¿Necesitas ayuda?** Una vez que hayas configurado las variables, ejecuta:
```bash
npm run health-check
```
