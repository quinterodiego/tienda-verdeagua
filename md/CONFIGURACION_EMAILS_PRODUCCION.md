# 📧 Configuración de Emails para Producción - Verde Agua

## 🎯 Resumen Ejecutivo

Para migrar el sistema de emails a producción necesitas configurar un **email profesional dedicado** para la tienda. El actual (`d86webs@gmail.com`) es para desarrollo.

## 📋 Checklist de Configuración

### ✅ 1. Email de Producción Recomendado
Crear un email profesional como:
- `info@verdeagua.ar` (si tienes dominio propio)
- `noreply@verdeagua.ar` (para emails automáticos)
- `ventas@verdeagua.ar` (para notificaciones de pedidos)

### ✅ 2. Variables de Entorno que Cambiar

#### En Vercel Dashboard:
Ve a: https://vercel.com/quinterodiegos-projects/vap-copilot/settings/environment-variables

**Agregar/Actualizar estas variables:**

```bash
# EMAILS PRODUCCIÓN - PRINCIPALES
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@verdeagua.ar           # 🔄 CAMBIAR - Email principal de la tienda
EMAIL_PASSWORD=tu-app-password-aqui    # 🔄 CAMBIAR - App Password de Gmail
EMAIL_FROM=info@verdeagua.ar           # 🔄 CAMBIAR - Email que aparece como remitente
EMAIL_FROM_NAME=Verde Agua Personalizados
EMAIL_ADMIN=ventas@verdeagua.ar        # 🔄 CAMBIAR - Email para notificaciones admin

# LOGOS Y BRANDING
EMAIL_LOGO_URL=https://tu-dominio.com/logo.png  # 🔄 CAMBIAR - URL del logo
NEXT_PUBLIC_APP_URL=https://tu-dominio.com       # 🔄 CAMBIAR - URL de la tienda
```

### ✅ 3. Opciones de Configuración SMTP

#### **Opción A: Gmail Business (Google Workspace)**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@tudominio.com
EMAIL_PASSWORD=tu-app-password
```

#### **Opción B: Gmail Personal con Dominio Personalizado**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tuemailpersonal@gmail.com
EMAIL_FROM=info@tudominio.com    # Se ve como info@ pero se envía desde Gmail
```

#### **Opción C: SendGrid (Recomendado para Alto Volumen)**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=tu-sendgrid-api-key
EMAIL_FROM=info@tudominio.com
```

#### **Opción D: Mailgun**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@tudominio.com
EMAIL_PASSWORD=tu-mailgun-password
EMAIL_FROM=info@tudominio.com
```

## 🔧 Configuración Recomendada por Etapas

### **Etapa 1: Transición Inmediata (Gmail Personal)**
Para empezar ya mismo sin costos adicionales:

```bash
# Configuración temporal con Gmail personal
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=verdeagua.ventas@gmail.com      # Crear email nuevo específico
EMAIL_PASSWORD=generar-app-password        # Generar App Password nuevo
EMAIL_FROM=verdeagua.ventas@gmail.com
EMAIL_FROM_NAME=Verde Agua Personalizados
EMAIL_ADMIN=verdeagua.ventas@gmail.com
```

### **Etapa 2: Profesionalización (Google Workspace o SendGrid)**
Cuando la tienda crezca:

```bash
# Con dominio propio
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@verdeagua.ar
EMAIL_PASSWORD=app-password-workspace
EMAIL_FROM=info@verdeagua.ar
EMAIL_FROM_NAME=Verde Agua Personalizados
EMAIL_ADMIN=ventas@verdeagua.ar
```

## 📊 Tipos de Emails del Sistema

El sistema actual envía **5 tipos de emails**:

1. **📧 Email Básico**: Tests y comunicaciones generales
2. **🛒 Confirmación de Pedido**: Al cliente cuando compra
3. **🔔 Notificación Admin**: Al vendedor cuando hay nuevo pedido
4. **📈 Actualización de Estado**: Cambios en el pedido (procesando, enviado, etc.)
5. **📞 Email de Contacto**: Formularios de contacto

## 🎨 Personalización de Branding

