# 📧 Cómo Cambiar el Email de Notificaciones

## ¿Qué es esto?

Actualmente tu tienda envía notificaciones de pedidos al email configurado en las variables de entorno de Vercel. Con esta nueva funcionalidad puedes cambiar fácilmente a qué email quieres recibir estas notificaciones.

## 🎯 ¿Qué notificaciones recibes?

- ✅ **Nuevo pedido creado**: Cuando un cliente hace un pedido
- ✅ **Pago confirmado**: Cuando MercadoPago confirma el pago
- ❌ **Pago fallido**: Cuando hay un problema con el pago
- 📊 **Resumen de pedidos**: Estados de pedidos pendientes

## 🚀 Cómo cambiar el email (Método Fácil)

### Paso 1: Acceder a la configuración
1. Inicia sesión en tu tienda como administrador
2. Haz clic en tu avatar/nombre en la esquina superior derecha
3. Selecciona **"Config. Email"** del menú desplegable

### Paso 2: Configurar nuevo email
1. Ingresa el nuevo email donde quieres recibir las notificaciones
2. Haz clic en **"Configurar Email de Notificaciones"**
3. Copia las instrucciones que aparecen

### Paso 3: Actualizar en Vercel
1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto: `tienda-verdeagua`
3. Ve a **Settings > Environment Variables**
4. Busca la variable `EMAIL_ADMIN`
5. Edítala y cambia el valor por tu nuevo email
6. Guarda los cambios
7. Ve a **Deployments** y haz **Redeploy** del último deployment

### Paso 4: Verificar
- Las próximas notificaciones llegarán al nuevo email
- Puedes hacer un pedido de prueba para verificar

## ⚙️ Método Manual (Alternativo)

Si prefieres hacerlo directamente en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Modifica `EMAIL_ADMIN` con el nuevo email
4. Redeploy

## 🔧 Variables de Email importantes

- `EMAIL_ADMIN`: Email que recibe las notificaciones (el que quieres cambiar)
- `EMAIL_FROM`: Email que aparece como remitente
- `EMAIL_USER`: Usuario SMTP para enviar emails
- `EMAIL_PASSWORD`: Contraseña SMTP

## ❓ Troubleshooting

### No recibo emails
1. Verifica que el email esté bien escrito
2. Revisa la carpeta de spam/junk
3. Confirma que hiciste redeploy después del cambio

### Error al configurar
- Asegúrate de estar logueado como administrador principal
- El email debe tener formato válido (ejemplo@dominio.com)

## 📞 Soporte

Si tienes problemas, recuerda que:
- Solo el administrador principal puede cambiar esta configuración
- Los cambios requieren redeploy en Vercel para tomar efecto
- Las notificaciones existentes no se ven afectadas, solo las futuras

---

**Creado:** Diciembre 2024  
**Versión:** 1.0  
**Estado:** ✅ Funcional  
