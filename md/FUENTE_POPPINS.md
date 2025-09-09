# Implementación de Poppins en Verde Agua Personalizados

## 📋 Resumen
Poppins está configurada como la fuente predeterminada en toda la aplicación, aplicándose automáticamente a todos los elementos sin necesidad de clases adicionales.

## 🛠️ Configuración Técnica

### 1. Layout Principal (`src/app/layout.tsx`)
```tsx
import { Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});
```

### 2. Tailwind CSS (`tailwind.config.ts`)
```typescript
fontFamily: {
  sans: ['var(--font-poppins)', 'system-ui', '-apple-system', 'sans-serif'],
  poppins: ['var(--font-poppins)', 'sans-serif'],
},
```

### 3. CSS Global (`src/app/globals.css`)
```css
* {
  font-family: var(--font-poppins), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  font-family: var(--font-poppins), system-ui, -apple-system, sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-weight: 400;
}
```

## 🎨 Uso de Pesos de Fuente

### Clases Tailwind Disponibles
- `font-thin` (100) - Texto muy delgado
- `font-extralight` (200) - Texto extra delgado
- `font-light` (300) - Texto delgado
- `font-normal` (400) - **Predeterminado**
- `font-medium` (500) - Texto medio
- `font-semibold` (600) - Semi negrita
- `font-bold` (700) - Negrita
- `font-extrabold` (800) - Extra negrita
- `font-black` (900) - Negro

### Ejemplos de Uso
```tsx
// Título principal
<h1 className="text-4xl font-bold">Título Principal</h1>

// Subtítulo
<h2 className="text-2xl font-semibold">Subtítulo</h2>

// Texto descriptivo
<p className="font-light">Descripción con texto delgado</p>

// Texto normal (automático)
<p>Este texto usa Poppins normal automáticamente</p>

// Énfasis
<span className="font-medium">Texto con énfasis medio</span>
```

## ✅ Beneficios Implementados

### 🚀 Rendimiento
- **Carga optimizada** con `display: "swap"`
- **Fallbacks apropiados** para mejor compatibilidad
- **Variable CSS** para fácil mantenimiento

### 🎯 Consistencia
- **Fuente única** en toda la aplicación
- **Automática** - no requiere clases adicionales
- **Escalable** - fácil de cambiar globalmente

### 📱 Compatibilidad
- **Responsive** en todos los dispositivos
- **Cross-browser** con fallbacks
- **Accesible** con font-display: swap

## 🔧 Mantenimiento

### Para cambiar la fuente globalmente:
1. Actualizar `layout.tsx` con nueva fuente
2. Modificar `tailwind.config.ts`
3. Actualizar `globals.css`

### Para usar fuente específica en un componente:
```tsx
// Forzar Poppins específicamente
<div className="font-poppins">Contenido</div>

// Usar otra fuente temporalmente
<div className="font-mono">Código</div>
```

## 📍 Estado Actual

✅ **Configuración completa** - Poppins aplicada globalmente
✅ **Todos los pesos disponibles** (100-900)
✅ **Optimización de rendimiento** implementada
✅ **Fallbacks configurados** para máxima compatibilidad
✅ **Fácil mantenimiento** con variables CSS

---

**Nota**: No es necesario agregar `font-poppins` a los elementos, ya que Poppins se aplica automáticamente en toda la aplicación.
