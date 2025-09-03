# Script para hacer git push evitando el problema de configuración corrupta
# Este script configura la variable de entorno y ejecuta git push

Write-Host "🔧 Configurando Git para evitar error de configuración..." -ForegroundColor Yellow

# Configurar variable de entorno para la sesión actual
$env:GIT_CONFIG_NOSYSTEM = "1"

# Verificar que Git responde
try {
    $gitVersion = git --version
    Write-Host "✅ Git disponible: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Git no está disponible" -ForegroundColor Red
    exit 1
}

# Verificar estado del repositorio
Write-Host "📊 Verificando estado del repositorio..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ Hay cambios sin commit:" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "✅ Working tree limpio" -ForegroundColor Green
}

# Verificar si hay commits para push
$ahead = git rev-list --count '@{u}..HEAD' 2>$null
if ($ahead -and $ahead -gt 0) {
    Write-Host "📤 Hay $ahead commit(s) para push" -ForegroundColor Cyan
    
    # Intentar push
    Write-Host "🚀 Ejecutando git push origin main..." -ForegroundColor Green
    try {
        git push origin main
        Write-Host "✅ Push exitoso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error en push: $($_.Exception.Message)" -ForegroundColor Red
        
        # Intentar una solución alternativa
        Write-Host "🔄 Intentando push con configuración alternativa..." -ForegroundColor Yellow
        $env:GIT_TRACE = "1"
        git push origin main
    }
} else {
    Write-Host "✅ No hay commits pendientes para push" -ForegroundColor Green
}

Write-Host "🏁 Script completado." -ForegroundColor Magenta
