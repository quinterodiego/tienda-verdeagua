# Script para cambiar a la rama dev y sincronizar
Write-Host "🌿 Cambiando a rama dev..." -ForegroundColor Green

# Configurar variable de entorno
$env:GIT_CONFIG_NOSYSTEM = "1"

try {
    # Cambiar a dev
    git checkout dev
    Write-Host "✅ Cambiado a rama dev" -ForegroundColor Green
    
    # Sincronizar con el remoto
    Write-Host "🔄 Sincronizando con origin/dev..." -ForegroundColor Cyan
    git pull origin dev
    Write-Host "✅ Sincronización completada" -ForegroundColor Green
    
    # Mostrar status
    Write-Host "📊 Estado actual:" -ForegroundColor Cyan
    git status --short
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
