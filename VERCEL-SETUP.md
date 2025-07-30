# 🔧 Configurar Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Los valores mostrados son EJEMPLOS. Usa TUS credenciales reales.

## 📋 Variables que necesitas configurar en Vercel:

Ve a: https://vercel.com/quinterodiegos-projects/vap-copilot/settings/environment-variables

### Configuración Paso a Paso:

1. **Ve a tu proyecto en Vercel Dashboard**
2. **Clic en "Settings" → "Environment Variables"**
3. **Agrega estas variables una por una:**

```env
# MercadoPago Producción
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3055031989051158-072922-a8909d0d1567155a714c60e12af006c5-52770305
MERCADOPAGO_PUBLIC_KEY=APP_USR-5a8b657e-06e8-4443-815e-18ee961bf3c2
MERCADOPAGO_MODE=production

# URLs Producción
NEXT_PUBLIC_BASE_URL=https://vap-copilot-e87z2dvtq-quinterodiegos-projects.vercel.app
NEXTAUTH_URL=https://vap-copilot-e87z2dvtq-quinterodiegos-projects.vercel.app

# NextAuth
NEXTAUTH_SECRET=prod-a8f3k9d2m5n7q1w4e6r8t0y2u4i9o7p3s6d8f1g4h7j2k5l8

# Google OAuth
GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=TU_GOOGLE_CLIENT_SECRET

# Cloudinary
CLOUDINARY_CLOUD_NAME=dsux52cft
CLOUDINARY_API_KEY=896156681542828
CLOUDINARY_API_SECRET=qsD1tkvGnlzbP9HuFuy7ArnysWg

# Google Sheets
GOOGLE_SHEET_ID=1bjSawahcUFK6A7j8MPC0kvxuvKNd63fcdouI82jOlE8
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=vap-ecommerce
GOOGLE_PRIVATE_KEY_ID=91b293009e0e4586ad936216076422472f277c73
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIazidE8XvbIFPb12rjqCwIIiCT42Sk6UTQmo/lhJfaknb7JNqVdilBFhwDB6++lcb2i+3g44ovOsJPusHUsxkGQXhvaoU8+mkAM1fJDguHbIbkwR1H4xTmJ2q5xH96iq2M2k0dJA5SSfuxQI1OACPxoH3HQ8all89fnVIWlPflowXxi1xREIK5dxUxzeoWfpZtKBuYdpCN/YSKAJ1kEPmf0zKx+C8/PVzPQQqXLT3sycXSQixACvVSZP4NHfOXv823fpqDwvA5UucBTtx7D+n/fH0sisdh+jmQATgwRIyO4z3IErVJLBcWK9opvM5W7BlzOxijLt8kU7Xl542R8unAgMBAAECggEAEFuX+lIT1K/Reg9H4Om6OcXd/mzJzE3aqlDAZUI1a648KwQLICGzlfxdz39dvw6lr3NGc778Cl0o/c8x1Z4vangUX9FgIWerCSS7nmlRYIox8Eg2k+yoQmZxb/J+KHBFXiuiCZL99n7/EGDqBjf068cy8l1fzza4vUcmAWrF77iv4A7MnhFVIAnBnefjIyc7MREskkbyR8WdgTATsEVlWD7Gp760UPve0RDiD0+D0Pl/yrLP8ueU8ft8LLUUrRQk5fsLm35OQBqWENfST9wLL22Q2Ue1WePlxoVYCk03EnzaHnlWuVE9Tpoa+2iSsT3Ye2lMtQ0hfhEsDJFjrjndMQKBgQDtkNzRFYBxywZinlofT2j1/vPO6fNgURmRQT+WdZnzSxmF3FlEJK9eNPr7g6Op8IKeAiy1USsv1jS0GPb+sadfuB4fENB5QlG+rcZPvpzpF2WVrG1Xw3m2BA7wn7j6jJuoSHr5VX74jpwy+GcxjyDWvE8UIgpt8qIn57prEUMOCQKBgQDX+HMdnwKABPa0KkUI4wvNQQkB+jBUALnT9HzKvq2KAfRa40N8yIlUMfjySqljEOPT+RV/qGjICr0XwzrrDsx9pwy9H6A3u7+e8/6K2SZSCyCOHH+plvf1y4Ap84j1upczoney6LNT+fyKuU3GRLG/CjnUsY+Irv5RZpUQUkR4LwKBgBNrLPGWTVp/2vTCtuEqT40UGv/F1dQArRNXfwggcsYVVG/BtDZCvWb4868NcppYg4TA7sCfcuVFICe8hqwI/4JufV/SswfGaQIqGDS6gv72n6IdZw6udstvB32ZwLgSOEMIMa0h1PAiUBhGf8DoTyneWKRvp+SW2bRjV7Saw51pAoGBAKhlFH0YKr7fH+1CuClBv0X/W6KrDVuyZTKbA2KiYnWlKH5ljY2SX2HCxTVGeeTAmqQBJ34uNeUkWmRY2WvGUjP3OLuOGULbpYGvBd4FixeVjYDBP9lf2V9RmVEcjsHrB1I/b82UG59y4DLaYYYiseUfeBAbkqskpy+ZKMldG/4JAoGAfXMKXaQUZYv+dWNmIKFF6+MV/BnEekcTeiNotuGa7naji7xnhErW/ZpDcgesjVw3wUPOKe0mXWSQrYcNB8vDP1yMQdvThFPtJaAh7QJNStEKjGboPfoWH+UP6LaH+bUkSQ7bbXqHbyj8Oih1HLqHgg5yqse2qgX3k+rkbUZ4LGM=-----END PRIVATE KEY-----"
GOOGLE_CLIENT_EMAIL=sheets-service-account@vap-ecommerce.iam.gserviceaccount.com
GOOGLE_CLIENT_ID_SERVICE=102194717825064597473
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/sheets-service-account%40vap-ecommerce.iam.gserviceaccount.com

# Configuración adicional
NEXT_PUBLIC_ENABLE_LOGGING=false
```

## 🔄 Después de configurar las variables:

1. **Redeploy automático:** Vercel hará redeploy automáticamente
2. **Espera 2-3 minutos** para que se actualice
3. **Prueba la aplicación** en la URL de producción

## 🧪 Verificar que funciona:

Ve a: https://vap-copilot-e87z2dvtq-quinterodiegos-projects.vercel.app/api/debug/production-readiness

Debería mostrar `"ready": true` y `"mode": "production"`
