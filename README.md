# TechStore - Tienda Online

Una moderna tienda online de tecnología construida con Next.js 15, TypeScript y Tailwind CSS.

## Características

✨ **Catálogo de productos** - Muestra productos con imágenes, precios y descripciones  
🛒 **Carrito de compras** - Gestión completa del carrito con persistencia local  
🔍 **Filtros por categoría** - Filtra productos por diferentes categorías  
📱 **Diseño responsivo** - Optimizado para móviles, tablets y desktop  
⚡ **Performance** - Construido con Next.js 15 y optimizaciones modernas  

## Tecnologías utilizadas

- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático para mejor desarrollo
- **Tailwind CSS** - Framework de CSS para estilos modernos
- **Zustand** - Gestión de estado ligera y eficiente
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

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Scripts disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter de código

## Próximas features

Las siguientes características pueden ser añadidas gradualmente:

- 🔐 **Autenticación de usuarios**
- 💳 **Integración de pagos**
- 📦 **Gestión de pedidos**
- ⭐ **Sistema de reviews**
- 🔍 **Búsqueda avanzada**
- 📧 **Notificaciones por email**
- 🏪 **Panel de administración**

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
