# 🌳 Estrategia de Ramas para Tienda Verde Agua

## 📋 Estructura de Ramas Propuesta:

### 🎯 **main** (Producción)
- Código estable y probado
- Deploy automático a Vercel
- Solo merge desde `develop` después de testing

### 🔧 **develop** (Desarrollo Principal)
- Rama principal de desarrollo
- Integración de todas las features
- Testing antes de merge a main

### ⚡ **feature/*** (Features Individuales)
- `feature/admin-improvements`
- `feature/checkout-enhancements`
- `feature/email-system`
- `feature/payment-integration`

### 🐛 **hotfix/*** (Correcciones Urgentes)
- Para bugs críticos en producción
- Merge directo a main y develop

## 🚀 Flujo de Trabajo:

```
main ← develop ← feature/nueva-funcionalidad
  ↑      ↑
  └──────┴─── hotfix/bug-critico
```

## 📝 Comandos para Implementar:

```bash
# Crear rama develop
git checkout -b develop

# Crear feature branch
git checkout -b feature/fix-suspense-errors

# Merge feature a develop
git checkout develop
git merge feature/fix-suspense-errors

# Merge develop a main (después de testing)
git checkout main
git merge develop
```

## ✅ Beneficios:

1. **Seguridad**: main siempre estable
2. **Organización**: Features separadas
3. **Testing**: develop como staging
4. **Rollback**: Fácil revertir cambios
5. **Colaboración**: Múltiples developers

## 🎯 Siguiente Paso:
Crear rama `develop` y `feature/fix-suspense-errors` para corregir el error de Vercel.
