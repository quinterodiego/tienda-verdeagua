# Script para actualizar todos los endpoints de debug para usar el sistema dinámico de administradores
# Este script reemplaza las listas hardcodeadas de adminEmails con el helper dinámico

Write-Host "🔄 Iniciando actualización masiva de endpoints de debug..." -ForegroundColor Green

# Función para reemplazar contenido en archivos
function Update-DebugEndpoint {
    param(
        [string]$FilePath,
        [string]$EndpointName
    )
    
    Write-Host "📝 Actualizando: $EndpointName" -ForegroundColor Yellow
    
    try {
        $content = Get-Content -Path $FilePath -Raw
        
        # Buscar patrones de adminEmails hardcodeados
        $hasHardcodedEmails = $content -match "adminEmails\s*=\s*\[.*?'.*?@.*?'.*?\]"
        
        if ($hasHardcodedEmails) {
            Write-Host "   ✅ Emails hardcodeados encontrados" -ForegroundColor Cyan
            
            # Agregar import del helper si no existe
            if ($content -notmatch "verifyDebugAdminAccess") {
                $content = $content -replace "(import.*?from '@/lib/auth';)", "`$1`nimport { verifyDebugAdminAccess } from '@/lib/debug-admin-helper';"
                Write-Host "   📦 Import agregado" -ForegroundColor Green
            }
            
            # Reemplazar verificación de admin
            $content = $content -replace "const adminEmails = \[.*?\];[\s\S]*?if \(!session\?\?\.user\?\?\.email \|\| !adminEmails\.includes\(session\.user\.email\)\) \{[\s\S]*?return NextResponse\.json\(\{ error: '.*?' \}, \{ status: 40[13] \}\);[\s\S]*?\}", @"
// Verificar acceso administrativo dinámicamente
    const adminCheck = await verifyDebugAdminAccess();
    if (!adminCheck.success) {
      return adminCheck.response!;
    }
"@
            
            # Guardar archivo actualizado
            Set-Content -Path $FilePath -Value $content -Encoding UTF8
            Write-Host "   ✅ Archivo actualizado exitosamente" -ForegroundColor Green
        } else {
            Write-Host "   ⏭️  No se encontraron emails hardcodeados (ya actualizado o no necesario)" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "   ❌ Error al procesar archivo: $_" -ForegroundColor Red
    }
}

# Lista de endpoints de debug para actualizar
$debugEndpoints = @(
    @{ Path = "src\app\api\debug\email\password-reset-test\route.ts"; Name = "Password Reset Test" },
    @{ Path = "src\app\api\debug\email\config\route.ts"; Name = "Email Config" },
    @{ Path = "src\app\api\debug\email\welcome-test\route.ts"; Name = "Welcome Test" },
    @{ Path = "src\app\api\debug\email\order-test\route.ts"; Name = "Order Test" },
    @{ Path = "src\app\api\debug\email\advanced-test\route.ts"; Name = "Advanced Test" },
    @{ Path = "src\app\api\debug\email\admin-test\route.ts"; Name = "Admin Test" },
    @{ Path = "src\app\api\debug\access-check\route.ts"; Name = "Access Check" },
    @{ Path = "src\app\api\debug\google-sheets\route.ts"; Name = "Google Sheets Debug" },
    @{ Path = "src\app\api\debug\reset-user-password\route.ts"; Name = "Reset User Password" }
)

Write-Host "📊 Total de endpoints a procesar: $($debugEndpoints.Count)" -ForegroundColor Magenta

foreach ($endpoint in $debugEndpoints) {
    $fullPath = Join-Path -Path (Get-Location) -ChildPath $endpoint.Path
    
    if (Test-Path $fullPath) {
        Update-DebugEndpoint -FilePath $fullPath -EndpointName $endpoint.Name
    } else {
        Write-Host "⚠️  Archivo no encontrado: $($endpoint.Path)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Actualización masiva completada!" -ForegroundColor Green
Write-Host "📋 Resumen:" -ForegroundColor Cyan
Write-Host "   • Endpoints de debug actualizados para usar sistema dinámico" -ForegroundColor White
Write-Host "   • Los administradores ahora se obtienen desde Google Sheets" -ForegroundColor White
Write-Host "   • Cache implementado para optimizar consultas" -ForegroundColor White
Write-Host "   • Fallback configurado en caso de errores" -ForegroundColor White

Write-Host "`n📝 Próximos pasos recomendados:" -ForegroundColor Yellow
Write-Host "   1. Verificar que todos los archivos compilen correctamente" -ForegroundColor White
Write-Host "   2. Probar la funcionalidad del panel de administrador" -ForegroundColor White  
Write-Host "   3. Verificar que los endpoints de debug funcionen correctamente" -ForegroundColor White
Write-Host "   4. Confirmar que los administradores se lean desde Google Sheets" -ForegroundColor White
