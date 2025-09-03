# Script para cambiar a la rama main y sincronizar
Write-Host "🌿 Cambiando a rama main..." -ForegroundColor Green

# Configurar variable de entorno
$env:GIT_CONFIG_NOSYSTEM = "1"

try {
    # Cambiar a main
    git checkout main
    Write-Host "✅ Cambiado a rama main" -ForegroundColor Green
    
    # Sincronizar con el remoto
    Write-Host "🔄 Sincronizando con origin/main..." -ForegroundColor Cyan
    git pull origin main
    Write-Host "✅ Sincronización completada" -ForegroundColor Green
    
    # Mostrar status
    Write-Host "📊 Estado actual:" -ForegroundColor Cyan
    git status --short
    
    # Advertencia sobre main
    Write-Host "⚠️ RECUERDA: Solo mergea a main código probado desde dev" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
