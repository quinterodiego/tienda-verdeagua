@echo off
echo Iniciando commit de correcciones...

git add .
if %errorlevel% neq 0 (
    echo Error en git add
    pause
    exit /b 1
)

git commit -m "🔧 Debug: Agregar herramientas de debugging para filtrado de productos

- Crear endpoint /api/debug/products para analizar filtrado
- Agregar script de test para verificar productos visibles
- Investigar por qué usuarios no admin ven productos inactivos"

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
