# Script para hacer merge de dev a main (release a producción)
param(
    [string]$commitMessage = ""
)

Write-Host "🚀 Iniciando proceso de release (dev -> main)" -ForegroundColor Magenta

# Configurar variable de entorno
$env:GIT_CONFIG_NOSYSTEM = "1"

try {
    # Verificar que estamos en dev
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "dev") {
        Write-Host "⚠️ No estás en la rama dev. Cambiando..." -ForegroundColor Yellow
        git checkout dev
    }
    
    # Sincronizar dev
    Write-Host "🔄 Sincronizando dev con remoto..." -ForegroundColor Cyan
    git pull origin dev
    
    # Cambiar a main
    Write-Host "🌿 Cambiando a main..." -ForegroundColor Green
    git checkout main
    
    # Sincronizar main
    Write-Host "🔄 Sincronizando main con remoto..." -ForegroundColor Cyan
    git pull origin main
    
    # Mostrar diferencias
    Write-Host "📋 Cambios que se van a mergear:" -ForegroundColor Cyan
    git log main..dev --oneline
    
    # Pedir confirmación
    $confirmation = Read-Host "¿Continuar con el merge? (y/N)"
    if ($confirmation -ne "y" -and $confirmation -ne "Y") {
        Write-Host "❌ Release cancelado" -ForegroundColor Red
        git checkout dev
        exit 1
    }
    
    # Hacer merge
    Write-Host "🔄 Mergeando dev a main..." -ForegroundColor Green
    git merge dev --no-ff -m "release: merge dev to main$(if($commitMessage) { " - $commitMessage" })"
    
    # Push a main (esto triggerera el deploy)
    Write-Host "📤 Pusheando a main (esto deployará a producción)..." -ForegroundColor Yellow
    git push origin main
    
    # Volver a dev
    git checkout dev
    
    Write-Host "✅ Release completado exitosamente!" -ForegroundColor Green
    Write-Host "🌐 El deploy a producción debería iniciarse automáticamente en Vercel" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error durante el release: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Volviendo a dev..." -ForegroundColor Yellow
    git checkout dev
}
