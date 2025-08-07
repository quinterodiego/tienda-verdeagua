# 🎨 Sistema de Temas y Personalización

## Resumen de Funcionalidades Implementadas

El sistema de temas y personalización incluye:

### 1. **Gestión de Temas**
- **Modo oscuro/claro/automático**: Detecta preferencias del sistema
- **8 esquemas de colores**: Turquesa, Azul, Púrpura, Rosa, Verde, Naranja, Rojo, Índigo
- **Persistencia**: Las preferencias se guardan en localStorage
- **Transiciones suaves**: Cambios fluidos entre temas

### 2. **Configuración de Diseño**
- **3 tamaños de fuente**: Pequeño, Mediano, Grande
- **Modo compacto**: Reduce espaciado para mostrar más contenido
- **Responsive**: Adaptable a todos los dispositivos

### 3. **Opciones de Accesibilidad**
- **Control de animaciones**: Puede deshabilitarse para usuarios sensibles
- **Mostrar/ocultar precios**: Opción para navegación sin precios
- **Reduce motion**: Respeta preferencias de accesibilidad del sistema

### 4. **Comportamiento Personalizable**
- **Reproducción automática**: Para carruseles de imágenes
- **Efectos de sonido**: Sonidos opcionales en interacciones
- **Feedback visual**: Animaciones y transiciones configurables

## Componentes Nuevos

### 🎯 **ThemeProvider**
- Maneja la aplicación global del tema
- Detecta cambios en preferencias del sistema
- Aplica variables CSS dinámicamente

### ⚙️ **ThemeSettings**
- Modal completo de configuración
- 4 secciones organizadas: Apariencia, Diseño, Accesibilidad, Comportamiento
- Interfaz intuitiva con previsualizaciones

### 🎨 **ThemedProductCard**
- ProductCard adaptado al sistema de temas
- Respeta configuraciones de compacto, animaciones, precios
- Compatible con modo oscuro

### 🔘 **ThemedButton**
- Botón con soporte completo de temas
- 4 variantes: primary, secondary, ghost, danger
- 3 tamaños: sm, md, lg
- Efectos de sonido opcionales

### 📊 **ThemeIndicator**
- Muestra tema actual y esquema de color
- Ideal para mostrar estado en interfaces

## Almacenamiento y Persistencia

### 🏪 **useThemeStore** (Zustand)
```typescript
{
  theme: 'light' | 'dark' | 'auto',
  colorScheme: 'default' | 'blue' | 'purple' | ...,
  fontSize: 'small' | 'medium' | 'large',
  animations: boolean,
  compactMode: boolean,
  showPrices: boolean,
  autoplay: boolean,
  soundEffects: boolean
}
```

## Esquemas de Color Disponibles

1. **Turquesa** (`default`): #68c3b7 (color original)
2. **Azul** (`blue`): #3b82f6
3. **Púrpura** (`purple`): #8b5cf6
4. **Rosa** (`pink`): #ec4899
5. **Verde** (`green`): #10b981
6. **Naranja** (`orange`): #f59e0b
7. **Rojo** (`red`): #ef4444
8. **Índigo** (`indigo`): #6366f1

## Variables CSS Dinámicas

El sistema utiliza variables CSS que se actualizan en tiempo real:

```css
:root {
  --color-primary: [color dinámico]
  --color-secondary: [color dinámico]
  --color-accent: [color dinámico]
  --color-background: [background dinámico]
  --color-surface: [superficie dinámica]
  --color-text: [texto dinámico]
  --color-text-secondary: [texto secundario]
  --color-border: [borde dinámico]
}
```

## Efectos de Sonido

### 🔊 **useSoundEffects**
- **click**: Sonido de click en botones
- **hover**: Sonido suave en hover
- **success**: Sonido de acción exitosa
- **error**: Sonido de error
- **notification**: Sonido de notificación

## Cómo Usar

### 1. **Configuración Básica**
```tsx
import { useThemeStore } from '@/lib/theme-store';

function MyComponent() {
  const { setTheme, setColorScheme } = useThemeStore();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Cambiar a oscuro
    </button>
  );
}
```

### 2. **Componentes Temáticos**
```tsx
import { ThemedButton } from '@/components/ThemedButton';

<ThemedButton
  variant="primary"
  size="lg"
  soundOnClick={true}
  leftIcon={<Icon />}
>
  Mi Botón
</ThemedButton>
```

### 3. **Variables CSS**
```tsx
import { useThemeVariables } from '@/lib/theme-store';

function MyComponent() {
  const themeVars = useThemeVariables();
  
  return (
    <div style={themeVars}>
      {/* El contenido usará las variables del tema */}
    </div>
  );
}
```

## Acceso Rápido

### 🎨 **Botón en Header**
- Icono de paleta en la barra superior
- Acceso directo a todas las configuraciones
- Visible en todas las páginas

### ⌨️ **Atajos de Teclado** (futuro)
- `Ctrl+Shift+T`: Cambiar tema
- `Ctrl+Shift+C`: Cambiar esquema de color

## Optimizaciones Incluidas

### 🚀 **Performance**
- Variables CSS nativas (sin re-renders)
- Persistencia eficiente con Zustand
- Lazy loading de configuraciones

### ♿ **Accesibilidad**
- Respeta `prefers-color-scheme`
- Respeta `prefers-reduced-motion`
- Contraste mejorado en modo oscuro
- Tamaños de fuente configurables

### 📱 **Responsive**
- Configuraciones adaptadas a móviles
- Touch-friendly en dispositivos táctiles
- Layouts compactos para pantallas pequeñas

## Estado de Implementación

✅ **Completado**:
- Sistema completo de temas
- 8 esquemas de colores
- Modo oscuro/claro/automático
- Configuraciones de accesibilidad
- Efectos de sonido
- Persistencia de preferencias
- Componentes temáticos
- Integración con Header

🔄 **Próximas mejoras**:
- Más esquemas de color personalizados
- Atajos de teclado
- Exportar/importar configuraciones
- Temas por temporada/eventos
- Sincronización entre dispositivos

## Compatibilidad

- ✅ **Navegadores**: Chrome, Firefox, Safari, Edge
- ✅ **Dispositivos**: Desktop, Tablet, Mobile
- ✅ **React**: 18+
- ✅ **Next.js**: 13+ (App Router)
- ✅ **TailwindCSS**: 3+
