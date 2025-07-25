# Panel de Administración - TechStore

## 🚀 Panel de Administración Mejorado

El panel de administración ha sido completamente renovado con funcionalidades avanzadas de gestión y persistencia de datos. Ahora incluye un sistema completo de CRUD (Crear, Leer, Actualizar, Eliminar) para todos los recursos de la tienda.

## 🔐 Acceso al Panel

### URLs de Acceso
- **Panel Principal**: `/admin`
- **Requiere autenticación**: Los usuarios deben estar logueados
- **Solo administradores**: Solo emails en la lista de administradores pueden acceder

### Administradores Autorizados
Por defecto, estos emails tienen acceso de administrador:
```typescript
const ADMIN_EMAILS = ['admin@techstore.com', 'dquintero@example.com'];
```

Para agregar más administradores, edita el archivo `/src/app/admin/page.tsx` y agrega emails a esta lista.

## 📊 Funcionalidades del Dashboard

### 1. Dashboard Principal
- **Estadísticas en tiempo real**: Productos, pedidos, usuarios, ingresos
- **Alertas automáticas**: Stock bajo, nuevos pedidos
- **Productos más vendidos**: Basado en datos reales de ventas
- **Estado de pedidos**: Resumen visual de todos los estados

### 2. Gestión de Productos
#### Funcionalidades Completas:
- ✅ **Crear productos**: Modal completo con validación
- ✅ **Editar productos**: Modificar toda la información
- ✅ **Eliminar productos**: Con confirmación de seguridad
- ✅ **Búsqueda avanzada**: Por nombre, descripción, SKU
- ✅ **Filtros por categoría**: Smartphones, laptops, tablets, etc.
- ✅ **Gestión de stock**: Alertas automáticas de stock bajo
- ✅ **Múltiples imágenes**: Soporte para varias imágenes por producto
- ✅ **Estados**: Activar/desactivar productos

#### Campos de Producto:
- Información básica (nombre, descripción, SKU)
- Precios (normal y promocional)
- Categoría y subcategoría
- Stock y estado
- Marca y etiquetas
- Múltiples imágenes

### 3. Gestión de Pedidos
#### Funcionalidades:
- ✅ **Ver todos los pedidos**: Tabla completa con filtros
- ✅ **Detalles del pedido**: Modal con información completa
- ✅ **Cambiar estado**: Pendiente → Procesando → Enviado → Entregado
- ✅ **Búsqueda**: Por ID, cliente o email
- ✅ **Filtros por estado**: Todos los estados de pedido
- ✅ **Historial**: Línea de tiempo del pedido
- ✅ **Información del cliente**: Datos de contacto y envío

#### Estados de Pedido:
- **Pendiente**: Pedido recibido, esperando procesamiento
- **Procesando**: En preparación
- **Enviado**: En camino al cliente
- **Entregado**: Completado exitosamente
- **Cancelado**: Pedido cancelado

### 4. Gestión de Usuarios
#### Funcionalidades:
- ✅ **Lista completa de usuarios**: Con información detallada
- ✅ **Activar/desactivar usuarios**: Control de acceso
- ✅ **Estadísticas por usuario**: Pedidos realizados, dinero gastado
- ✅ **Filtros por rol**: Administradores vs usuarios regulares
- ✅ **Búsqueda**: Por nombre o email
- ✅ **Métricas**: Ingresos totales, usuarios activos

### 5. Configuración de la Tienda
#### Configuraciones Disponibles:
- **Información general**: Nombre, email, descripción
- **Moneda**: Euro, Dólar, Libra
- **Métodos de pago**: PayPal, Stripe, Transferencia
- **Envíos**: Costos, envío gratis, impuestos
- **Notificaciones**: Nuevos pedidos, stock bajo, nuevos usuarios

## 🛠 Arquitectura Técnica

### Store de Administración (Zustand)
```typescript
// Archivo: /src/lib/admin-store.ts
- Gestión completa del estado
- Persistencia automática en localStorage
- Funciones CRUD para todos los recursos
- Cálculo automático de estadísticas
```

### Componentes Principales
```
/src/components/admin/
├── ProductModal.tsx    # Modal para crear/editar productos
├── OrderModal.tsx      # Modal para ver detalles de pedidos
└── [Futuros componentes admin]
```

