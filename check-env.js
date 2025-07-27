console.log('=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===');

const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'MERCADOPAGO_ACCESS_TOKEN',
  'MERCADOPAGO_PUBLIC_KEY',
  'NEXT_PUBLIC_BASE_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GOOGLE_SHEET_ID',
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_PROJECT_ID'
];

let hasErrors = false;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.error(`❌ ${varName}: NOT SET OR EMPTY`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: SET (${value.length} chars)`);
  }
});

if (hasErrors) {
  console.error('\n❌ Build failed: Missing required environment variables');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set');
}
