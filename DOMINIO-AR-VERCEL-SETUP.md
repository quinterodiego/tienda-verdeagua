# 🇦🇷 Configuración de Dominio .ar con Vercel

## 📋 Información Actual
- **Dominio**: tienda-verdeagua.com.ar (registrado en NIC.AR)
- **Proyecto Vercel**: `vap-copilot`
- **URL Actual**: `vap-copilot-e87z2dvtq-quinterodiegos-projects.vercel.app`

---

## 🎯 Paso 1: Agregar Dominio en Vercel

### 1.1 En Vercel Dashboard
1. Ve a tu proyecto: https://vercel.com/quinterodiegos-projects/vap-copilot
2. Clic en **"Settings"** → **"Domains"**
3. En "Add Domain", escribe tu dominio: `tienda-verdeagua.com.ar`
4. Clic en **"Add"**

### 1.2 Vercel te mostrará la configuración DNS
Vercel te dará 2 opciones:
- **Opción A**: Nameservers de Vercel (más fácil)
- **Opción B**: Registros DNS específicos (más control)

---

## 🔧 Paso 2: Configurar DNS en NIC.AR

### Opción A: Usar Nameservers de Vercel (Recomendado)

#### En el panel de ARCA/NIC.AR:
1. Busca la sección **"DNS"** o **"Nameservers"**
2. Cambia los nameservers por los de Vercel:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

### Opción B: Configurar Registros DNS Específicos

Si prefieres mantener tu DNS actual, agrega estos registros:

#### Registro A (para dominio principal)
```
Tipo: A
Nombre: @
Valor: 216.198.7.91
TTL: 3600
```

#### Registro CNAME (para www)
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600
```

---

## ⏰ Paso 3: Esperar Propagación

- **Tiempo estimado**: 15 minutos - 48 horas
- **Propagación típica en Argentina**: 2-6 horas
- **Verificar**: Usa https://dnschecker.org

---

## 🔧 Paso 4: Configurar Variables de Entorno

Una vez que el dominio esté funcionando, actualiza estas variables en Vercel:

### Variables a actualizar:
```env
NEXT_PUBLIC_BASE_URL=https://tienda-verdeagua.com.ar
NEXTAUTH_URL=https://tienda-verdeagua.com.ar
```

### Cómo actualizar:
1. Ve a **Settings** → **Environment Variables**
2. Busca `NEXT_PUBLIC_BASE_URL`
3. Edita y cambia por tu dominio
4. Haz lo mismo con `NEXTAUTH_URL`
5. **Redeploy** el proyecto

---

## 🎯 Paso 5: Configurar Google OAuth

Agrega tu nuevo dominio en Google Cloud Console:

### 5.1 En Google Cloud Console:
1. Ve a **APIs & Services** → **Credentials**
2. Busca tu OAuth 2.0 Client ID
3. En **Authorized JavaScript origins**, agrega:
   ```
   https://tienda-verdeagua.com.ar
   ```
4. En **Authorized redirect URIs**, agrega:
   ```
   https://tienda-verdeagua.com.ar/api/auth/callback/google
   ```

---

## 🛡️ Paso 6: Configurar SSL

✅ **Automático**: Vercel configura SSL automáticamente con Let's Encrypt
- El certificado se genera en 5-10 minutos
- Se renueva automáticamente
- Compatible con `.ar` y subdominios

---

## 🧪 Paso 7: Verificación

### Verificar que funciona:
1. **DNS**: https://dnschecker.org → Tu dominio
2. **SSL**: https://www.ssllabs.com/ssltest/
3. **Sitio**: https://tienda-verdeagua.com.ar
4. **API**: https://tienda-verdeagua.com.ar/api/debug/production-readiness

### Checklist post-configuración:
- [ ] Dominio resuelve correctamente
- [ ] SSL activo (candado verde)
- [ ] Login con Google funciona
- [ ] API responde correctamente
- [ ] MercadoPago funciona
- [ ] Redirecciones WWW → no-WWW (automático)

---

## 🚨 Troubleshooting

### Problema: "Domain not found"
**Solución**: Esperar más tiempo o verificar nameservers

### Problema: SSL no activo
**Solución**: Esperar 10-15 minutos más, Vercel lo configura automáticamente

### Problema: Google OAuth no funciona
**Solución**: Verificar que agregaste el dominio en Google Cloud Console

### Problema: API da errores 404
**Solución**: Verificar que `NEXTAUTH_URL` esté actualizada

---

## 📞 Información de Contacto

### Si necesitas ayuda:
- **Vercel Support**: support@vercel.com
- **NIC.AR**: https://nic.ar/ayuda
- **ARCA**: Panel de administración donde registraste

---

## 🎉 ¡Una vez configurado!

Tu tienda estará disponible en:
- ✅ **https://tienda-verdeagua.com.ar** (principal)
- ✅ **https://www.tienda-verdeagua.com.ar** (redirección automática)
- ✅ **SSL automático** y renovación
- ✅ **CDN global** de Vercel
- ✅ **Optimización automática** para Argentina

---

## 📋 Recordatorios Importantes

1. **Backup**: Guarda la configuración DNS actual antes de cambiar
2. **Testing**: Prueba en un subdominio primero si es posible
3. **Monitoreo**: Vercel Analytics incluido automáticamente
4. **Performance**: CDN optimizado para usuarios argentinos

¡Tu dominio .ar estará funcionando con Vercel en pocas horas! 🚀
