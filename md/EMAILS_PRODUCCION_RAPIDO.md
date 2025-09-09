# 🚀 GUÍA RÁPIDA: Emails en Producción

## ⚡ Acción Inmediata (5 minutos)

### 1️⃣ Crear Email Dedicado
```bash
# Recomendado: Crear nuevo Gmail específico
Email: verdeagua.tienda@gmail.com
Propósito: Solo para la tienda
```

### 2️⃣ Configurar App Password
1. Ir a [myaccount.google.com](https://myaccount.google.com)
2. **Seguridad** → **Verificación en 2 pasos** (activar si no está)
3. **Contraseñas de aplicaciones** → **Seleccionar app: Correo**
4. **Seleccionar dispositivo: Otro** → Escribir: "Tienda Verde Agua"
5. **Copiar** la contraseña de 16 caracteres

### 3️⃣ Actualizar Variables en Vercel
Ve a: https://vercel.com/quinterodiegos-projects/vap-copilot/settings/environment-variables

**CAMBIAR ESTAS VARIABLES:**
```bash
EMAIL_USER=verdeagua.tienda@gmail.com         # ← TU NUEVO EMAIL
EMAIL_PASSWORD=abcd efgh ijkl mnop            # ← APP PASSWORD DE 16 CARACTERES
EMAIL_FROM=verdeagua.tienda@gmail.com         # ← MISMO EMAIL
EMAIL_ADMIN=verdeagua.tienda@gmail.com        # ← PARA NOTIFICACIONES
```

**MANTENER ESTAS:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM_NAME=Verde Agua Personalizados
```

### 4️⃣ Verificar Funcionamiento
```bash
# Después del redeploy automático (2-3 minutos)
# Probar en: https://tu-dominio.vercel.app/api/debug/email/complete-test
```

---

## 📧 Configuraciones por Nivel

### 🟢 **NIVEL 1: Básico (Gratis)**
```bash
EMAIL_USER=verdeagua.tienda@gmail.com
EMAIL_FROM=verdeagua.tienda@gmail.com
EMAIL_ADMIN=verdeagua.tienda@gmail.com
```
✅ **Perfecto para empezar**  
⚠️ Límite: 500 emails/día

### 🟡 **NIVEL 2: Profesional ($6/mes)**
```bash
EMAIL_USER=info@verdeagua.ar              # Requiere dominio
EMAIL_FROM=info@verdeagua.ar
EMAIL_ADMIN=ventas@verdeagua.ar
```
✅ **Imagen profesional**  
✅ **2000 emails/día**

### 🔴 **NIVEL 3: Alto Volumen (Variable)**
```bash
# SendGrid, Mailgun, etc.
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.tu-api-key-aqui
```
✅ **Miles de emails/día**  
✅ **99% deliverability**

---

## 🔥 Problemas Comunes y Soluciones

### ❌ "Authentication failed"
**Solución:** Verificar que usas App Password, no tu contraseña personal

### ❌ "Connection timeout"
**Solución:** Verificar que EMAIL_HOST y EMAIL_PORT son correctos

### ❌ "Email goes to spam"
**Solución:** 
- Usar un email establecido (no recién creado)
- Evitar palabras como "oferta", "gratis" en asuntos
- Configurar SPF/DKIM si tienes dominio propio

### ❌ Variables no se actualizan
**Solución:** 
- Esperar 3-5 minutos después de cambiar en Vercel
- Verificar en deployment logs

---

## 🎯 Recomendación para Verde Agua

**AHORA MISMO:**
1. Crear `verdeagua.tienda@gmail.com`
2. Generar App Password
3. Actualizar 4 variables en Vercel
4. ✅ **¡Listo en 5 minutos!**

**PRÓXIMO MES:**
1. Comprar dominio `verdeagua.ar`
2. Configurar Google Workspace
3. Migrar gradualmente

---

## 📞 ¿Necesitas Ayuda?

**Si algo no funciona:**
1. Verificar deployment logs en Vercel
2. Probar endpoint: `/api/debug/email/complete-test`
3. Revisar que App Password sea correcta (16 caracteres)
4. Confirmar que verificación 2FA está activa en Gmail

**¡La configuración actual funcionará perfectamente para arrancar!** 🚀
