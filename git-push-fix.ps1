# Script inteligente para hacer git push evitando el problema de configuración corrupta
# Detecta automáticamente la rama actual y pushea a la rama correcta

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

# Detectar rama actual
try {
    $currentBranch = git branch --show-current
    Write-Host "🌿 Rama actual: $currentBranch" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error al detectar la rama actual" -ForegroundColor Red
    exit 1
}

# Verificar estado del repositorio
Write-Host "📊 Verificando estado del repositorio..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ Hay cambios sin commit:" -ForegroundColor Yellow
    git status --short
    Write-Host "💡 Tip: Haz commit de tus cambios antes de push" -ForegroundColor Yellow
} else {
    Write-Host "✅ Working tree limpio" -ForegroundColor Green
}

# Verificar si hay commits para push
$upstream = git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
if ($upstream) {
    $ahead = git rev-list --count '@{u}..HEAD' 2>$null
    if ($ahead -and $ahead -gt 0) {
        Write-Host "📤 Hay $ahead commit(s) para push a $upstream" -ForegroundColor Cyan
        
        # Intentar push a la rama actual
        Write-Host "🚀 Ejecutando git push origin $currentBranch..." -ForegroundColor Green
        try {
            git push origin $currentBranch
            Write-Host "✅ Push exitoso a $currentBranch!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error en push: $($_.Exception.Message)" -ForegroundColor Red
            
            # Intentar una solución alternativa
            Write-Host "🔄 Intentando push con configuración alternativa..." -ForegroundColor Yellow
            $env:GIT_TRACE = "1"
            git push origin $currentBranch
        }
    } else {
        Write-Host "✅ No hay commits pendientes para push" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ La rama $currentBranch no tiene upstream configurado" -ForegroundColor Yellow
    Write-Host "🔄 Configurando upstream y pusheando..." -ForegroundColor Cyan
    try {
        git push -u origin $currentBranch
        Write-Host "✅ Push exitoso con upstream configurado!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al configurar upstream: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🏁 Script completado." -ForegroundColor Magenta