### Modales Interactivos
- **ProductModal**: Formulario completo con validación
- **OrderModal**: Vista detallada con gestión de estado

## 📱 Características de UX/UI

### Diseño Responsive
- **Desktop**: Sidebar + contenido principal
- **Mobile**: Diseño adaptado (en desarrollo)
- **Componentes**: Cards, tablas, modales, formularios

### Interacciones
- **Notificaciones**: Feedback inmediato para todas las acciones
- **Confirmaciones**: Diálogos de confirmación para acciones destructivas
- **Estados de carga**: Indicadores visuales
- **Validación**: Formularios con validación en tiempo real

### Filtros y Búsqueda
- **Búsqueda en tiempo real**: Sin recargar página
- **Filtros múltiples**: Combinación de criterios
- **Contadores**: Resultados filtrados vs totales

## 🔄 Persistencia de Datos

### Sistema Actual
- **Zustand + localStorage**: Persistencia local automática
- **Datos iniciales**: Productos y usuarios de ejemplo
- **Sincronización**: Automática entre pestañas

### Datos Incluidos
- **4 productos de ejemplo**: iPhone, MacBook, iPad, AirPods
- **3 pedidos de prueba**: Con diferentes estados
- **3 usuarios de ejemplo**: Con historial de compras
- **Configuración por defecto**: Lista para usar

## 📈 Métricas y Estadísticas

### Dashboard Analytics
- **Productos**: Total, stock bajo, por categoría
- **Pedidos**: Hoy, por estado, ingresos
- **Usuarios**: Total, activos, administradores
- **Ventas**: Productos más vendidos, ingresos mensuales

### Alertas Automáticas
- **Stock bajo**: Productos con menos de 20 unidades
- **Nuevos pedidos**: Notificaciones en tiempo real
- **Estados críticos**: Productos agotados

## 🚀 Próximas Funcionalidades

### En Desarrollo
- [ ] **Reportes avanzados**: Gráficos de ventas
- [ ] **Exportación de datos**: CSV, PDF
- [ ] **Gestión de categorías**: CRUD de categorías
- [ ] **Cupones y descuentos**: Sistema promocional
- [ ] **Inventario avanzado**: Movimientos de stock

### Mejoras Técnicas
- [ ] **Base de datos real**: Migración a PostgreSQL/MySQL
- [ ] **API REST**: Endpoints para gestión
- [ ] **Roles granulares**: Permisos específicos
- [ ] **Audit logs**: Registro de cambios
- [ ] **Backup automático**: Respaldo de datos

## 🔧 Configuración de Desarrollo

### Archivos Principales
```
src/
├── app/admin/page.tsx              # Página principal del admin
├── lib/admin-store.ts              # Store de administración
├── components/admin/
│   ├── ProductModal.tsx            # Modal de productos
│   └── OrderModal.tsx              # Modal de pedidos
└── types/index.ts                  # Tipos TypeScript (actualizar)
```

### Comandos Útiles
```bash
# Ejecutar en desarrollo
npm run dev

# Acceder al admin
http://localhost:3000/admin

# Limpiar localStorage (reiniciar datos)
localStorage.clear()
```

## 🔒 Seguridad

### Medidas Implementadas
- **Verificación de email**: Solo administradores autorizados
- **Protección de rutas**: Redirección automática
- **Confirmaciones**: Para acciones destructivas
- **Validación**: En formularios y entrada de datos

### Recomendaciones
- Cambiar emails de administrador antes de producción
- Implementar autenticación por roles en el backend
- Usar HTTPS en producción
- Validar datos en el servidor

## 📞 Soporte

Para agregar más funcionalidades o resolver problemas:

1. **Agregar administradores**: Editar `ADMIN_EMAILS` en `/src/app/admin/page.tsx`
2. **Personalizar datos iniciales**: Modificar `/src/lib/admin-store.ts`
3. **Nuevas características**: Usar los patrones establecidos
4. **Problemas de persistencia**: Verificar zustand y localStorage

---

El panel de administración está completamente funcional y listo para gestionar una tienda online completa. ¡Explora todas las funcionalidades y personalízalo según tus necesidades!
