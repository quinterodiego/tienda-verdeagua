@echo off
echo Iniciando commit de correcciones...

git add .
if %errorlevel% neq 0 (
    echo Error en git add
    pause
    exit /b 1
)

git commit -m "🔧 CRITICAL Fix: Corregir filtrado de productos en Google Sheets

- FIX CRÍTICO: getProductsFromSheets ahora respeta el parámetro includeInactive
- Usar shouldIncludeInactive correctamente para filtrar productos de Google Sheets
- Agregar logging extenso en getProductsFromSheets para debugging
- Corregir manejo de permisos de usuario vs filtrado de productos
- Resolver problema donde productos inactivos de Google Sheets eran visibles
- Asegurar consistencia entre Google Sheets y fallback estático"

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
