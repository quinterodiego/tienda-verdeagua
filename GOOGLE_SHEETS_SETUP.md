# Configuración de Google Sheets API

## Paso 1: Crear Service Account

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto existente (el mismo donde configuraste OAuth)
3. Ve a **APIs & Services** > **Credentials**
4. Clic en **+ CREATE CREDENTIALS** > **Service account**
5. Nombre: `sheets-service-account`
6. Descripción: `Service account para acceder a Google Sheets`
7. Clic en **CREATE AND CONTINUE**
8. Rol: **Editor** (o puedes usar **Viewer** si solo vas a leer)
9. Clic en **CONTINUE** > **DONE**

## Paso 2: Generar clave JSON

1. En la lista de Service Accounts, clic en el que acabas de crear
2. Ve a la pestaña **KEYS**
3. Clic en **ADD KEY** > **Create new key**
4. Selecciona **JSON**
5. Clic en **CREATE**
6. Se descargará un archivo JSON - **¡GUÁRDALO EN LUGAR SEGURO!**

## Paso 3: Habilitar Google Sheets API

1. Ve a **APIs & Services** > **Library**
2. Busca "Google Sheets API"
3. Clic en **Google Sheets API**
4. Clic en **ENABLE**

## Paso 4: Crear Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea un nuevo sheet llamado "Verde Agua DB"
3. Copia el ID del sheet de la URL (la parte entre `/d/` y `/edit`)
   - Ejemplo: `https://docs.google.com/spreadsheets/d/1ABC123DEF456/edit`
   - El ID es: `1ABC123DEF456`
4. **IMPORTANTE**: Comparte el sheet con el email del service account
   - Clic derecho > Compartir
   - Pega el email del service account (está en el archivo JSON)
   - Dale permisos de **Editor**

## Paso 5: Configurar variables de entorno

Abre tu archivo `.env.local` y agrega las siguientes variables usando los datos del archivo JSON:

```bash
# Google Sheets Configuration
GOOGLE_SHEET_ID=tu_sheet_id_aqui
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=valor_del_json
GOOGLE_PRIVATE_KEY_ID=valor_del_json
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=sheets-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_CLIENT_ID_SERVICE=valor_del_json
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_X509_CERT_URL=valor_del_json
```

**IMPORTANTE**: 
- Reemplaza `GOOGLE_PRIVATE_KEY` con el valor completo del campo `private_key` del JSON
- Asegúrate de mantener las comillas y los `\n`
- NO subas el archivo JSON a tu repositorio

## Paso 6: Estructura del Sheet

⚠️ **NO necesitas crear las pestañas manualmente** - el sistema las creará automáticamente cuando ejecutes la migración.

El sistema creará automáticamente estas pestañas con sus encabezados:

### Pestaña "Productos"
| A (id) | B (name) | C (description) | D (price) | E (category) | F (image) | G (stock) | H (rating) | I (created_at) |

### Pestaña "Pedidos"  
| A (id) | B (user_email) | C (user_name) | D (total) | E (status) | F (items) | G (shipping_address) | H (payment_id) | I (payment_status) | J (created_at) |

### Pestaña "Usuarios"
| A (id) | B (name) | C (email) | D (image) | E (created_at) |

## Paso 7: Probar la configuración

1. Reinicia tu servidor: `npm run dev`
2. Ve a: `http://localhost:3000/setup-database`
3. Clic en "Ejecutar Migración"
4. Si todo está bien, verás un mensaje de éxito

## Paso 8: Verificar los datos

1. Ve a tu Google Sheet
2. Verifica que se hayan creado las pestañas
3. Verifica que los productos estén en la pestaña "Productos"

## Solución de problemas

### Error: "The caller does not have permission"
- Verifica que hayas compartido el sheet con el email del service account
- Verifica que el service account tenga permisos de "Editor"

### Error: "Invalid credentials"
- Verifica que todas las variables de entorno estén correctas
- Verifica que el GOOGLE_PRIVATE_KEY esté correctamente formateado

### Error: "Spreadsheet not found"
- Verifica que el GOOGLE_SHEET_ID sea correcto
- Verifica que el sheet exista y sea accesible

¡Una vez configurado, tu tienda usará Google Sheets como base de datos!
