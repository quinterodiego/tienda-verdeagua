# Guía de Deployment a Producción
# =====================================

## Preparación para Producción

### 1. Variables de Entorno para Producción

Estas son las variables que necesitarás configurar en tu plataforma de hosting:

```bash
# NEXTAUTH.JS CONFIGURATION
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=crea-un-secreto-super-seguro-de-32-caracteres-minimo

# GOOGLE OAUTH CREDENTIALS
GOOGLE_CLIENT_ID=892483570826-sd4qbu20acb11q1otccv18vsndpkavec.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# MERCADOPAGO CONFIGURATION
# ⚠️ CAMBIAR A CREDENCIALES DE PRODUCCIÓN
MERCADOPAGO_ACCESS_TOKEN=tu-token-de-produccion
MERCADOPAGO_PUBLIC_KEY=tu-public-key-de-produccion
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# CLOUDINARY CONFIGURATION
CLOUDINARY_CLOUD_NAME=dsux52cft
CLOUDINARY_API_KEY=896156681542828
CLOUDINARY_API_SECRET=qsD1tkvGnlzbP9HuFuy7ArnysWg

# GOOGLE SHEETS CONFIGURATION
GOOGLE_SHEET_ID=1bjSawahcUFK6A7j8MPC0kvxuvKNd63fcdouI82jOlE8
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=vap-ecommerce
GOOGLE_PRIVATE_KEY_ID=91b293009e0e4586ad936216076422472f277c73
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIazidE8XvbIFP\nb12rjqCwIIiCT42Sk6UTQmo/lhJfaknb7JNqVdilBFhwDB6++lcb2i+3g44ovOsJ\nPusHUsxkGQXhvaoU8+mkAM1fJDguHbIbkwR1H4xTmJ2q5xH96iq2M2k0dJA5SSfu\nxQI1OACPxoH3HQ8all89fnVIWlPflowXxi1xREIK5dxUxzeoWfpZtKBuYdpCN/YS\nKAJ1kEPmf0zKx+C8/PVzPQQqXLT3sycXSQixACvVSZP4NHfOXv823fpqDwvA5Uuc\nBTtx7D+n/fH0sisdh+jmQATgwRIyO4z3IErVJLBcWK9opvM5W7BlzOxijLt8kU7X\nl542R8unAgMBAAECggEAEFuX+lIT1K/Reg9H4Om6OcXd/mzJzE3aqlDAZUI1a648\nKwQLICGzlfxdz39dvw6lr3NGc778Cl0o/c8x1Z4vangUX9FgIWerCSS7nmlRYIox\n8Eg2k+yoQmZxb/J+KHBFXiuiCZL99n7/EGDqBjf068cy8l1fzza4vUcmAWrF77iv\n4A7MnhFVIAnBnefjIyc7MREskkbyR8WdgTATsEVlWD7Gp760UPve0RDiD0+D0Pl/\nyrLP8ueU8ft8LLUUrRQk5fsLm35OQBqWENfST9wLL22Q2Ue1WePlxoVYCk03Enza\nHnlWuVE9Tpoa+2iSsT3Ye2lMtQ0hfhEsDJFjrjndMQKBgQDtkNzRFYBxywZinlof\nT2j1/vPO6fNgURmRQT+WdZnzSxmF3FlEJK9eNPr7g6Op8IKeAiy1USsv1jS0GPb+\nsadfuB4fENB5QlG+rcZPvpzpF2WVrG1Xw3m2BA7wn7j6jJuoSHr5VX74jpwy+Gcx\njyDWvE8UIgpt8qIn57prEUMOCQKBgQDX+HMdnwKABPa0KkUI4wvNQQkB+jBUALnT\n9HzKvq2KAfRa40N8yIlUMfjySqljEOPT+RV/qGjICr0XwzrrDsx9pwy9H6A3u7+e\n8/6K2SZSCyCOHH+plvf1y4Ap84j1upczoney6LNT+fyKuU3GRLG/CjnUsY+Irv5R\nZpUQUkR4LwKBgBNrLPGWTVp/2vTCtuEqT40UGv/F1dQArRNXfwggcsYVVG/BtDZC\nvWb4868NcppYg4TA7sCfcuVFICe8hqwI/4JufV/SswfGaQIqGDS6gv72n6IdZw6u\ndstvB32ZwLgSOEMIMa0h1PAiUBhGf8DoTyneWKRvp+SW2bRjV7Saw51pAoGBAKhl\nFH0YKr7fH+1CuClBv0X/W6KrDVuyZTKbA2KiYnWlKH5ljY2SX2HCxTVGeeTAmqQB\nJ34uNeUkWmRY2WvGUjP3OLuOGULbpYGvBd4FixeVjYDBP9lf2V9RmVEcjsHrB1I/\nb82UG59y4DLaYYYiseUfeBAbkqskpy+ZKMldG/4JAoGAfXMKXaQUZYv+dWNmIKFF\n6+MV/BnEekcTeiNotuGa7naji7xnhErW/ZpDcgesjVw3wUPOKe0mXWSQrYcNB8vD\nP1yMQdvThFPtJaAh7QJNStEKjGboPfoWH+UP6LaH+bUkSQ7bbXqHbyj8Oih1HLqH\ngg5yqse2qgX3k+rkbUZ4LGM=\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=sheets-service-account@vap-ecommerce.iam.gserviceaccount.com
GOOGLE_CLIENT_ID_SERVICE=102194717825064597473
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/sheets-service-account%40vap-ecommerce.iam.gserviceaccount.com
```

