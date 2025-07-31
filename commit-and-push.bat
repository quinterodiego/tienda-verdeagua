@echo off
echo Iniciando commit de correcciones...

git add .
if %errorlevel% neq 0 (
    echo Error en git add
    pause
    exit /b 1
)

git commit -m "🔧 Fix: Corregir filtrado de productos y detalle de producto

- Corregir manejo de respuesta API en todas las páginas que consumen productos
- Asegurar filtrado correcto de productos activos/inactivos  
- Agregar logging detallado para debugging del filtrado
- Corregir página de detalle de producto para manejar respuesta API correcta
- Corregir páginas de favoritos, categorías y smartphones
- Garantizar que usuarios comunes solo vean productos activos"

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
