# 🛒 TechStore - Tienda Online Moderna

Una tienda online moderna construida con **Next.js 15**, **TypeScript** y **Tailwind CSS**, que incluye catálogo de productos, carrito de compras, sistema de favoritos, autenticación completa y mucho más.

## ✨ Características Principales

### 🛍️ **Funcionalidades de Tienda**
- **Catálogo de productos** con filtros avanzados
- **Carrito de compras** persistente
- **Sistema de favoritos** con almacenamiento local
- **Página de producto individual** con galería de imágenes
- **Búsqueda y filtros** por categoría, precio y características
- **Productos relacionados** y recomendaciones
- **Checkout básico** con formulario de compra

### 🔐 **Sistema de Autenticación Completo**
- **Login con Google OAuth** (NextAuth.js)
- **Login con Email/Contraseña** 
- **Registro de nuevos usuarios**
- **Páginas protegidas** (perfil, checkout, pedidos)
- **Sesiones persistentes** y logout seguro
- **Validación de formularios** con feedback en tiempo real

### 🎨 **UI/UX Moderna**
- **Diseño responsive** (mobile-first)
- **Menú móvil** con drawer/sidebar
- **Notificaciones globales** con diferentes tipos
- **Loading states** y feedback visual
- **Animaciones suaves** CSS
- **Interfaz intuitiva** y accesible

### 🔧 **Tecnologías Utilizadas**

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Autenticación**: NextAuth.js
- **Estado Global**: Zustand
- **Iconos**: Lucide React
- **Validación**: Validación custom + bcryptjs

## 🚀 **Instalación y Configuración**

### 1. **Clonar e Instalar**
```bash
git clone <repository-url>
cd tienda
npm install
```

### 2. **Configurar Variables de Entorno**
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# ========================================
# NEXTAUTH.JS CONFIGURATION
# ========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-super-largo-y-seguro-cambiar-en-produccion

# ========================================
# GOOGLE OAUTH CREDENTIALS
# ========================================
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### 3. **Configurar Google OAuth**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google+ API** y **People API**
4. Configura **OAuth consent screen**
5. Crea **OAuth 2.0 Client ID**
6. Configura las URLs autorizadas:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Copia el **Client ID** y **Client Secret** a tu `.env.local`

### 4. **Ejecutar en Desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📂 **Estructura del Proyecto**

```
src/
├── app/                    # Páginas y rutas (App Router)
│   ├── page.tsx           # Página principal
│   ├── cart/              # Carrito de compras
│   ├── checkout/          # Proceso de compra
│   ├── favoritos/         # Productos favoritos
│   ├── perfil/            # Perfil de usuario
│   ├── producto/[id]/     # Página de producto individual
│   ├── auth/              # Páginas de autenticación
│   └── api/               # API Routes
├── components/            # Componentes reutilizables
│   ├── Header.tsx         # Navegación principal
│   ├── ProductCard.tsx    # Tarjeta de producto
│   ├── SearchFilters.tsx  # Filtros de búsqueda
│   ├── AuthProvider.tsx   # Proveedor de autenticación
│   └── NotificationProvider.tsx # Sistema de notificaciones
├── lib/                   # Utilidades y lógica de negocio
│   ├── store.ts           # Estado global (Zustand)
│   ├── auth.ts            # Configuración NextAuth
│   ├── users.ts           # Gestión de usuarios
│   └── useSearch.ts       # Hook de búsqueda
├── data/                  # Datos mock y configuración
│   └── products.ts        # Catálogo de productos
└── types/                 # Tipos de TypeScript
    └── index.ts           # Definiciones de tipos
```

## 🔄 **Flujos Principales**

### **Autenticación**
1. **Google OAuth**: Un clic para iniciar sesión con Google
2. **Email/Password**: Registro e inicio de sesión tradicional
3. **Sesión persistente**: Se mantiene entre recargas del navegador
4. **Rutas protegidas**: Redirección automática al login si no está autenticado

### **Compras**
1. **Explorar productos** en el catálogo principal
2. **Filtrar y buscar** productos específicos
3. **Ver detalles** en la página individual del producto
4. **Agregar al carrito** y gestionar cantidades
5. **Guardar favoritos** para compras futuras
6. **Proceder al checkout** (requiere autenticación)

## 🎯 **Características Destacadas**

### **Sistema de Notificaciones**
- Notificaciones globales con diferentes tipos (success, error, warning, info)
- Auto-desaparición configurable
- Animaciones suaves de entrada y salida

### **Carrito Inteligente**
- Persistencia en localStorage
- Actualización en tiempo real del contador
- Gestión de cantidades y stock
- Cálculo automático de totales

### **Búsqueda Avanzada**
- Filtros por categoría, rango de precio
- Búsqueda por texto en nombre y descripción
- Combinación de múltiples filtros
- Resultados en tiempo real

### **Responsive Design**
- Mobile-first approach
- Menú hamburguesa en móviles
- Grid adaptativo para productos
- Imágenes optimizadas con Next.js

## 🔮 **Próximas Características**

### **En Desarrollo**
- [ ] Historial de pedidos real
- [ ] Sistema de reviews y calificaciones
- [ ] Panel de administración
- [ ] Integración con pasarelas de pago
- [ ] Sistema de descuentos y cupones

### **Funcionalidades Avanzadas**
- [ ] Modo oscuro
- [ ] Notificaciones push
- [ ] Wishlist compartida
- [ ] Comparador de productos
- [ ] Recomendaciones con IA

### **Mejoras Técnicas**
- [ ] Migración a base de datos real (Prisma + PostgreSQL)
- [ ] API REST completa
- [ ] Tests unitarios y de integración
- [ ] SEO avanzado y metadatos dinámicos
- [ ] PWA (Progressive Web App)

## 🛠️ **Scripts Disponibles**

```bash
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en modo producción
npm run lint         # Verificar código con ESLint
```

## 📝 **Notas Importantes**

### **Desarrollo**
- Los usuarios se almacenan actualmente en un archivo JSON (`data/users.json`)
- Las contraseñas se hashean con bcrypt antes de almacenar
- Las sesiones se manejan completamente con NextAuth.js

### **Producción**
- Cambiar `NEXTAUTH_SECRET` por uno único y seguro
- Configurar variables de entorno en el servidor de producción
- Migrar a una base de datos real para usuarios y pedidos
- Configurar dominios autorizados en Google OAuth

### **Seguridad**
- Todas las contraseñas se hashean con bcrypt
- Las sesiones están protegidas con JWT
- Validación tanto en frontend como backend
- Protección CSRF habilitada por NextAuth.js

## 🤝 **Contribución**

Este proyecto está en desarrollo activo. Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**TechStore** - Una tienda online moderna construida con las mejores tecnologías web 🚀
