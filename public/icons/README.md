# Iconos PWA

Esta carpeta debe contener los iconos de la aplicación en diferentes tamaños.

## Generar iconos

Puedes usar herramientas online como:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

O usar ImageMagick:

```bash
# Desde una imagen original de 512x512
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

## Tamaños requeridos

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512
