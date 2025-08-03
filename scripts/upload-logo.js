const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadLogo() {
  try {
    console.log('🔄 Configurando Cloudinary...');
    
    // Verificar configuración
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('❌ Variables de Cloudinary no configuradas');
    }

    const logoPath = path.join(__dirname, '../public/logo-horizontal.png');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(logoPath)) {
      throw new Error('❌ Logo no encontrado en: ' + logoPath);
    }

    console.log('📤 Subiendo logo a Cloudinary...');
    
    // Subir imagen
    const result = await cloudinary.uploader.upload(logoPath, {
      public_id: 'verde-agua/logo-horizontal',
      folder: 'verde-agua',
      overwrite: true,
      resource_type: 'image',
      format: 'png',
      transformation: [
        { width: 300, height: 80, crop: 'fit', quality: 'auto:good' }
      ]
    });

    console.log('✅ Logo subido exitosamente!');
    console.log('🔗 URL pública:', result.secure_url);
    console.log('🎯 Public ID:', result.public_id);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error subiendo logo:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  uploadLogo()
    .then((result) => {
      console.log('\n🎉 Proceso completado!');
      console.log(`\n📋 Para usar en emails, actualiza la URL a:`);
      console.log(`${result.secure_url}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { uploadLogo };
