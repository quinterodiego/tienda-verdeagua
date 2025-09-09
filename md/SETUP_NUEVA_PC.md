# 🚀 Configuración en Nueva PC - Verde Agua

## 📋 Guía Rápida para Clonar y Configurar

### **Paso 1: Clonar el Repositorio**
```bash
git clone https://github.com/quinterodiego/tienda-verdeagua.git
cd tienda-verdeagua
```

### **Paso 2: Instalar Dependencias**
```bash
npm install
```

### **Paso 3: Configurar Variables de Entorno**

#### **Opción A: Script Automático (Recomendado)**
```bash
node scripts/setup-new-pc.js
```

#### **Opción B: Manual**
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus credenciales
code .env.local  # o tu editor preferido
```

### **Paso 4: Iniciar Desarrollo**
```bash
npm run dev
```

---

## 🔐 Variables de Entorno Necesarias

### **🟢 MÍNIMAS (Para ver la tienda)**
```bash
NEXTAUTH_SECRET=cualquier-string-de-32-caracteres
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### **🟡 BÁSICAS (Para funcionalidad completa)**
Añadir a las mínimas:
```bash
# MercadoPago (modo sandbox para pruebas)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxx
MERCADOPAGO_MODE=sandbox

# Emails (para notificaciones)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=tu-email@gmail.com
EMAIL_ADMIN=tu-email@gmail.com
```

### **🔴 COMPLETAS (Para producción)**
Todas las anteriores más:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Google Sheets
GOOGLE_SHEET_ID=xxx
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----"
# ... (ver .env.example para todas)
```

---

## 🔧 Métodos de Configuración

### **Método 1: Para Desarrolladores del Proyecto**
```bash
# 1. Pedir credenciales al dueño del proyecto
# 2. Copiar .env.local completo
# 3. Pegar en nueva PC
```

### **Método 2: Para Colaboradores Nuevos**
```bash
# 1. Usar .env.example como base
# 2. Crear tus propias credenciales de prueba
# 3. Configurar servicios en modo sandbox/test
```

### **Método 3: Para Demo/Testing**
```bash
# 1. Solo variables mínimas
# 2. Funcionalidad limitada pero visible
# 3. Perfecto para mostrar el proyecto
```

---

## 📁 Estructura de Archivos de Configuración

```
tienda-verdeagua/
├── .env.example          # ✅ Template público (subido a Git)
├── .env.local           # ❌ Credenciales reales (NO subir a Git)
├── .env.development     # ❌ Opcional (NO subir a Git)
├── .env.production      # ❌ Usado por Vercel (NO subir a Git)
└── .gitignore           # ✅ Ignora archivos .env*
```

---

## 🔒 Seguridad y Mejores Prácticas

### **✅ SÍ hacer:**
- Usar `.env.example` como template
- Mantener `.env.local` solo en tu PC
- Usar credenciales de TEST/SANDBOX para desarrollo
- Rotar credenciales periódicamente
- Usar diferentes credenciales para producción

### **❌ NO hacer:**
- Subir `.env.local` a Git
- Compartir credenciales por chat/email
- Usar credenciales de producción en desarrollo
- Hardcodear credenciales en el código
- Commitear archivos con secretos

---

## 🆘 Troubleshooting

### **Problema: "Missing environment variables"**
```bash
# Solución: Verificar que .env.local existe
ls -la .env*
cat .env.local
```

### **Problema: "Authentication failed"**
```bash
# Solución: Verificar credenciales específicas
# Para MercadoPago: Modo sandbox vs production
# Para Gmail: App Password vs contraseña normal
```

### **Problema: "Cannot connect to database"**
```bash
# Solución: Verificar Google Sheets credentials
# GOOGLE_PRIVATE_KEY debe estar entre comillas
# Service Account debe tener permisos
```

### **Problema: "Emails not sending"**
```bash
# Solución: Verificar configuración de Gmail
# 1. Verificación 2FA activada
# 2. App Password generada
# 3. EMAIL_USER y EMAIL_PASSWORD correctos
```

---

## 📞 Obtener Credenciales

### **MercadoPago**
1. Crear cuenta en [mercadopago.com](https://mercadopago.com)
2. Ir a **Desarrolladores** → **Credenciales**
3. Usar credenciales de **TEST** para desarrollo

### **Google OAuth**
1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto → **APIs & Services** → **Credentials**
3. Crear **OAuth 2.0 Client ID**

### **Cloudinary**
1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Dashboard → **API Keys**

### **Gmail App Password**
1. Activar verificación 2FA en Gmail
2. **Configuración** → **Seguridad** → **Contraseñas de aplicaciones**
3. Generar nueva para "Aplicación personalizada"

---

## 🚀 Deploy en Nueva PC

Una vez configurado localmente:

1. **Desarrollo**: `npm run dev`
2. **Build**: `npm run build`
3. **Producción**: Deploy en Vercel con variables de entorno separadas

---

**💡 Tip**: Guarda tus credenciales de desarrollo en un gestor de contraseñas seguro para facilitar futuras configuraciones.
