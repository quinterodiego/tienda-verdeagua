# 📧 Sistema de Emails - Diagnóstico y Solución

## 🔍 Problema Identificado

El sistema de emails estaba configurado pero faltaba la variable `EMAIL_ADMIN` para las notificaciones al vendedor.

## ✅ Solución Implementada

### 1. **Variables de Email Configuradas** (Local)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=d86webs@gmail.com
EMAIL_PASSWORD=oxwu ckrr ksuz katu
EMAIL_FROM=d86webs@gmail.com
EMAIL_FROM_NAME=Verde Agua
EMAIL_ADMIN=d86webs@gmail.com  # ← NUEVA VARIABLE AGREGADA
```

### 2. **Herramientas de Debug Creadas**
- **Página de Debug**: `/debug/email`
- **Configuración de Email**: `/config/notification-email`
- **APIs de Prueba**:
  - `/api/debug/email/config` - Verificar configuración
  - `/api/debug/email/smtp-test` - Test básico SMTP
  - `/api/debug/email/welcome-test` - Email de bienvenida
  - `/api/debug/email/order-test` - Confirmación de pedido
  - `/api/debug/email/admin-test` - Notificación admin

## 🧪 Cómo Testear el Sistema

### Paso 1: Verificar Configuración Local
1. Ve a http://localhost:3000/debug/email
2. Inicia sesión como admin (d86webs@gmail.com)
3. Haz clic en "Verificar Configuración"
4. Debe mostrar todas las variables como "CONFIGURADO"

### Paso 2: Test SMTP Básico
1. Ingresa tu email en "Email de Prueba"
2. Selecciona "Test Básico SMTP"
3. Haz clic en "Ejecutar Test"
4. Verifica que llegue el email

### Paso 3: Test de Templates
1. Prueba cada tipo de email:
   - Email de Bienvenida
   - Confirmación de Pedido
   - Notificación Admin
2. Verifica que todos lleguen correctamente

## 🚀 Configuración en Producción (Vercel)

### Variables que DEBES agregar en Vercel:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=d86webs@gmail.com
EMAIL_PASSWORD=oxwu ckrr ksuz katu
EMAIL_FROM=d86webs@gmail.com
EMAIL_FROM_NAME=Verde Agua
EMAIL_ADMIN=tu-email-para-notificaciones@ejemplo.com  # ← CAMBIAR ESTE
```

### Pasos para Configurar en Vercel:
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `tienda-verdeagua`
3. Ve a **Settings > Environment Variables**
4. Agrega cada variable de email
5. Haz **Redeploy** del proyecto

## 📧 Tipos de Emails del Sistema

### 1. **Email de Bienvenida** (Clientes)
- **Cuándo**: Al registrarse un nuevo usuario
- **Para**: Email del cliente
- **Template**: Diseño completo con logo y bienvenida

### 2. **Confirmación de Pedido** (Clientes)
- **Cuándo**: Cuando MercadoPago confirma el pago
- **Para**: Email del cliente
- **Template**: Detalles del pedido, productos, total
- **Trigger**: Webhook de MercadoPago (`payment.status = "approved"`)

### 3. **Notificación Admin** (Vendedor)
- **Cuándo**: Al crearse un nuevo pedido
- **Para**: EMAIL_ADMIN
- **Template**: Resumen del pedido para procesamiento
- **Trigger**: API `/api/orders` (POST)

### 4. **Email de Recuperación de Contraseña**
- **Cuándo**: Usuario solicita resetear contraseña
- **Para**: Email del usuario
- **Template**: Link seguro para resetear

## 🔧 Flujo de Emails en el Sistema

### Flujo Normal de Pedido:
```
1. Cliente hace pedido
   ↓
2. Se crea en Google Sheets
   ↓
3. Se envía NOTIFICACIÓN ADMIN (EMAIL_ADMIN)
   ↓
4. Cliente paga con MercadoPago
   ↓
5. Webhook confirma pago
   ↓
6. Se envía CONFIRMACIÓN AL CLIENTE
```

## ❗ Puntos Importantes

### Variables Críticas:
- **EMAIL_ADMIN**: Donde recibes notificaciones de pedidos
- **EMAIL_USER**: Cuenta Gmail que envía los emails
- **EMAIL_PASSWORD**: Contraseña de aplicación de Gmail

### Gmail - Contraseña de Aplicación:
1. Ve a https://myaccount.google.com/security
2. Activa verificación en 2 pasos
3. Genera contraseña de aplicación
4. Usa esa contraseña (no la de Gmail normal)

## 🐛 Troubleshooting

### Error: "Invalid login"
- ✅ **Solución**: Usar contraseña de aplicación, no contraseña normal de Gmail

### Error: "ECONNREFUSED"
- ✅ **Solución**: Verificar EMAIL_HOST y EMAIL_PORT

### No llegan emails
- ✅ **Verificar**: Variables configuradas en Vercel
- ✅ **Verificar**: Redeploy después de cambiar variables
- ✅ **Verificar**: Carpeta de spam

### Emails llegan al cliente pero no al admin
- ✅ **Verificar**: Variable EMAIL_ADMIN en Vercel
- ✅ **Test**: Usar `/debug/email` para probar notificación admin

## 📱 Acceso Rápido

### Para cambiar email de notificaciones:
1. **Método Fácil**: http://localhost:3000/config/notification-email
2. **Método Manual**: Editar EMAIL_ADMIN en Vercel

### Para hacer debug:
1. **Debug Page**: http://localhost:3000/debug/email
2. **Solo para admin**: d86webs@gmail.com

## ✅ Estado Actual

- ✅ Configuración SMTP: Completa
- ✅ Templates de email: Funcionando
- ✅ Webhook MercadoPago: Enviando emails
- ✅ Notificaciones admin: Configuradas
- ✅ Herramientas de debug: Creadas
- ✅ Variables locales: Configuradas
- ⏳ Variables Vercel: Pendientes de configurar

---

**Próximo paso**: Configurar las variables de email en Vercel y hacer redeploy.
