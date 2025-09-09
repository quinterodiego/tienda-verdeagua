# 🛠️ Scripts de Git - Tienda Verde Agua

Colección de scripts para facilitar el workflow de Git con las ramas `main` y `dev`.

## 📁 Scripts Disponibles

### `git-push-fix.ps1` - Push Inteligente
Detecta automáticamente la rama actual y hace push evitando problemas de configuración.
```powershell
.\git-push-fix.ps1
```

### `switch-to-dev.ps1` - Cambiar a Desarrollo
Cambia a la rama `dev` y sincroniza con el remoto.
```powershell
.\switch-to-dev.ps1
```

### `switch-to-main.ps1` - Cambiar a Producción
Cambia a la rama `main` y sincroniza con el remoto.
```powershell
.\switch-to-main.ps1
```

### `release-to-main.ps1` - Release a Producción
Mergea `dev` a `main` y despliega a producción.
```powershell
.\release-to-main.ps1
# o con mensaje personalizado:
.\release-to-main.ps1 "Nueva funcionalidad de categorías"
```

## 🔄 Workflow Típico

### 1. Desarrollo Diario
```powershell
# Cambiar a dev
.\switch-to-dev.ps1

# Trabajar en tu código...
# Hacer commits...

# Push de tus cambios
.\git-push-fix.ps1
```

### 2. Release a Producción
```powershell
# Cuando dev esté listo para producción
.\release-to-main.ps1 "Descripción del release"
```

### 3. Volver a Desarrollo
```powershell
# Después del release, volver a dev
.\switch-to-dev.ps1
```

## ⚠️ Notas Importantes

- **Todos los scripts usan `GIT_CONFIG_NOSYSTEM=1`** para evitar el problema de configuración corrupta
- **Los scripts detectan automáticamente** la rama actual
- **`release-to-main.ps1` hace deploy automático** a Vercel
- **Siempre vuelven a `dev`** después de operaciones en `main`

## 🚀 Ejecución Rápida

Para mayor comodidad, podés crear aliases en tu PowerShell profile:

```powershell
# Agregar al profile de PowerShell
Set-Alias -Name "gp" -Value ".\git-push-fix.ps1"
Set-Alias -Name "dev" -Value ".\switch-to-dev.ps1" 
Set-Alias -Name "main" -Value ".\switch-to-main.ps1"
Set-Alias -Name "release" -Value ".\release-to-main.ps1"
```

Luego podés usar:
```powershell
dev      # Cambiar a dev
gp       # Push inteligente
release  # Release a producción
```

---

💡 **Tip**: Estos scripts están diseñados para el workflow específico de este proyecto. ¡Úsalos para mantener el código organizado y los deployments seguros!