### Variables de Imagen:
```bash
EMAIL_LOGO_URL=https://tudominio.com/logo.png
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

### Personalización en el Código:
- **Colores**: Verde Agua (#68c3b7) ya configurados
- **Tipografía**: Segoe UI ya configurada
- **Templates**: Responsivos y profesionales

## 🔐 Seguridad y App Passwords

### Para Gmail:
1. Activa **Verificación en 2 pasos** en tu cuenta Gmail
2. Ve a **Configuración de cuenta** → **Seguridad**
3. Busca **Contraseñas de aplicaciones**
4. Genera una nueva para "Aplicación personalizada: Tienda Verde Agua"
5. Usa esa contraseña (16 caracteres) en `EMAIL_PASSWORD`

### Importante:
- ❌ **NUNCA** uses tu contraseña personal de Gmail
- ✅ **SIEMPRE** usa App Passwords para aplicaciones
- 🔄 **ROTA** las App Passwords cada 6 meses

## 🚀 Pasos para Implementar

### **Paso 1: Crear Email de Producción**
```bash
# Opción recomendada: Crear nuevo Gmail específico
1. Ir a gmail.com
2. Crear: verdeagua.tienda@gmail.com (o similar)
3. Configurar verificación 2FA
4. Generar App Password
```

### **Paso 2: Actualizar Vercel**
```bash
1. Ir a Vercel Dashboard
2. Settings → Environment Variables
3. Actualizar las variables EMAIL_*
4. Wait for automatic redeploy
```

### **Paso 3: Probar Sistema**
```bash
# Test endpoint después del deploy
curl -X POST "https://tu-dominio.vercel.app/api/debug/email/complete-test" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "tuemailprueba@gmail.com"}'
```

### **Paso 4: Verificar en Producción**
- ✅ Hacer una compra de prueba
- ✅ Verificar que llegan los emails de confirmación
- ✅ Verificar que llegan las notificaciones al admin
- ✅ Probar cambios de estado de pedidos

## 📈 Monitoreo y Mantenimiento

### Variables a Monitorear:
- **Tasa de entrega**: ¿Llegan todos los emails?
- **Spam score**: ¿Van a spam o bandeja principal?
- **Límites de envío**: Gmail personal: 500/día, Workspace: 2000/día

### Logs del Sistema:
```bash
# El sistema ya logea el envío de emails
console.log('Email enviado:', result.messageId);
```

## 💰 Costos Estimados

### **Opción Gmail Personal**: $0/mes
- Límite: 500 emails/día
- Bueno para: Tiendas pequeñas

### **Google Workspace**: $6 USD/mes por usuario
- Límite: 2000 emails/día
- Incluye: Email profesional, dominio personalizado

### **SendGrid**: $0-$14.95/mes
- Free: 100 emails/día
- Paid: 40,000+ emails/mes
- Bueno para: Alto volumen

## ⚠️ Consideraciones Importantes

### **Reputación de Dominio**
- Emails desde Gmail personal: ✅ Buena reputación inicial
- Emails desde dominio nuevo: ⚠️ Necesita "warming up"

### **Deliverability**
- Gmail/Google: ~95% deliverability
- SendGrid: ~99% deliverability
- Mailgun: ~98% deliverability

### **Compliance**
- ✅ Todos los templates incluyen opción de unsubscribe
- ✅ Footers con información de la empresa
- ✅ Cumple GDPR/CAN-SPAM básico

## 🎯 Recomendación Final

**Para empezar YA:**
1. Crear `verdeagua.tienda@gmail.com`
2. Configurar App Password
3. Actualizar variables en Vercel
4. ✅ **¡Ya tienes emails profesionales funcionando!**

**Para el futuro cercano:**
1. Comprar dominio `verdeagua.ar`
2. Configurar Google Workspace
3. Migrar gradualmente

## 📞 Soporte

Si tienes problemas:
1. **Revisar logs** en Vercel Functions
2. **Probar endpoint** de debug: `/api/debug/email/complete-test`
3. **Verificar** que App Password es correcta
4. **Confirmar** variables de entorno en Vercel

---
**📝 Nota**: Este documento cubre la migración completa de emails de desarrollo a producción. Actualizar según necesidades específicas del negocio.
