# Migración Completa de Lucide React a Heroicons

Write-Host "🚀 Iniciando migración masiva de Lucide React a Heroicons..." -ForegroundColor Green

# Lista de archivos que necesitan migración
$files = @(
    "src\lib\optimized-icons.ts",
    "src\components\SimpleThemeToggle.tsx",
    "src\components\OrderDetailModal.tsx", 
    "src\components\ThemeCustomizer.tsx",
    "src\components\TestCardsHelper.tsx",
    "src\components\ThemeIndicator.tsx",
    "src\components\ThemeSettings.tsx",
    "src\app\nosotros\page.tsx",
    "src\app\mis-pedidos\page-simple.tsx",
    "src\app\mis-pedidos\page.tsx",
    "src\app\contacto\page-new.tsx",
    "src\app\contacto\page.tsx",
    "src\app\contacto\page-old.tsx",
    "src\app\checkout\failure\page.tsx",
    "src\components\MercadoPagoCheckout_backup.tsx"
)

Write-Host "📋 Archivos a migrar: $($files.Count)" -ForegroundColor Yellow

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Migrando: $file" -ForegroundColor Cyan
        
        # Leer el contenido
        $content = Get-Content $file -Raw
        
        # Reemplazar la importación
        $newContent = $content -replace "from 'lucide-react'", "from '@/components/HeroIcons'"
        
        # Escribir el nuevo contenido
        Set-Content -Path $file -Value $newContent -NoNewline
        
        Write-Host "✅ Migrado: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Archivo no encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host "✨ Migración masiva completada!" -ForegroundColor Green
Write-Host "🔄 Los cambios se aplicarán automáticamente con HMR" -ForegroundColor Cyan
