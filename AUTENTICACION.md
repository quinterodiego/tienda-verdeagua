# 🔐 Configuración de Autenticación con Google

## 📋 Resumen
Se ha implementado un sistema completo de autenticación usando NextAuth.js con Google OAuth. Los usuarios pueden:
- Iniciar sesión con su cuenta de Google
- Ver su perfil personalizado
- Acceder a historial de pedidos
- Realizar checkout solo si están autenticados

## 🛠️ Configuración de Google OAuth

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** y **People API**

### 2. Configurar OAuth 2.0

1. Ve a **APIs & Services > Credentials**
2. Clic en **Create Credentials > OAuth 2.0 Client ID**
3. Selecciona **Web application**
4. Configura las URLs:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

### 3. Obtener Credenciales

1. Copia el **Client ID** y **Client Secret**
2. Actualiza el archivo `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-super-largo-y-seguro-para-jwt
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

## 🚀 Features Implementadas

### ✅ Autenticación
- **Login con Google OAuth**
- **Logout seguro**
- **Sesiones persistentes**
- **Protección de rutas**

### ✅ Páginas Creadas
- `/auth/signin` - Página de inicio de sesión
- `/auth/error` - Manejo de errores de auth
- `/perfil` - Perfil de usuario
- `/mis-pedidos` - Historial de pedidos

### ✅ Integración en Header
- **Avatar de usuario** cuando está logueado
- **Menú desplegable** con opciones
- **Botón de login** cuando no está autenticado
- **Menú móvil** con opciones de auth

### ✅ Protección de Checkout
- Solo usuarios autenticados pueden comprar
- **Pre-llenado** de datos del usuario
- **Redirección** automática al login si no está autenticado

## 🎯 Uso

### Para Desarrolladores Sin Google OAuth
1. Deja las variables de Google vacías en `.env.local`
2. La app funcionará, pero el botón de Google no funcionará
3. Se puede simular login modificando el código temporalmente

### Para Producción
1. Configura un dominio real en Google Cloud Console
2. Actualiza `NEXTAUTH_URL` con tu dominio
3. Agrega las URLs de producción en Google OAuth settings

## 🔧 Archivos Modificados/Creados

### Nuevos Archivos:
- `src/lib/auth.ts` - Configuración de NextAuth
- `src/app/api/auth/[...nextauth]/route.ts` - API routes
- `src/components/AuthProvider.tsx` - Provider de sesión
- `src/app/auth/signin/page.tsx` - Página de login
- `src/app/auth/error/page.tsx` - Página de errores
- `src/app/perfil/page.tsx` - Perfil de usuario
- `src/app/mis-pedidos/page.tsx` - Historial de pedidos
- `.env.local` - Variables de entorno

### Archivos Modificados:
- `src/app/layout.tsx` - AuthProvider agregado
- `src/components/Header.tsx` - Integración de auth
- `src/app/checkout/page.tsx` - Protección de ruta

## 🧪 Pruebas

### Sin Configurar Google OAuth:
- La página de login se muestra
- El botón de Google aparece pero no funciona
- El resto de la app funciona normalmente

### Con Google OAuth Configurado:
- Login funcional con Google
- Redirecciones automáticas
- Datos de usuario mostrados correctamente
- Logout funcional

## 🚀 Siguiente Paso Recomendado
Configura las credenciales de Google OAuth para tener la autenticación completamente funcional.

¿Necesitas ayuda con algún paso específico de la configuración?
