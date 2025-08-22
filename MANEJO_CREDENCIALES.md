# 🔐 Guía de Manejo de Credenciales - Verde Agua

## 🎯 **Estrategia Recomendada para Tu Caso**

Como tienes el proyecto en tu PC personal, aquí está la mejor forma de manejar las credenciales:

### **1️⃣ SEPARACIÓN CLARA DE ENTORNOS**

```bash
# 🟢 DESARROLLO (tu PC)
EMAIL_USER=verdeagua.desarrollo@gmail.com
MERCADOPAGO_MODE=sandbox
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890

# 🔴 PRODUCCIÓN (Vercel)  
EMAIL_USER=info@verdeagua.ar
MERCADOPAGO_MODE=production
MERCADOPAGO_ACCESS_TOKEN=APP_USR-real-token
```

### **2️⃣ ARCHIVOS Y UBICACIONES**

```
📁 tu-pc-personal/
├── 📄 .env.local              # ← Credenciales de desarrollo
├── 📄 .env.example            # ← Template (se sube a Git)
├── 🔒 credenciales-backup/    # ← Carpeta privada con backups
│   ├── desarrollo.env
│   ├── produccion.env
│   └── notas-credenciales.md
└── 📁 scripts/
    └── manage-credentials.js   # ← Script de gestión
```

---

## 🛠️ **Setup Práctico Paso a Paso**

### **Paso 1: Crear Credenciales de Desarrollo**
```bash
# Crear email específico para desarrollo
Gmail: verdeagua.desarrollo@gmail.com
Propósito: Solo para testing de la tienda

# MercadoPago en modo sandbox
1. Ir a developers.mercadopago.com
2. Crear aplicación "Verde Agua - Desarrollo"
3. Usar credenciales TEST
```

### **Paso 2: Organizar Credenciales**
```bash
# En tu PC, crear carpeta privada
mkdir credenciales-backup
cd credenciales-backup

# Crear archivo para desarrollo
echo "# DESARROLLO - Verde Agua" > desarrollo.env
echo "EMAIL_USER=verdeagua.desarrollo@gmail.com" >> desarrollo.env
echo "MERCADOPAGO_MODE=sandbox" >> desarrollo.env
# ... agregar todas las credenciales

# Crear archivo para producción (cuando las tengas)
echo "# PRODUCCIÓN - Verde Agua" > produccion.env
echo "EMAIL_USER=info@verdeagua.ar" >> produccion.env
echo "MERCADOPAGO_MODE=production" >> produccion.env
```

### **Paso 3: Script de Cambio Rápido**
```bash
# Usar el script creado
node scripts/manage-credentials.js

# O crear script simple
cp credenciales-backup/desarrollo.env .env.local    # Para desarrollo
cp credenciales-backup/produccion.env .env.local    # Para pruebas de producción
```

---

## 🔒 **Seguridad y Backup**

### **Opción A: Gestor de Contraseñas (Recomendado)**
```bash
# En 1Password, Bitwarden, etc.
Título: "Verde Agua - Credenciales Desarrollo"
Contenido: Todas las variables ENV en formato texto
Notas: Fecha de creación, propósito, etc.

Título: "Verde Agua - Credenciales Producción"  
Contenido: Variables de producción
Notas: ⚠️ CRÍTICO - Solo para deploy
```

### **Opción B: Archivo Encriptado**
```bash
# Crear archivo ZIP con contraseña
7z a -p credenciales-verdeagua.7z credenciales-backup/

# O usar herramienta de encriptación
gpg -c credenciales-backup/desarrollo.env
```

### **Opción C: Cloud Privado**
```bash
# OneDrive, Google Drive, Dropbox PRIVADO
/Documentos/Privado/Proyectos/Verde-Agua/
├── credenciales-desarrollo.txt
└── credenciales-produccion.txt
```

---

## 🚀 **Flujo de Trabajo Recomendado**

### **Desarrollo Diario:**
```bash
# 1. Usar siempre credenciales de desarrollo
cp credenciales-backup/desarrollo.env .env.local
npm run dev

# 2. NUNCA commitear .env.local
git status  # Verificar que .env.local no aparece
```

### **Deploy a Producción:**
```bash
# 1. NO cambiar .env.local
# 2. Configurar variables en Vercel Dashboard
# 3. Variables de producción solo en Vercel
```

### **Nueva PC:**
```bash
# 1. Clonar repo
git clone https://github.com/tuusuario/tienda-verdeagua.git

# 2. Copiar credenciales desde backup seguro
cp /ruta-backup/desarrollo.env .env.local

# 3. Listo para desarrollo
npm install && npm run dev
```

---

## 📋 **Checklist de Credenciales por Servicio**

### **🟢 MÍNIMAS (Para funcionar básico)**
- ✅ `NEXTAUTH_SECRET` - Generar aleatorio
- ✅ `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

### **🟡 DESARROLLO COMPLETO**
- ✅ MercadoPago TEST credentials
- ✅ Email de desarrollo + App Password
- ✅ Google OAuth (opcional)

### **🔴 PRODUCCIÓN**
- ✅ MercadoPago PRODUCTION credentials  
- ✅ Email profesional + App Password
- ✅ Google Sheets Service Account
- ✅ Cloudinary para imágenes
- ✅ Todas las URLs de producción

---

## 🆘 **Casos Comunes**

### **Caso 1: "Perdí mis credenciales"**
```bash
# Solución:
1. Revisar gestor de contraseñas
2. Revisar backup en cloud privado
3. Regenerar credenciales en cada servicio
4. Actualizar .env.local y Vercel
```

### **Caso 2: "Quiero colaborar con alguien"**
```bash
# Solución:
1. Crear credenciales de desarrollo separadas
2. Compartir solo credenciales TEST
3. NUNCA compartir credenciales de producción
4. Usar el script de export/import
```

### **Caso 3: "Creo que hay una filtración"**
```bash
# Acción inmediata:
1. Cambiar TODAS las credenciales
2. Revocar tokens en MercadoPago
3. Generar nuevos App Passwords
4. Revisar logs de acceso en servicios
```

### **Caso 4: "Nueva PC/Reinstalación"**
```bash
# Proceso:
1. git clone del repo
2. Restaurar .env.local desde backup
3. Verificar que funciona: npm run dev
4. Si algo falla, usar script de setup
```

---

## 💡 **Tips Adicionales**

### **Para Desarrollo:**
- Usar emails con prefijo `desarrollo.`
- Modo sandbox en todos los servicios de pago
- URLs localhost para testing

### **Para Producción:**  
- Emails profesionales con dominio propio
- Credenciales reales solo en Vercel
- Monitoreo de uso y límites

### **Para Backup:**
- Backup automático semanal
- Verificar acceso a backups mensualmente
- Documentar cambios de credenciales

---

## 🔧 **Comandos Útiles**

```bash
# Verificar variables actuales
node -e "console.log(Object.keys(process.env).filter(k=>k.includes('EMAIL')||k.includes('MERCADO')))"

# Backup rápido
cp .env.local "backup-$(date +%Y%m%d).env"

# Limpiar variables sensibles antes de debug
cp .env.local .env.debug
sed -i 's/=.*/=***/' .env.debug
```

---

**🎯 Recomendación Final**: Usa un gestor de contraseñas + backup en cloud privado + credenciales separadas por entorno. ¡Es la combinación más segura y práctica!