### 2. Tareas Pendientes Antes del Deploy

#### A. Generar NEXTAUTH_SECRET seguro
```bash
# En tu terminal local:
openssl rand -base64 32
```

#### B. Configurar Google OAuth para Producción
1. Ve a Google Cloud Console
2. En OAuth 2.0 Client IDs, agrega tu dominio de producción:
   - Authorized JavaScript origins: https://tu-dominio.com
   - Authorized redirect URIs: https://tu-dominio.com/api/auth/callback/google

#### C. Configurar MercadoPago para Producción
⚠️ IMPORTANTE: Cambiar a credenciales de PRODUCCIÓN
1. Ve a tu cuenta de MercadoPago
2. Cambia a modo "Producción"
3. Obtén las credenciales reales
4. Actualiza las variables de entorno

#### D. Verificar que el build funciona localmente
```bash
npm run build
npm start
```

### 3. Plataformas de Deployment Recomendadas

#### Opción 1: Vercel (Recomendado)
- ✅ Optimizado para Next.js
- ✅ Deploy automático desde GitHub
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Fácil configuración de variables de entorno

#### Opción 2: Netlify
- ✅ Fácil de usar
- ✅ Deploy desde GitHub
- ✅ SSL gratuito
- ⚠️ Limitaciones en el plan gratuito

#### Opción 3: Railway
- ✅ Bueno para full-stack apps
- ✅ Fácil deployment
- ✅ Base de datos incluida
- ⚠️ Plan gratuito limitado

### 4. Checklist Pre-Deploy

- [ ] Build local exitoso
- [ ] Variables de entorno configuradas
- [ ] Google OAuth configurado para producción
- [ ] MercadoPago en modo producción
- [ ] NEXTAUTH_SECRET generado
- [ ] Dominio personalizado (opcional)
- [ ] SSL configurado
- [ ] Tests básicos realizados

### 5. Post-Deploy

- [ ] Verificar que todas las funcionalidades trabajen
- [ ] Probar autenticación Google
- [ ] Probar upload de imágenes a Cloudinary
- [ ] Probar proceso de checkout con MercadoPago
- [ ] Configurar monitoreo (opcional)
- [ ] Configurar backup de Google Sheets (opcional)
