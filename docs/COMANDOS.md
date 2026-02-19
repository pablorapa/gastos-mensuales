# 🔧 Comandos Útiles

Referencia rápida de comandos para desarrollar, debuggear y mantener la aplicación.

## 📦 Instalación y Setup

```bash
# Instalar dependencias
npm install

# Instalar dependencias limpias (si hay problemas)
rm -rf node_modules package-lock.json
npm install

# Verificar versiones
node --version  # Debería ser >= 18
npm --version   # Debería ser >= 9

# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Copiar variables de entorno
cp .env.example .env
```

---

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar en puerto diferente
PORT=3001 npm run dev

# Build para producción
npm run build

# Iniciar producción localmente
npm run build && npm run start

# Verificar tipos TypeScript
npm run type-check

# Lint del código
npm run lint

# Lint y fix automático
npm run lint --fix
```

---

## 🧪 Testing y Debug

```bash
# Ver logs de Next.js
DEBUG=* npm run dev

# Limpiar cache de Next.js
rm -rf .next

# Verificar bundle size
npm run build
# Ver output en .next/

# Analizar dependencias
npx depcheck

# Buscar vulnerabilidades
npm audit
npm audit fix
```

---

## 📊 Google Sheets

```bash
# Test de conexión (con curl)
curl -X POST http://localhost:3000/api/init \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Verificar credenciales
cat .env | grep GOOGLE_SHEETS

# Test de lectura
curl http://localhost:3000/api/balance?mes=2024-03 \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Test de escritura (gasto simple)
curl -X POST http://localhost:3000/api/gastos/simple \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{
    "concepto": "Test",
    "monto": 100,
    "persona": "Manuel",
    "fecha": "2024-03-15"
  }'
```

---

## 🔐 Autenticación

```bash
# Ver providers disponibles
curl http://localhost:3000/api/auth/providers

# Test de sesión
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=TU_TOKEN"

# Ver configuración de NextAuth (desde browser console)
fetch('/api/auth/providers').then(r => r.json()).then(console.log)
```

---

## 🎨 PWA e Iconos

```bash
# Generar iconos (requiere ImageMagick)
brew install imagemagick
chmod +x scripts/generate-icons.sh
./scripts/generate-icons.sh

# Verificar iconos
ls -lh public/icons/

# Verificar manifest
cat public/manifest.json

# Limpiar service workers
rm -rf public/sw.js public/workbox-*.js
npm run build
```

---

## 🚀 Deploy

```bash
# Deploy a Vercel (primera vez)
npm install -g vercel
vercel login
vercel

# Deploy a producción
vercel --prod

# Ver logs en tiempo real
vercel logs --follow

# Ver información del proyecto
vercel inspect

# Listar deployments
vercel ls

# Rollback a deployment anterior
vercel rollback [deployment-url]
```

---

## 🔍 Variables de Entorno

```bash
# Ver variables (sin valores sensibles)
cat .env | grep -v PRIVATE_KEY | grep -v SECRET

# Agregar variable en Vercel
vercel env add VARIABLE_NAME production

# Listar variables en Vercel
vercel env ls

# Remover variable en Vercel
vercel env rm VARIABLE_NAME production

# Sincronizar variables locales con Vercel
vercel env pull .env.local
```

---

## 📁 Gestión de Archivos

```bash
# Ver estructura del proyecto
tree -I 'node_modules|.next' -L 3

# Contar líneas de código
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Buscar TODOs en el código
grep -r "TODO\|FIXME" src/

# Buscar imports de un módulo
grep -r "from '@/lib/googleSheets'" src/

# Ver tamaño de directorios
du -sh node_modules .next public src
```

---

## 🐛 Debugging

```bash
# Debugging con VS Code
# Crear .vscode/launch.json:
# {
#   "version": "0.2.0",
#   "configurations": [
#     {
#       "name": "Next.js: debug server-side",
#       "type": "node-terminal",
#       "request": "launch",
#       "command": "npm run dev"
#     }
#   ]
# }

# Ver errores de compilación
npm run build 2>&1 | tee build.log

# Debugging de API Routes (agregar console.log)
# En src/app/api/*/route.ts
console.log('Debug:', { variable, otra })

# Ver requests en tiempo real (Network tab en DevTools)
# F12 → Network → Filter: XHR
```

---

## 🔧 Mantenimiento

```bash
# Actualizar dependencias
npm outdated
npm update

# Actualizar Next.js a última versión
npm install next@latest react@latest react-dom@latest

# Limpiar todo y reinstalar
rm -rf node_modules package-lock.json .next
npm install

# Ver dependencias obsoletas
npx npm-check-updates

# Actualizar todas las dependencias (cuidado!)
npx npm-check-updates -u
npm install
```

---

## 📊 Análisis y Performance

```bash
# Analizar bundle
npm run build
npx @next/bundle-analyzer

