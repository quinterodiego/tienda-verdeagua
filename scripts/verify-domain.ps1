# 🔍 Script de Verificación para tienda-verdeagua.com.ar
# PowerShell version

Write-Host "🔍 Verificando configuración de tienda-verdeagua.com.ar..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Gray

$domain = "tienda-verdeagua.com.ar"
$wwwDomain = "www.tienda-verdeagua.com.ar"

Write-Host ""
Write-Host "📡 1. Verificando DNS..." -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Gray

# Verificar registro A
Write-Host "🔹 Registro A para $domain:" -ForegroundColor White
try {
    $dnsResult = Resolve-DnsName -Name $domain -Type A -ErrorAction SilentlyContinue
    if ($dnsResult) {
        Write-Host "   → $($dnsResult.IPAddress)" -ForegroundColor Green
    } else {
        Write-Host "   → No resuelve" -ForegroundColor Red
    }
} catch {
    Write-Host "   → Error al resolver DNS" -ForegroundColor Red
}

# Verificar registro CNAME para www
Write-Host "🔹 Registro CNAME para $wwwDomain:" -ForegroundColor White
try {
    $cnameResult = Resolve-DnsName -Name $wwwDomain -Type CNAME -ErrorAction SilentlyContinue
    if ($cnameResult) {
        Write-Host "   → $($cnameResult.NameHost)" -ForegroundColor Green
    } else {
        Write-Host "   → No hay CNAME configurado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   → Error al resolver CNAME" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 2. Verificando conectividad HTTP/HTTPS..." -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Gray

# Verificar HTTPS
Write-Host "🔹 HTTPS Status:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://$domain" -Method Head -TimeoutSec 10 -ErrorAction SilentlyContinue
    Write-Host "   → HTTPS: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
} catch {
    Write-Host "   → HTTPS: No disponible o error" -ForegroundColor Red
}

# Verificar HTTP (debería redirigir a HTTPS)
Write-Host "🔹 HTTP Status:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://$domain" -Method Head -TimeoutSec 10 -ErrorAction SilentlyContinue
    Write-Host "   → HTTP: $($response.StatusCode) (debería redirigir a HTTPS)" -ForegroundColor Yellow
} catch {
    Write-Host "   → HTTP: No disponible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 3. Verificando redirecciones..." -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

# WWW a no-WWW
Write-Host "🔹 Redirección www → no-www:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://$wwwDomain" -Method Head -TimeoutSec 10 -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.Headers.Location) {
        Write-Host "   → Redirige a: $($response.Headers.Location)" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.Headers.Location) {
        Write-Host "   → Redirige a: $($_.Exception.Response.Headers.Location)" -ForegroundColor Green
    } else {
        Write-Host "   → Sin redirección configurada" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🚀 4. Verificando API..." -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Gray

Write-Host "🔹 API Status:" -ForegroundColor White
try {
    $apiResponse = Invoke-RestMethod -Uri "https://$domain/api/debug/production-readiness" -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($apiResponse) {
        Write-Host "   → API respondiendo correctamente" -ForegroundColor Green
        if ($apiResponse.ready) {
            Write-Host "   → Status: READY ✅" -ForegroundColor Green
        } else {
            Write-Host "   → Status: NOT READY ⚠️" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   → API no disponible" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Gray
Write-Host "✅ Verificación completada para $domain" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Enlaces útiles:" -ForegroundColor Cyan
Write-Host "   - Verificar DNS online: https://dnschecker.org" -ForegroundColor White
Write-Host "   - Verificar SSL: https://www.ssllabs.com/ssltest/" -ForegroundColor White
Write-Host "   - Panel Vercel: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   - Tu sitio: https://$domain" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Gray
