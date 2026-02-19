#!/bin/bash

# Script para generar iconos PWA desde una imagen base
# Requiere ImageMagick: brew install imagemagick

# Colores del gradiente (puedes personalizarlos)
COLOR1="#0ea5e9"  # Azul primary-500
COLOR2="#0369a1"  # Azul primary-700

# Tamaños requeridos para PWA
SIZES=(72 96 128 144 152 192 384 512)

echo "🎨 Generando iconos PWA..."

# Crear directorio si no existe
mkdir -p public/icons

# Generar icono base con gradiente
echo "Creando icono base..."
convert -size 512x512 \
  gradient:"$COLOR1"-"$COLOR2" \
  -gravity center \
  -pointsize 280 \
  -font Arial-Bold \
  -fill white \
  -annotate +0+0 '$' \
  public/icons/icon-512x512.png

# Generar todos los tamaños
for SIZE in "${SIZES[@]}"
do
  if [ $SIZE -ne 512 ]; then
    echo "Generando icono ${SIZE}x${SIZE}..."
    convert public/icons/icon-512x512.png \
      -resize ${SIZE}x${SIZE} \
      public/icons/icon-${SIZE}x${SIZE}.png
  fi
done

echo "✅ Iconos generados exitosamente en public/icons/"
echo ""
echo "Iconos creados:"
ls -lh public/icons/*.png