# Lighthouse (desde Chrome DevTools)
# F12 → Lighthouse → Generate report

# Verificar performance
curl -o /dev/null -s -w 'Total: %{time_total}s\n' https://tu-app.vercel.app

# Ver métricas de Vercel
vercel logs --output=json > logs.json
```

---

## 🗃️ Base de Datos (Google Sheets)

```bash
# Backup del spreadsheet (download as Excel)
# Desde Google Sheets: File → Download → Excel

# Ver IDs de hojas
# En Google Sheets: Ver URL al abrir una hoja
# https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit#gid=[SHEET_ID]

# Queries útiles (ejecutar en DevTools Console)
# Obtener todos los gastos de marzo
fetch('/api/gastos?mes=2024-03')
  .then(r => r.json())
  .then(console.table)

# Calcular balance
fetch('/api/balance?mes=2024-03')
  .then(r => r.json())
  .then(console.log)
```

---

## 🔄 Git

```bash
# Inicializar repositorio
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Conectar con GitHub
git remote add origin https://github.com/usuario/repo.git
git push -u origin main

# Commits comunes
git add .
git commit -m "feat: nueva funcionalidad"
git commit -m "fix: corrección de bug"
git commit -m "docs: actualizar documentación"
git push

# Ver cambios
git status
git diff

# Deshacer cambios locales
git checkout -- archivo.ts
git reset --hard HEAD
```

---

## 🧹 Limpieza

```bash
# Limpiar archivos temporales
rm -rf .next
rm -rf node_modules
rm -rf out

# Limpiar cache de npm
npm cache clean --force

# Limpiar service workers del navegador
# Chrome: DevTools → Application → Storage → Clear site data

# Reiniciar todo
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

---

## 🔒 Seguridad

```bash
# Auditar dependencias
npm audit

# Fix automático de vulnerabilidades
npm audit fix

# Ver dependencias desactualizadas
npm outdated

# Verificar que .env no esté en git
git ls-files | grep .env
# No debería retornar nada

# Ver qué archivos están en .gitignore
cat .gitignore
```

---

## 📱 Mobile Testing

```bash
# Servir en red local
npm run dev -- -H 0.0.0.0

# Obtener IP local
ipconfig getifaddr en0  # macOS
ip addr show          # Linux
ipconfig              # Windows

# Acceder desde móvil
# http://TU_IP_LOCAL:3000

# Testing PWA (Chrome DevTools)
# F12 → Lighthouse → PWA
# F12 → Application → Manifest
# F12 → Application → Service Workers
```

---

## 🎯 Shortcuts de Desarrollo

```bash
# Alias útiles (agregar a ~/.zshrc o ~/.bashrc)
alias dev="npm run dev"
alias build="npm run build"
alias vdeploy="vercel --prod"
alias vlogs="vercel logs --follow"
alias clean="rm -rf .next node_modules && npm install"
```

---

## 📚 Documentación

```bash
# Generar documentación de TypeScript
npx typedoc --out docs src

# Ver documentación localmente
cd docs && python -m http.server 8000

# Contar palabras en documentación
wc -w docs/*.md README.md
```

---

## 🚨 Troubleshooting Rápido

```bash
# Puerto 3000 ocupado
lsof -ti:3000 | xargs kill -9

# No puede conectar a Google Sheets
curl -v https://sheets.googleapis.com/v4/spreadsheets/[ID]

# Error de permisos en script
chmod +x scripts/*.sh

# Ver logs completos de Vercel
vercel logs [deployment-url] --output=raw > logs.txt

# Reiniciar sesión de Vercel
vercel logout
vercel login
```

---

## 🎨 Personalización

```bash
# Cambiar colores (editar tailwind.config.ts)
nano tailwind.config.ts

# Regenerar tipos después de cambios
npm run type-check

# Rebuild completo
npm run build
```

---

## 📊 Monitoring

```bash
# Ver uso de memoria
node --max-old-space-size=4096 node_modules/.bin/next build

# Ver size de build
ls -lh .next/static/chunks/

# Analizar qué páginas son más pesadas
du -sh .next/static/chunks/*
```

---

## 🔗 URLs Útiles

```bash
# Local
http://localhost:3000              # App
http://localhost:3000/api/auth     # Auth endpoints
http://localhost:3000/dashboard    # Dashboard

# Vercel
https://tu-proyecto.vercel.app     # Producción
https://vercel.com/dashboard       # Dashboard de Vercel

# Google
https://console.cloud.google.com/  # Cloud Console
https://sheets.google.com/         # Google Sheets
```

---

**💡 Tip:** Guarda este archivo en favoritos para acceso rápido a comandos comunes.
