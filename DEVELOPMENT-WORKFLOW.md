# Workflow de Desarrollo - Tienda Verde Agua

## Estructura de Ramas

### `main` - Rama de Producción
- **Propósito**: Código estable y listo para producción
- **Deploy**: Automático a Vercel en cada push
- **Protección**: Solo recibe merges desde `dev` via Pull Request
- **Testing**: Todo debe estar probado antes de llegar aquí

### `dev` - Rama de Desarrollo
- **Propósito**: Integración de nuevas features y testing
- **Deploy**: Puede tener preview deploy en Vercel (opcional)
- **Workflow**: Base para todas las features nuevas
- **Testing**: Lugar para probar integración de múltiples features

## Workflow Diario

### 1. Para Desarrollar una Nueva Feature

```bash
# Asegurate de estar en dev y actualizada
git checkout dev
git pull origin dev

# Crea una rama para tu feature
git checkout -b feature/nombre-de-la-feature

# Desarrolla tu feature...
# Haz commits frecuentes
git add .
git commit -m "feat: descripción de los cambios"

# Pushea tu rama
git push -u origin feature/nombre-de-la-feature
```

### 2. Para Integrar una Feature Terminada

```bash
# Vuelve a dev
git checkout dev

# Asegurate que dev esté actualizada
git pull origin dev

# Mergea tu feature
git merge feature/nombre-de-la-feature

# Pushea dev actualizada
git push origin dev

# Elimina la rama feature (opcional)
git branch -d feature/nombre-de-la-feature
git push origin --delete feature/nombre-de-la-feature
```

### 3. Para Hacer Release a Producción

```bash
# Asegurate que dev esté lista
git checkout dev
git pull origin dev

# Cambia a main
git checkout main
git pull origin main

# Mergea dev a main
git merge dev

# Pushea a main (esto triggerea el deploy)
git push origin main

# Vuelve a dev para seguir desarrollando
git checkout dev
```

## Convenciones de Commits

### Formato:
```
tipo: descripción breve

Descripción más detallada si es necesario
```

### Tipos de Commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan la lógica)
- `refactor:` Refactoring de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

### Ejemplos:
```bash
git commit -m "feat: add category management to admin panel"
git commit -m "fix: resolve checkout payment validation"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify product filtering logic"
```

## Comandos Útiles

### Verificar en qué rama estás:
```bash
git branch
```

### Ver el estado actual:
```bash
git status
```

### Ver historial de commits:
```bash
git log --oneline
```

### Cambiar de rama:
```bash
git checkout nombre-rama
```

### Sincronizar con el remoto:
```bash
git fetch origin
git pull origin nombre-rama
```

## Scripts de Git (ya configurados)

Tenés estos scripts disponibles para facilitar el trabajo:

### `git-push-fix.ps1`
```powershell
# Para pushear con el fix del GIT_CONFIG_NOSYSTEM
.\git-push-fix.ps1
```

## Estrategia de Deploy

- **Desarrollo**: Trabaja en `dev` o feature branches
- **Testing**: Prueba en `dev` antes de mergear
- **Producción**: Solo `main` se deploya automáticamente a Vercel
- **Hotfixes**: Si hay un bug crítico en producción:
  1. Crea un hotfix desde `main`
  2. Mergea el hotfix a `main` Y `dev`

## Buenas Prácticas

1. **Nunca trabajes directamente en `main`**
2. **Siempre pull antes de empezar a trabajar**
3. **Commits pequeños y frecuentes**
4. **Mensajes de commit descriptivos**
5. **Testa tu código antes de mergear a `dev`**
6. **Mantén `dev` siempre en estado deployable**

---

¡Este workflow te va a ayudar a mantener el código organizado y deployments seguros! 🚀
