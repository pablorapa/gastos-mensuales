# Guía de Deploy en Vercel

Esta guía detalla el proceso completo para deployar la aplicación en Vercel.

## 🚀 Método 1: Deploy con Vercel CLI

### 1. Instalación

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

Selecciona tu método de autenticación (GitHub, GitLab, Bitbucket o Email).

### 3. Deploy de Prueba

Desde la raíz del proyecto:

```bash
cd /Users/a125956/proyecto
vercel
```

Responde las preguntas:
- Set up and deploy? **Y**
- Which scope? (selecciona tu cuenta)
- Link to existing project? **N**
- Project name: `gastos-compartidos` (o el que prefieras)
- In which directory is your code located? `./`
- Want to override settings? **N**

Vercel detectará automáticamente Next.js y configurará todo.

### 4. Configurar Variables de Entorno

Agrega las variables una por una:

```bash
vercel env add GOOGLE_CLIENT_ID
# Pega el valor cuando te lo pida
# Selecciona: Production, Preview, Development (todas)

vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_SHEETS_PRIVATE_KEY
vercel env add GOOGLE_SHEETS_CLIENT_EMAIL
vercel env add GOOGLE_SPREADSHEET_ID
vercel env add AUTHORIZED_USERS
```

**Tips:**
- Para `NEXTAUTH_URL`, usa tu dominio de Vercel: `https://gastos-compartidos.vercel.app`
- Para `GOOGLE_SHEETS_PRIVATE_KEY`, pega toda la clave incluyendo `-----BEGIN PRIVATE KEY-----` y `\n`
- Para `AUTHORIZED_USERS`, separa los emails con comas: `manuel@gmail.com,pablo@gmail.com`

### 5. Deploy a Producción

```bash
vercel --prod
```

Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

---

## 🔄 Método 2: Deploy con GitHub

### 1. Crear Repositorio en GitHub

```bash
cd /Users/a125956/proyecto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/gastos-compartidos.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com/)
2. Clic en **"Add New..." → Project**
3. Importa tu repositorio de GitHub
4. Vercel detectará Next.js automáticamente
5. Clic en **Deploy**

### 3. Configurar Variables de Entorno

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | `123456...` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` |
| `NEXTAUTH_SECRET` | `tu_secret_aleatorio` |
| `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` |
| `GOOGLE_SHEETS_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | `service-account@project.iam.gserviceaccount.com` |
| `GOOGLE_SPREADSHEET_ID` | `1a2b3c4d5e6f...` |
| `AUTHORIZED_USERS` | `manuel@gmail.com,pablo@gmail.com` |

4. Selecciona los entornos: **Production**, **Preview**, **Development**
5. Clic en **Save**

### 4. Redeploy

1. Deployments → Latest deployment → ⋯ → Redeploy
2. Marca "Use existing Build Cache"
3. Clic en **Redeploy**

---

## ⚙️ Configuración Post-Deploy

### 1. Actualizar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. APIs y servicios → Credenciales
3. Edita tu cliente OAuth 2.0
4. En "URIs de redirección autorizados", agrega:
   ```
   https://tu-proyecto.vercel.app/api/auth/callback/google
   ```
5. Guarda los cambios

### 2. Verificar Google Sheets

1. Abre tu spreadsheet
2. Verifica que esté compartido con la service account
3. Permisos: **Editor**

### 3. Inicializar Base de Datos

Desde Postman, curl o el navegador:

```bash
curl -X POST https://tu-proyecto.vercel.app/api/init \
  -H "Cookie: next-auth.session-token=tu-token"
