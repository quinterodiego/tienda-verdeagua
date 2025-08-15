#!/bin/bash
# Script para migrar de Lucide React a Heroicons

echo "🚀 Iniciando migración de Lucide React a Heroicons..."

# Lista de archivos que tienen importaciones de lucide-react
files=(
  "src/lib/optimized-icons.ts"
  "src/components/SimpleThemeToggle.tsx"
  "src/components/OrderDetailModal.tsx"
  "src/components/ThemeCustomizer.tsx"
  "src/components/TestCardsHelper.tsx"
  "src/components/ThemeIndicator.tsx"
  "src/components/ThemeSettings.tsx"
  "src/components/Notification.tsx"
  "src/app/smartphones/page.tsx"
  "src/components/MercadoPagoCheckout_backup.tsx"
  "src/components/LoadingComponents.tsx"
  "src/app/nosotros/page.tsx"
  "src/app/mis-pedidos/page-simple.tsx"
  "src/app/mis-pedidos/page.tsx"
  "src/app/contacto/page-new.tsx"
  "src/app/contacto/page.tsx"
  "src/app/contacto/page-old.tsx"
  "src/app/checkout/failure/page.tsx"
)

echo "📋 Archivos a migrar: ${#files[@]}"

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Migrando: $file"
    
    # Backup del archivo original
    cp "$file" "$file.backup"
    
    # Reemplazar import de lucide-react con import desde HeroIcons
    sed -i "s/from 'lucide-react'/from '@\/components\/HeroIcons'/g" "$file"
    
    echo "✅ Migrado: $file"
  else
    echo "⚠️  Archivo no encontrado: $file"
  fi
done

echo "✨ Migración completada!"
echo "💡 Los archivos originales se guardaron con extensión .backup"
echo "🔄 Reinicia el servidor de desarrollo para aplicar los cambios"
