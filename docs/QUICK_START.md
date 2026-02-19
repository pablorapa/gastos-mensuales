# Guía de Inicio Rápido (Quick Start)

Pon la aplicación en marcha en **10 minutos**.

## ⚡ Pasos Rápidos

### 1. Instalar Dependencias (2 min)

```bash
cd /Users/a125956/proyecto
npm install
```

### 2. Configurar Google OAuth (3 min)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea proyecto → Habilita Google+ API
3. Credenciales → OAuth 2.0 Client ID
4. Tipo: **Web Application**
5. Redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copia **Client ID** y **Client Secret**

### 3. Configurar Google Sheets (3 min)

1. Cloud Console → IAM → Service Accounts
2. Crear cuenta → Descargar JSON
3. Crear [nuevo spreadsheet](https://sheets.google.com/)
4. Compartir con email de service account (del JSON)
5. Rol: **Editor**
6. Copiar ID del spreadsheet (de la URL)

### 4. Variables de Entorno (1 min)

```bash
cp .env.example .env
nano .env  # o usa tu editor favorito
```

Edita `.env` con tus credenciales:

```bash
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
NEXTAUTH_SECRET=genera_uno_aleatorio
NEXTAUTH_URL=http://localhost:3000

GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEETS_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=1a2b3c4d5e...

AUTHORIZED_USERS=manuel@gmail.com,pablo@gmail.com
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Iniciar Aplicación (1 min)

```bash
npm run dev
```

Abre: [http://localhost:3000](http://localhost:3000)

---

## ✅ Verificación

### Test 1: Login
1. Clic en "Iniciar sesión con Google"
2. Selecciona tu cuenta (debe estar en `AUTHORIZED_USERS`)
3. Deberías ver el dashboard

### Test 2: Inicializar Hojas
1. Abre DevTools (F12)
2. En Console, ejecuta:
```javascript
fetch('/api/init', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```
3. Verifica que el spreadsheet tenga 4 hojas nuevas

### Test 3: Crear Gasto
1. Clic en "Agregar Gasto Simple"
2. Completa:
   - Concepto: `Test`
   - Monto: `100`
   - Persona: `Manuel`
3. Guarda
4. Verifica en Google Sheets que aparezca

---

## 🚨 Problemas Comunes

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Cannot connect to Google Sheets"
- Verifica que el spreadsheet esté compartido
- Revisa que la clave privada incluya `\n` literales

### "Access denied" al login
- Verifica que tu email esté en `AUTHORIZED_USERS`
- Sin espacios: `email1@gmail.com,email2@gmail.com`

### Puerto 3000 en uso
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

## 📁 Estructura Mínima

Archivos esenciales que **debes** tener:

```
proyecto/
├── .env                    ← Tus credenciales
├── package.json            ← Dependencias
├── next.config.js          ← Config Next.js + PWA
├── src/
│   ├── app/
│   │   ├── api/            ← API routes
│   │   ├── dashboard/      ← Página principal
│   │   ├── page.tsx        ← Login
│   │   └── layout.tsx      ← Layout global
│   ├── components/         ← Componentes UI
│   ├── lib/                ← Lógica negocio
│   └── types/              ← Tipos TypeScript
└── public/
    └── manifest.json       ← PWA manifest
```

---

## 🎯 Siguientes Pasos

Una vez que funcione localmente:

1. **Úsala por 1 semana** para probarla
2. **Deploy a Vercel**: `npm i -g vercel && vercel`
3. **Configura PWA**: Genera iconos y prueba instalación
4. **Personaliza**: Ajusta colores, logos, textos

---

## 📚 Documentación Completa

- [README.md](../README.md) - Documentación principal
- [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) - Setup detallado de Sheets
- [DEPLOY.md](./DEPLOY.md) - Deploy a producción
- [EJEMPLOS.md](./EJEMPLOS.md) - Casos de uso

---

## 💬 ¿Necesitas Ayuda?

1. Revisa los logs: `npm run dev` (ver errores en terminal)
2. Verifica configuración: `cat .env | grep -v PRIVATE_KEY`
3. Prueba APIs:
   ```bash
   # Test de autenticación
   curl http://localhost:3000/api/auth/providers
   
   # Test de balance (requiere login)
   curl http://localhost:3000/api/balance?mes=2024-03
   ```

---

**¡Listo para usar en 10 minutos! 🚀**

Si todo funciona, deberías poder:
- ✅ Login con Google
- ✅ Ver dashboard
- ✅ Crear gastos
- ✅ Ver balances
- ✅ Sincronizar con Google Sheets
