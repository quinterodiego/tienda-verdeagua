# Script para configurar variables de entorno en Vercel
# Ejecutar: powershell -ExecutionPolicy Bypass .\deploy-env-setup.ps1

Write-Host "🚀 Configurando variables de entorno para Vercel..." -ForegroundColor Green

# Obtener el dominio actual de Vercel
$domain = "tienda-verdeagua.vercel.app"
Write-Host "📍 Dominio detectado: $domain" -ForegroundColor Blue

# Variables críticas para el deployment
$envVars = @{
    "NEXT_PUBLIC_BASE_URL" = "https://$domain"
    "NEXTAUTH_URL" = "https://$domain"
    "NEXT_PUBLIC_SITE_URL" = "https://$domain"
    "NEXT_PUBLIC_APP_URL" = "https://$domain"
    "MERCADOPAGO_MODE" = "production"
    "MERCADOPAGO_ACCESS_TOKEN" = "APP_USR-3055031989051158-072922-a8909d0d1567155a714c60e12af006c5-52770305"
    "MERCADOPAGO_PUBLIC_KEY" = "APP_USR-5a8b657e-06e8-4443-815e-18ee961bf3c2"
    "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY" = "APP_USR-5a8b657e-06e8-4443-815e-18ee961bf3c2"
    "NEXTAUTH_SECRET" = "desarrollo-secreto-super-largo-y-seguro-para-jwt-tokens-cambiar-en-produccion-deployment-$(Get-Random)"
    "GOOGLE_CLIENT_ID" = "892483570826-sd4qbu20acb11q1otccv18vsndpkavec.apps.googleusercontent.com"
    "GOOGLE_CLIENT_SECRET" = "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"
    "CLOUDINARY_CLOUD_NAME" = "dsux52cft"
    "CLOUDINARY_API_KEY" = "896156681542828"
    "CLOUDINARY_API_SECRET" = "qsD1tkvGnlzbP9HuFuy7ArnysWg"
    "GOOGLE_SHEET_ID" = "1bjSawahcUFK6A7j8MPC0kvxuvKNd63fcdouI82jOlE8"
    "GOOGLE_TYPE" = "service_account"
    "GOOGLE_PROJECT_ID" = "vap-ecommerce"
    "GOOGLE_PRIVATE_KEY_ID" = "91b293009e0e4586ad936216076422472f277c73"
    "GOOGLE_CLIENT_EMAIL" = "sheets-service-account@vap-ecommerce.iam.gserviceaccount.com"
    "GOOGLE_CLIENT_ID_SERVICE" = "102194717825064597473"
    "GOOGLE_AUTH_URI" = "https://accounts.google.com/o/oauth2/auth"
    "GOOGLE_TOKEN_URI" = "https://oauth2.googleapis.com/token"
    "GOOGLE_AUTH_PROVIDER_X509_CERT_URL" = "https://www.googleapis.com/oauth2/v1/certs"
    "GOOGLE_CLIENT_X509_CERT_URL" = "https://www.googleapis.com/robot/v1/metadata/x509/sheets-service-account%40vap-ecommerce.iam.gserviceaccount.com"
    "EMAIL_HOST" = "smtp.gmail.com"
    "EMAIL_PORT" = "587"
    "EMAIL_SECURE" = "false"
    "EMAIL_USER" = "d86webs@gmail.com"
    "EMAIL_PASSWORD" = "oxwu ckrr ksuz katu"
    "EMAIL_FROM" = "d86webs@gmail.com"
    "EMAIL_FROM_NAME" = "Verde Agua Personalizados"
    "EMAIL_ADMIN" = "d86webs@gmail.com"
    "EMAIL_LOGO_URL" = "https://res.cloudinary.com/dsux52cft/image/upload/v1754179989/logo-horizontal_ceyvtq.png"
}

