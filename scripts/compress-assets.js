const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { gzip, brotliCompress } = require('zlib');

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

// Configuración de compresión
const COMPRESSION_OPTIONS = {
  gzip: { level: 9 },
  brotli: { 
    params: {
      [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11,
      [require('zlib').constants.BROTLI_PARAM_SIZE_HINT]: 0
    }
  }
};

// Extensiones de archivos a comprimir
const COMPRESSIBLE_EXTENSIONS = ['.js', '.css', '.html', '.json', '.xml', '.txt', '.svg'];

async function compressFile(filePath, outputDir) {
  const fileContent = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  
  if (!COMPRESSIBLE_EXTENSIONS.includes(ext)) {
    return;
  }

  const fileName = path.basename(filePath);
  
  try {
    // Compresión Gzip
    const gzippedContent = await gzipAsync(fileContent, COMPRESSION_OPTIONS.gzip);
    fs.writeFileSync(path.join(outputDir, `${fileName}.gz`), gzippedContent);
    
    // Compresión Brotli
    const brotliContent = await brotliAsync(fileContent, COMPRESSION_OPTIONS.brotli);
    fs.writeFileSync(path.join(outputDir, `${fileName}.br`), brotliContent);
    
    const originalSize = fileContent.length;
    const gzipSize = gzippedContent.length;
    const brotliSize = brotliContent.length;
    
    console.log(`📦 ${fileName}:`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Gzip: ${(gzipSize / 1024).toFixed(2)} KB (${((1 - gzipSize/originalSize) * 100).toFixed(1)}% reducción)`);
    console.log(`   Brotli: ${(brotliSize / 1024).toFixed(2)} KB (${((1 - brotliSize/originalSize) * 100).toFixed(1)}% reducción)`);
    
  } catch (error) {
    console.error(`❌ Error comprimiendo ${fileName}:`, error.message);
  }
}

async function compressStaticAssets() {
  const staticDir = path.join(process.cwd(), '.next', 'static');
  const outputDir = path.join(process.cwd(), '.next', 'compressed');
  
  if (!fs.existsSync(staticDir)) {
    console.log('⚠️  Directorio .next/static no encontrado. Ejecuta npm run build primero.');
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🗜️  Comprimiendo assets estáticos...');
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        compressFile(filePath, outputDir);
      }
    });
  }
  
  walkDir(staticDir);
  console.log('✅ Compresión completada');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  compressStaticAssets().catch(console.error);
}

module.exports = { compressStaticAssets };
