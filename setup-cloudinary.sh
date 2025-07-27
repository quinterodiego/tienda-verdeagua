# Script de configuración rápida para Cloudinary

# 1. Instalar dependencias
npm install cloudinary

# 2. Crear cuenta en Cloudinary
echo "🔗 Ir a: https://cloudinary.com/users/register/free"
echo "📝 Obtener credenciales del Dashboard > Settings > Access Keys"

# 3. Configurar variables de entorno
echo ""
echo "📋 Agregar a tu .env.local:"
echo "CLOUDINARY_CLOUD_NAME=tu-cloud-name"
echo "CLOUDINARY_API_KEY=tu-api-key" 
echo "CLOUDINARY_API_SECRET=tu-api-secret"

# 4. Uncommentar líneas en el archivo de upload
echo ""
echo "✏️ En src/app/api/upload/route.ts descomenta las líneas de Cloudinary"

echo ""
echo "🎉 ¡Listo! Ahora puedes subir imágenes desde el panel de admin"
