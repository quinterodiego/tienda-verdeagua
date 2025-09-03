@echo off
echo Configurando Git para push...
set GIT_CONFIG_NOSYSTEM=1
echo Ejecutando git push origin main...
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo Push exitoso!
) else (
    echo Error en push. Codigo: %ERRORLEVEL%
)
pause
