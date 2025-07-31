@echo off
echo Iniciando commit de correcciones...

git add .
if %errorlevel% neq 0 (
    echo Error en git add
    pause
    exit /b 1
)

git commit -m "🔧 CRITICAL Fix: Implementar filtrado robusto de productos activos/inactivos

- Simplificar lógica de filtrado en API para mayor confiabilidad
- Obtener TODOS los productos primero, luego filtrar según permisos de usuario  
- Agregar logging extenso para debugging completo del proceso
- Asegurar que usuarios públicos SOLO vean productos con status 'active'
- Corregir manejo de fallback para respetar filtrado de estados
- Garantizar que productos sin status defaulteen a 'active'
- Separar lógica de permisos de admin vs filtrado público"

if %errorlevel% neq 0 (
    echo Error en git commit
    pause
    exit /b 1
)

git push origin main
if %errorlevel% neq 0 (
    echo Error en git push
    pause
    exit /b 1
)

echo ✅ Commit y push completados exitosamente!
pause
