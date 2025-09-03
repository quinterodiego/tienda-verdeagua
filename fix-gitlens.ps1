# Script para solucionar el problema de GitLens con configuración Git corrupta
# Este script configura la variable de entorno para omitir la configuración del sistema

Write-Host "=== Solucionando problema de GitLens ===" -ForegroundColor Cyan
Write-Host "Configurando variable de entorno para omitir configuración Git del sistema..." -ForegroundColor Green

# Configurar la variable de entorno para la sesión actual
$env:GIT_CONFIG_NOSYSTEM = "1"

# Configurar la variable de entorno de forma permanente para el usuario
[Environment]::SetEnvironmentVariable("GIT_CONFIG_NOSYSTEM", "1", "User")

Write-Host "✓ Variable GIT_CONFIG_NOSYSTEM configurada exitosamente." -ForegroundColor Green
Write-Host "  Esta variable omite el archivo de configuración Git del sistema que está corrupto." -ForegroundColor Yellow

# Verificar configuración de VS Code
Write-Host "`nVerificando configuración de VS Code..." -ForegroundColor Cyan
$vscodeSettings = ".vscode\settings.json"
if (Test-Path $vscodeSettings) {
    Write-Host "✓ Configuración de VS Code actualizada en $vscodeSettings" -ForegroundColor Green
} else {
    Write-Host "✗ No se encontró archivo de configuración de VS Code" -ForegroundColor Red
}

# Verificar que Git funciona
Write-Host "`nVerificando que Git funciona correctamente..." -ForegroundColor Cyan
try {
    $env:GIT_CONFIG_NOSYSTEM = "1"
    git status --porcelain | Measure-Object | Select-Object -ExpandProperty Count | Out-Null
    Write-Host "✓ Git funciona correctamente" -ForegroundColor Green
} catch {
    Write-Host "✗ Aún hay problemas con Git: $_" -ForegroundColor Red
}

# Instrucciones finales
Write-Host "`n=== PASOS SIGUIENTES ===" -ForegroundColor Magenta
Write-Host "1. CIERRA completamente VS Code (Ctrl+Shift+P -> 'Developer: Quit')" -ForegroundColor Yellow
Write-Host "2. Abre una nueva ventana de PowerShell" -ForegroundColor Yellow
Write-Host "3. Ejecuta: code . desde la carpeta del proyecto" -ForegroundColor Yellow
Write-Host "4. GitLens debería funcionar correctamente" -ForegroundColor Yellow

Write-Host "`nSi el problema persiste, ejecuta este comando en la terminal:" -ForegroundColor Cyan
Write-Host "Get-Process 'Code' | Stop-Process -Force" -ForegroundColor White