```

O simplemente inicia sesión en la app y las hojas se crearán automáticamente al primer uso.

---

## 🌐 Configurar Dominio Personalizado (Opcional)

### 1. En Vercel

1. Settings → Domains
2. Agrega tu dominio: `gastos.tudominio.com`
3. Vercel te dará los registros DNS

### 2. En tu Proveedor de DNS

Agrega un registro CNAME:
```
CNAME  gastos  cname.vercel-dns.com
```

### 3. Actualizar Variables

Actualiza `NEXTAUTH_URL`:
```bash
vercel env add NEXTAUTH_URL production
# Valor: https://gastos.tudominio.com
```

Y redeploy:
```bash
vercel --prod
```

---

## 📊 Monitoring

### Ver Logs

```bash
vercel logs tu-proyecto.vercel.app
```

O desde el dashboard: Deployments → Latest → View Function Logs

### Analytics

Vercel incluye analytics gratis:
- Settings → Analytics
- Activa "Audience" y "Web Vitals"

---

## 🔧 Troubleshooting

### Build falla con "Module not found"

Verifica que `package.json` tenga todas las dependencias:
```bash
npm install
```

Commitea los cambios y push.

### Variables de entorno no funcionan

- Verifica que estén configuradas para **Production**
- Redeploy después de agregar variables
- Las variables con `\n` deben pegarse con los `\n` literales

### Error 500 en producción

1. Revisa los logs: `vercel logs`
2. Verifica las credenciales de Google
3. Asegúrate que el spreadsheet esté compartido

### NextAuth redirect_uri_mismatch

- Verifica que la URL en Google OAuth coincida exactamente
- Incluye `https://`, sin `/` al final
- Revisa `NEXTAUTH_URL` en variables de entorno

### PWA no funciona

- Verifica que `next.config.js` incluya la config de PWA
- Los iconos deben estar en `/public/icons/`
- PWA solo funciona en HTTPS (Vercel usa HTTPS por defecto)

---

## 🔄 Deploy Continuo

Con GitHub conectado, cada push a `main` genera un deploy automático:

```bash
git add .
git commit -m "Nueva feature"
git push
```

Vercel:
1. Detecta el push
2. Corre `npm run build`
3. Deploya automáticamente
4. Te notifica por email

---

## 🚦 Ambientes

Vercel crea 3 ambientes automáticamente:

| Ambiente | Cuándo | URL |
|----------|--------|-----|
| **Production** | Push a `main` | `https://tu-proyecto.vercel.app` |
| **Preview** | Push a otras ramas o PR | `https://tu-proyecto-git-rama.vercel.app` |
| **Development** | Local con `vercel dev` | `http://localhost:3000` |

Puedes configurar variables diferentes para cada ambiente.

---

## 💰 Costos

Vercel es **gratis** para proyectos personales:

| Plan | Precio | Límites |
|------|--------|---------|
| **Hobby** | $0/mes | 100 GB bandwidth, Edge Functions ilimitadas |
| **Pro** | $20/mes | 1 TB bandwidth, analytics avanzados |

Para esta aplicación, el plan gratuito es suficiente.

---

## 📱 Verificar PWA

Después del deploy:

1. Abre la app en Chrome/Edge (Android) o Safari (iOS)
2. Chrome: Menu → "Instalar aplicación"
3. Safari: Compartir → "Agregar a pantalla de inicio"
4. Verifica que funcione offline (modo avión)

---

## 🔐 Seguridad

Vercel incluye:
- ✅ HTTPS automático
- ✅ Headers de seguridad
- ✅ Edge caching
- ✅ DDoS protection

Recomendaciones adicionales:
- Rota `NEXTAUTH_SECRET` cada 6 meses
- Revisa access logs periódicamente
- Mantén las dependencias actualizadas

---

## 🎯 Checklist Post-Deploy

- [ ] App desplegada y accesible
- [ ] Login con Google funciona
- [ ] Variables de entorno configuradas
- [ ] Google OAuth redirect configurado
- [ ] Spreadsheet compartido con service account
- [ ] Hojas inicializadas (`/api/init`)
- [ ] Crear gasto simple funciona
- [ ] Crear gasto en cuotas funciona
- [ ] Balance se calcula correctamente
- [ ] PWA instalable
- [ ] Funciona en móvil
- [ ] Logs sin errores

---

## 📚 Referencias

- [Vercel Docs](https://vercel.com/docs)
- [Deploy Next.js](https://nextjs.org/docs/deployment)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

---

**¡Tu aplicación está lista para producción! 🎉**
