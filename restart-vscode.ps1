# Script para reiniciar VS Code y aplicar la configuración de Git
Write-Host "Reiniciando VS Code para aplicar configuración de Git..." -ForegroundColor Cyan

# Cerrar VS Code forzadamente
try {
    Get-Process 'Code' | Stop-Process -Force
    Write-Host "✓ VS Code cerrado exitosamente" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "VS Code no estaba ejecutándose o ya se cerró" -ForegroundColor Yellow
}

# Configurar variable de entorno para esta sesión
$env:GIT_CONFIG_NOSYSTEM = "1"

# Cambiar al directorio del proyecto
Set-Location "c:\Users\Diego\Documents\GitHub\tienda-verdeagua"

Write-Host "Abriendo VS Code con la configuración correcta..." -ForegroundColor Green

# Abrir VS Code
Start-Process "code" -ArgumentList "." -NoNewWindow

Write-Host "✓ VS Code abierto. GitLens debería funcionar ahora." -ForegroundColor Green
