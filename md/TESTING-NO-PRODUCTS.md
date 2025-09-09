# 🧪 Script de Prueba - Estado Sin Productos

## Propósito
Probar cómo se ve la tienda cuando no hay productos disponibles en Google Sheets.

## ⚠️ IMPORTANTE
Este script solo debe usarse en desarrollo/testing. NO en producción.

## Métodos de prueba:

### Método 1: Simular API vacía (Temporal)
1. Ve a `src/app/api/products/route.ts`
2. Comenta temporalmente el código de Google Sheets
3. Haz que retorne `{ products: [] }`
4. Prueba en http://localhost:3000

### Método 2: Desactivar productos en Google Sheets
1. Ve a tu Google Sheet de productos
2. Cambia la columna "Activo" de todos los productos a "FALSE"
3. Refresca la página

### Método 3: Usar API de debug (Recomendado)
```bash
# Crear endpoint temporal para testing
curl http://localhost:3000/api/debug/clear-products
```

## Lo que deberías ver:

### ✅ Estado Normal (con productos):
- Hero section con título y descripción
- Filtros de categoría
- Grid de productos
- Botón "Ver Productos"

### ✅ Estado Sin Productos:
- Hero section igual
- Mensaje central: "No hay productos disponibles"
- Ícono de información amarillo
- Botón "Recargar página"
- Botón "Contáctanos"
- NO mostrar filtros ni categorías

## Testing UI:

### Desktop:
- [ ] Mensaje centrado y bien espaciado
- [ ] Botones funcionan correctamente
- [ ] Colores adecuados (amarillo/warning)

### Mobile:
- [ ] Responsive design
- [ ] Texto legible
- [ ] Botones apropiados para touch

## Restaurar después de prueba:
1. Reviertir cambios en API
2. O activar productos en Google Sheets
3. Verificar que funciona normalmente
