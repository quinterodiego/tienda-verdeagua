# 🚀 Configuración Específica: tienda-verdeagua.com.ar

## 🎯 Acción Inmediata Requerida

### 1️⃣ **AHORA: Agregar Dominio en Vercel**

1. **Ve a Vercel Dashboard**: https://vercel.com/quinterodiegos-projects/vap-copilot
2. **Clic en "Settings"** (barra lateral izquierda)
3. **Clic en "Domains"** 
4. **En "Add Domain"**, escribe exactamente: `tienda-verdeagua.com.ar`
5. **Clic en "Add"**

⚠️ **Vercel te mostrará instrucciones específicas** - No las cierres, las necesitarás para el siguiente paso.

---

## 2️⃣ **Configurar DNS en ARCA/NIC.AR**

### Opción A: Nameservers de Vercel (Más Fácil)

Si Vercel te muestra nameservers como:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

En tu panel de ARCA:
1. **Busca "DNS" o "Nameservers"**
2. **Reemplaza los nameservers actuales** por los de Vercel
3. **Guarda los cambios**

### Opción B: Registros DNS Específicos

Si Vercel te muestra registros específicos:

#### Para el dominio principal:
```
Tipo: A
Nombre: @
Valor: 76.76.19.61
TTL: 3600
```

#### Para www:
```
Tipo: CNAME  
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600
```

---

## 3️⃣ **Verificar Propagación**

### Usar script de verificación:
```powershell
# En PowerShell:
cd "c:\Users\Diego\Documents\GitHub\tienda-verdeagua"
.\scripts\verify-domain.ps1
```

### Verificación online:
- **DNS Checker**: https://dnschecker.org → buscar `tienda-verdeagua.com.ar`
- **SSL Test**: https://www.ssllabs.com/ssltest/ (después de que funcione)

**⏰ Tiempo esperado**: 15 minutos - 6 horas

---

## 4️⃣ **Actualizar Variables de Entorno**

Una vez que `https://tienda-verdeagua.com.ar` funcione:

### En Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. **Editar** `NEXT_PUBLIC_BASE_URL`:
   ```
   https://tienda-verdeagua.com.ar
   ```
3. **Editar** `NEXTAUTH_URL`:
   ```
   https://tienda-verdeagua.com.ar
   ```
4. **Click "Save"** en cada una
5. **Redeploy** automático

---

## 5️⃣ **Configurar Google OAuth**

### En Google Cloud Console:
1. **Ve a**: https://console.cloud.google.com/apis/credentials
2. **Busca tu OAuth 2.0 Client ID** (el que usas actualmente)
3. **Click "Edit"**
4. **En "Authorized JavaScript origins"**, agregar:
   ```
   https://tienda-verdeagua.com.ar
   ```
5. **En "Authorized redirect URIs"**, agregar:
   ```
   https://tienda-verdeagua.com.ar/api/auth/callback/google
   ```
6. **Save**

---

## 6️⃣ **Verificación Final**

### Checklist completo:
- [ ] `https://tienda-verdeagua.com.ar` carga la tienda
- [ ] `https://www.tienda-verdeagua.com.ar` redirige al principal
- [ ] SSL activo (candado verde)
- [ ] Login con Google funciona
- [ ] API responde: `https://tienda-verdeagua.com.ar/api/debug/production-readiness`
- [ ] MercadoPago funciona en checkout

### Comando de verificación rápida:
```powershell
# Verificar que la API funciona:
curl https://tienda-verdeagua.com.ar/api/debug/production-readiness
```

**Respuesta esperada**: `{"ready": true, "mode": "production"}`

---

## 🎉 **¡Listo!**

Tu tienda estará disponible en:
- **Principal**: https://tienda-verdeagua.com.ar
- **Con WWW**: https://www.tienda-verdeagua.com.ar (redirige al principal)
- **SSL**: Automático con Let's Encrypt
- **CDN**: Global de Vercel (optimizado para Argentina)

---

## 🚨 **Si algo no funciona**

### Problema común: DNS no propaga
**Solución**: Esperar más tiempo, verificar en https://dnschecker.org

### Problema: SSL no activa
**Solución**: Esperar 10-15 minutos después de que DNS funcione

### Problema: Google OAuth falla
**Solución**: Verificar que agregaste el dominio en Google Cloud Console

### Script de diagnóstico:
```powershell
.\scripts\verify-domain.ps1
```

¡Tu dominio argentino estará funcionando pronto! 🇦🇷✨
