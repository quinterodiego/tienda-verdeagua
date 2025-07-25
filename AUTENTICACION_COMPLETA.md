# 🔐 Sistema de Autenticación - TechStore

Documentación completa del sistema de autenticación implementado en TechStore.

## 📋 Resumen

TechStore incluye un sistema de autenticación robusto y moderno que soporta:
- **Google OAuth** para inicio de sesión rápido
- **Email/Contraseña** para usuarios que prefieren cuentas tradicionales
- **Registro de nuevos usuarios** con validación completa
- **Sesiones persistentes** que se mantienen entre recargas
- **Protección de rutas** automática para páginas privadas

## 🛠️ Tecnologías Utilizadas

- **NextAuth.js** - Biblioteca de autenticación para Next.js
- **Google OAuth 2.0** - Proveedor de identidad de Google
- **bcryptjs** - Hash seguro de contraseñas
- **JWT** - Tokens de sesión seguros
- **TypeScript** - Tipado estricto para mayor seguridad

## ⚙️ Configuración Paso a Paso

### 1. **Variables de Entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=un-secreto-muy-largo-y-seguro-para-produccion

# Google OAuth Credentials
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### 2. **Configurar Google OAuth Console**

1. **Accede a Google Cloud Console**
   - Ve a [console.cloud.google.com](https://console.cloud.google.com/)
   - Inicia sesión con tu cuenta de Google

2. **Crear o Seleccionar Proyecto**
   - Crea un nuevo proyecto o selecciona uno existente
   - Asegúrate de que el proyecto esté activo

3. **Habilitar APIs Necesarias**
   - Ve a "APIs & Services" > "Library"
   - Busca y habilita:
     - **Google+ API**
     - **People API**

4. **Configurar OAuth Consent Screen**
   - Ve a "APIs & Services" > "OAuth consent screen"
   - Selecciona "External" (para testing)
   - Completa la información básica:
     - **App name**: TechStore
     - **User support email**: tu email
     - **Developer contact**: tu email
   - Guarda y continúa

5. **Crear OAuth 2.0 Client ID**
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "OAuth 2.0 Client ID"
   - Selecciona "Web application"
   - Configura:
     - **Name**: TechStore Web Client
     - **Authorized JavaScript origins**: `http://localhost:3000`
     - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

6. **Obtener Credenciales**
   - Copia el **Client ID** y **Client Secret**
   - Pégalos en tu archivo `.env.local`

### 3. **Configuración para Producción**

Para desplegar en producción, actualiza las URLs:

```env
# Producción
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=un-secreto-diferente-y-super-seguro-para-produccion

# En Google Console, agrega también:
# Authorized JavaScript origins: https://tu-dominio.com
# Authorized redirect URIs: https://tu-dominio.com/api/auth/callback/google
```

## 🏗️ Arquitectura del Sistema

### **Archivos Principales**

```
src/
├── app/api/auth/
│   ├── [...nextauth]/route.ts     # Configuración NextAuth
│   └── register/route.ts          # API de registro
├── lib/
│   ├── auth.ts                    # Configuración de autenticación
│   └── users.ts                   # Gestión de usuarios local
├── app/auth/
│   ├── signin/page.tsx            # Página de login/registro
│   └── error/page.tsx             # Página de errores de auth
└── components/
    └── AuthProvider.tsx           # Proveedor de contexto
```

### **Flujo de Autenticación**

#### **Google OAuth**
1. Usuario hace clic en "Continuar con Google"
2. Redirección a Google OAuth
3. Usuario autoriza la aplicación
4. Google redirecciona con código de autorización
5. NextAuth intercambia código por tokens
6. Se crea sesión y se redirecciona al usuario

#### **Email/Contraseña**
1. Usuario ingresa credenciales
2. Validación en frontend (formato, longitud, etc.)
3. Envío a API de registro o login
4. Verificación en backend (hash, base de datos)
5. Creación de sesión JWT
6. Redirección al usuario autenticado

### **Gestión de Usuarios**

Actualmente usa un sistema de archivos JSON:

```typescript
// Estructura de usuario
interface User {
  id: string;
  email: string;
  password: string; // hasheada con bcrypt
  name: string;
  image?: string;
  createdAt: string;
}
```

## 🔒 Seguridad Implementada

### **Protección de Contraseñas**
- **Hashing**: bcryptjs con factor de costo 12
- **Validación**: Mínimo 6 caracteres, formato de email válido
- **No almacenamiento**: Las contraseñas nunca se almacenan en texto plano

### **Protección de Sesiones**
- **JWT**: Tokens firmados con secret seguro
- **HTTPOnly**: Cookies no accesibles desde JavaScript
- **Secure**: HTTPS en producción
- **SameSite**: Protección CSRF

### **Validación de Entrada**
- **Frontend**: Validación en tiempo real con feedback visual
- **Backend**: Validación estricta en todas las APIs
- **Sanitización**: Limpieza de datos de entrada

### **Protección de Rutas**
```typescript
// Middleware automático para rutas protegidas
useEffect(() => {
  if (status === 'loading') return;
  if (!session) router.push('/auth/signin?callbackUrl=/perfil');
}, [session, status, router]);
```

## 🧪 Pruebas del Sistema

### **Casos de Prueba Recomendados**

1. **Login con Google**
   - ✅ Flujo completo exitoso
   - ✅ Cancelación por parte del usuario
   - ✅ Error de red/servidor

2. **Registro con Email**
   - ✅ Registro exitoso con datos válidos
   - ✅ Email ya existente
   - ✅ Contraseña muy corta
   - ✅ Formato de email inválido
   - ✅ Campos requeridos vacíos

3. **Login con Email**
   - ✅ Login exitoso
   - ✅ Email no registrado
   - ✅ Contraseña incorrecta
   - ✅ Campos vacíos

4. **Protección de Rutas**
   - ✅ Acceso autorizado a rutas protegidas
   - ✅ Redirección automática si no está autenticado
   - ✅ Preservación de URL de destino después del login

5. **Sesiones**
   - ✅ Persistencia entre recargas
   - ✅ Logout exitoso
   - ✅ Expiración automática de sesión

## 🚀 Próximas Mejoras

### **Funcionalidades Planeadas**
- [ ] **Verificación de email** obligatoria para nuevos usuarios
- [ ] **Recuperación de contraseña** vía email
- [ ] **Autenticación de dos factores (2FA)**
- [ ] **Más proveedores OAuth** (GitHub, Microsoft, Facebook)
- [ ] **Roles y permisos** de usuario

### **Mejoras Técnicas**
- [ ] **Base de datos real** (PostgreSQL/MySQL con Prisma)
- [ ] **Rate limiting** para prevenir ataques de fuerza bruta
- [ ] **Logging de seguridad** para auditoría
- [ ] **Notificaciones de seguridad** (nuevos dispositivos, etc.)
- [ ] **API Keys** para desarrolladores

## 🐛 Solución de Problemas

### **Errores Comunes**

#### **"Configuration error"**
- ✅ Verifica que `NEXTAUTH_SECRET` esté configurado
- ✅ Asegúrate de que las URLs coincidan exactamente

#### **"Google OAuth error"**
- ✅ Verifica Client ID y Client Secret
- ✅ Confirma que las URLs de redirección sean correctas
- ✅ Asegúrate de que las APIs de Google estén habilitadas

#### **"User creation failed"**
- ✅ Verifica permisos de escritura en la carpeta `data/`
- ✅ Confirma que bcryptjs esté instalado correctamente

#### **"Session not found"**
- ✅ Limpia las cookies del navegador
- ✅ Verifica que `NEXTAUTH_URL` sea correcto
- ✅ Reinicia el servidor de desarrollo

### **Debugging**

Para debuggear problemas de autenticación:

```typescript
// En auth.ts, agrega:
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ... resto de la configuración
}
```

## 📞 Soporte

Si encuentras problemas:

1. **Revisa la documentación** de NextAuth.js
2. **Verifica las variables de entorno** y configuración
3. **Consulta los logs** del servidor y navegador
4. **Busca en GitHub Issues** de NextAuth.js
5. **Abre un issue** en el repositorio del proyecto

---

**Documentación actualizada** - Sistema de autenticación robusto y seguro para TechStore 🔐
