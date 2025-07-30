# TechStore - Tienda Online

Una moderna tienda online de tecnología construida con Next.js 15, TypeScript y Tailwind CSS, con integración completa de pagos via MercadoPago.

## Características

✨ **Catálogo de productos** - Muestra productos con imágenes, precios y descripciones  
🛒 **Carrito de compras** - Gestión completa del carrito con persistencia local  
🔍 **Filtros por categoría** - Filtra productos por diferentes categorías  
� **Pagos con MercadoPago** - Integración completa con sistema de pagos  
🔐 **Autenticación** - Sistema de login con NextAuth.js  
📊 **Panel Admin** - Gestión de productos, pedidos y usuarios  
🧪 **Modo de prueba** - Entorno seguro para testing de pagos  
�📱 **Diseño responsivo** - Optimizado para móviles, tablets y desktop  
⚡ **Performance** - Construido con Next.js 15 y optimizaciones modernas  

## Tecnologías utilizadas

- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático para mejor desarrollo
- **Tailwind CSS** - Framework de CSS para estilos modernos
- **Zustand** - Gestión de estado ligera y eficiente
- **NextAuth.js** - Autenticación moderna y segura
- **MercadoPago SDK** - Integración de pagos
- **Google Sheets API** - Base de datos en la nube
- **Lucide React** - Iconos modernos y ligeros

## Estructura del proyecto

```
src/
├── app/                 # Páginas y rutas (App Router)
│   ├── cart/           # Página del carrito
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página de inicio
├── components/         # Componentes reutilizables
│   ├── Header.tsx      # Navegación principal
│   ├── ProductCard.tsx # Tarjeta de producto
│   └── CategoryFilter.tsx # Filtros de categoría
├── data/              # Datos mock
│   └── products.ts    # Productos de ejemplo
├── lib/               # Utilidades
│   └── store.ts       # Store de Zustand
└── types/            # Tipos de TypeScript
    └── index.ts      # Interfaces principales
```

## Instalación y uso

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo>
   cd tienda
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```
3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Configura las siguientes variables:
   ```env
   # MercadoPago
   MERCADOPAGO_ACCESS_TOKEN=tu_access_token
   MERCADOPAGO_MODE=test  # 'test' para desarrollo, 'live' para producción
   
   # NextAuth
   NEXTAUTH_SECRET=tu_secret_key
   NEXTAUTH_URL=http://localhost:3000
   
   # Google Sheets (opcional)
   GOOGLE_SHEETS_PRIVATE_KEY=tu_private_key
   GOOGLE_SHEETS_CLIENT_EMAIL=tu_service_account_email
   GOOGLE_SPREADSHEET_ID=tu_spreadsheet_id
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🚀 Deployment a Producción

### Estado Actual: **Desarrollo/Testing**
- ✅ Sistema completo implementado
- ✅ Modo de prueba funcionando
- ⚠️ Requiere configuración para producción

### Para ir a Producción:

1. **Verificar configuración actual:**
   ```bash
   curl http://localhost:3000/api/debug/production-readiness
   ```

2. **Seguir guía completa:**
   - 📖 Ver `PRODUCTION-DEPLOY.md` para instrucciones detalladas
   - 📋 Usar `.env.production.example` como plantilla

3. **Configurar credenciales reales:**
   - MercadoPago: Obtener credenciales de producción
   - Google OAuth: Configurar para dominio real
   - Variables de entorno: Usar valores de producción

4. **Deploy:**
   ```bash
   vercel --prod
   # o tu plataforma preferida
   ```

## 🧪 Testing de Pagos

El sistema incluye un entorno completo de testing para MercadoPago:

### Modo de Desarrollo
- **Automático**: En desarrollo, el sistema usa automáticamente el modo de prueba
- **Indicadores visuales**: El checkout muestra claramente que está en modo de prueba
- **Tarjetas de prueba**: Acceso directo a tarjetas de prueba desde el checkout

### Acceso a Tarjetas de Prueba
1. **En el Checkout**: Expande la sección "💳 Tarjetas de Prueba"
2. **En el Admin**: Ve a "Pagos de Prueba" para ver todas las tarjetas disponibles
3. **API**: `GET /api/mercadopago/test-cards` para obtener datos programáticamente

### Resultados de Prueba
- **✅ Pagos Aprobados**: Usar tarjetas con titular "APRO"
- **❌ Pagos Rechazados**: Usar tarjetas con titular "OTHE" 
- **⏳ Pagos Pendientes**: Usar tarjetas con titular "CONT"

### Crear Usuarios de Prueba
```bash
POST /api/mercadopago/create-test-users
```
Crea automáticamente usuarios vendedor y comprador para testing completo.

## Scripts disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter de código

## 🚀 Características Implementadas

- ✅ **Autenticación de usuarios** - NextAuth.js con Google Provider
- ✅ **Integración de pagos** - MercadoPago con modo de prueba
- ✅ **Gestión de pedidos** - Sistema completo con Google Sheets
- ✅ **Panel de administración** - CRUD completo para productos, usuarios y pedidos
- ✅ **Sistema de categorías** - Gestión dinámica de categorías
- ✅ **Carrito persistente** - Estado global con Zustand
- ✅ **Recuperación de pagos** - Sistema automático de recuperación en fallos
- ✅ **Optimización de API** - Cache y rate limiting para Google Sheets

## 🔧 API Endpoints

### Públicos
- `GET /api/products` - Lista de productos
- `GET /api/categories` - Lista de categorías  
- `POST /api/orders` - Crear pedido

### Pagos
- `POST /api/mercadopago/preference` - Crear preferencia de pago
- `GET /api/mercadopago/test-cards` - Tarjetas de prueba
- `POST /api/mercadopago/create-test-users` - Crear usuarios de prueba

### Admin (requiere autenticación)
- `GET /api/admin/products` - Gestión de productos
- `GET /api/admin/users` - Gestión de usuarios
- `POST /api/admin/setup` - Configuración inicial

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