# Configurar GOOGLE_PRIVATE_KEY como variable separada (formato especial)
$googlePrivateKey = @"
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIazidE8XvbIFP
b12rjqCwIIiCT42Sk6UTQmo/lhJfaknb7JNqVdilBFhwDB6++lcb2i+3g44ovOsJ
PusHUsxkGQXhvaoU8+mkAM1fJDguHbIbkwR1H4xTmJ2q5xH96iq2M2k0dJA5SSfu
xQI1OACPxoH3HQ8all89fnVIWlPflowXxi1xREIK5dxUxzeoWfpZtKBuYdpCN/YS
KAJ1kEPmf0zKx+C8/PVzPQQqXLT3sycXSQixACvVSZP4NHfOXv823fpqDwvA5Uuc
BTtx7D+n/fH0sisdh+jmQATgwRIyO4z3IErVJLBcWK9opvM5W7BlzOxijLt8kU7X
l542R8unAgMBAAECggEAEFuX+lIT1K/Reg9H4Om6OcXd/mzJzE3aqlDAZUI1a648
KwQLICGzlfxdz39dvw6lr3NGc778Cl0o/c8x1Z4vangUX9FgIWerCSS7nmlRYIox
8Eg2k+yoQmZxb/J+KHBFXiuiCZL99n7/EGDqBjf068cy8l1fzza4vUcmAWrF77iv
4A7MnhFVIAnBnefjIyc7MREskkbyR8WdgTATsEVlWD7Gp760UPve0RDiD0+D0Pl/
yrLP8ueU8ft8LLUUrRQk5fsLm35OQBqWENfST9wLL22Q2Ue1WePlxoVYCk03Enza
HnlWuVE9Tpoa+2iSsT3Ye2lMtQ0hfhEsDJFjrjndMQKBgQDtkNzRFYBxywZinlof
T2j1/vPO6fNgURmRQT+WdZnzSxmF3FlEJK9eNPr7g6Op8IKeAiy1USsv1jS0GPb+
sadfuB4fENB5QlG+rcZPvpzpF2WVrG1Xw3m2BA7wn7j6jJuoSHr5VX74jpwy+Gcx
jyDWvE8UIgpt8qIn57prEUMOCQKBgQDX+HMdnwKABPa0KkUI4wvNQQkB+jBUALnT
9HzKvq2KAfRa40N8yIlUMfjySqljEOPT+RV/qGjICr0XwzrrDsx9pwy9H6A3u7+e
8/6K2SZSCyCOHH+plvf1y4Ap84j1upczoney6LNT+fyKuU3GRLG/CjnUsY+Irv5R
ZpUQUkR4LwKBgBNrLPGWTVp/2vTCtuEqT40UGv/F1dQArRNXfwggcsYVVG/BtDZC
vWb4868NcppYg4TA7sCfcuVFICe8hqwI/4JufV/SswfGaQIqGDS6gv72n6IdZw6u
dstvB32ZwLgSOEMIMa0h1PAiUBhGf8DoTyneWKRvp+SW2bRjV7Saw51pAoGBAKhl
FH0YKr7fH+1CuClBv0X/W6KrDVuyZTKbA2KiYnWlKH5ljY2SX2HCxTVGeeTAmqQB
J34uNeUkWmRY2WvGUjP3OLuOGULbpYGvBd4FixeVjYDBP9lf2V9RmVEcjsHrB1I/
b82UG59y4DLaYYYiseUfeBAbkqskpy+ZKMldG/4JAoGAfXMKXaQUZYv+dWNmIKFF
6+MV/BnEekcTeiNotuGa7naji7xnhErW/ZpDcgesjVw3wUPOKe0mXWSQrYcNB8vD
P1yMQdvThFPtJaAh7QJNStEKjGboPfoWH+UP6LaH+bUkSQ7bbXqHbyj8Oih1HLqH
gg5yqse2qgX3k+rkbUZ4LGM=
-----END PRIVATE KEY-----
"@

Write-Host "📝 Configurando variables de entorno..." -ForegroundColor Yellow

# Configurar variables de entorno
foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "   ✓ $key" -ForegroundColor Green
    & vercel env add $key production --token="$env:VERCEL_TOKEN" <<< "$value"
}

# Configurar la clave privada de Google (formato especial)
Write-Host "   ✓ GOOGLE_PRIVATE_KEY" -ForegroundColor Green
& vercel env add "GOOGLE_PRIVATE_KEY" production --token="$env:VERCEL_TOKEN" <<< "$googlePrivateKey"

Write-Host ""
Write-Host "✅ Variables de entorno configuradas!" -ForegroundColor Green
Write-Host "🚀 Ahora puedes hacer el deployment con: vercel --prod" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 Recordatorio: Actualizar URLs en MercadoPago:" -ForegroundColor Yellow
Write-Host "   • Success: https://$domain/checkout/success" -ForegroundColor Cyan
Write-Host "   • Failure: https://$domain/checkout/failure" -ForegroundColor Cyan
Write-Host "   • Pending: https://$domain/checkout/pending" -ForegroundColor Cyan
Write-Host "   • Webhook: https://$domain/api/mercadopago/webhook" -ForegroundColor Cyan
