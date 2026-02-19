# 💰 Gastos Compartidos - Manuel & Pablo

Aplicación web progresiva (PWA) para gestionar gastos compartidos entre dos personas, con integración a Google Sheets como base de datos.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
  - [Google OAuth](#1-configurar-google-oauth)
  - [Google Sheets API](#2-configurar-google-sheets-api)
  - [Variables de Entorno](#3-configurar-variables-de-entorno)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Deployment](#deployment)
- [Arquitectura](#arquitectura)
- [API Reference](#api-reference)

---

## ✨ Características

✅ **Gastos Simples**: Registra pagos únicos  
✅ **Gastos en Cuotas**: Compras con cuotas mensuales y reintegros  
✅ **Balance Automático**: Cálculo de quién debe compensar  
✅ **Google Sheets**: Base de datos sincronizada  
✅ **PWA**: Instalable en móviles (iOS/Android)  
✅ **Login Google**: Autenticación segura con OAuth  
✅ **Responsive**: Mobile-first design  
✅ **Hosting Gratuito**: Deploy en Vercel

---

## 🛠 Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| **Next.js 14** | Framework React con App Router y API Routes |
| **TypeScript** | Tipado estático y mejor DX |
| **Tailwind CSS** | Estilos modernos y responsive |
| **NextAuth.js** | Autenticación con Google OAuth |
| **Google Sheets API** | Base de datos en la nube |
| **next-pwa** | Progressive Web App |
| **Vercel** | Hosting serverless gratuito |

### ¿Por qué este stack?

- **Next.js**: SSR, API routes serverless, optimización automática, deploy sencillo
- **Google Sheets**: Sin costo, familiar, fácil de auditar, backups automáticos
- **Vercel**: Deploy con un comando, HTTPS gratis, edge functions
- **PWA**: Funciona offline, se instala como app nativa

---

## 📦 Requisitos Previos

- Node.js 18+ y npm 9+
- Cuenta de Google
- Cuenta de Vercel (gratis)

---

## 🚀 Instalación

```bash
# 1. Clonar o crear el proyecto
cd /Users/a125956/proyecto

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver sección siguiente)
cp .env.example .env

# 4. Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### 1. Configurar Google OAuth

Permite login con Google:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google+ API**
4. Ve a **Credenciales** → **Crear credenciales** → **ID de cliente OAuth 2.0**
5. Tipo de aplicación: **Aplicación web**
6. URIs de redirección autorizados:
   ```
   http://localhost:3000/api/auth/callback/google
   https://tu-dominio.vercel.app/api/auth/callback/google
   ```
7. Copia el **Client ID** y **Client Secret**

### 2. Configurar Google Sheets API

Permite acceso programático a las hojas de cálculo:

#### A. Crear Service Account

1. En [Google Cloud Console](https://console.cloud.google.com/), ve a **IAM y administración** → **Cuentas de servicio**
2. Clic en **Crear cuenta de servicio**
3. Nombre: `gastos-compartidos-api`
4. Rol: (no es necesario, los permisos se dan en el spreadsheet)
5. Clic en la cuenta creada → **Claves** → **Agregar clave** → **JSON**
6. Descarga el archivo JSON

#### B. Crear Spreadsheet

1. Ve a [Google Sheets](https://sheets.google.com/)
2. Crea una nueva hoja de cálculo
3. Copia el **ID del spreadsheet** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```
4. Compartir la hoja con el email de la service account (del JSON):
   ```
   gastos-compartidos-api@proyecto.iam.gserviceaccount.com
   ```
   ⚠️ Dale permisos de **Editor**

#### C. Estructura de las Hojas

La aplicación creará automáticamente 4 hojas:

| Hoja | Descripción |
|------|-------------|
| `gastos_simples` | Gastos de pago único |
| `gastos_cuotas` | Gastos con cuotas |
| `cuotas_mensuales` | Desglose mensual de cuotas |
| `balances` | Balance mensual calculado |

Para inicializar las hojas, usa el endpoint:
```bash
POST /api/init
```

### 3. Configurar Variables de Entorno

Edita el archivo `.env`:

```bash
# Google OAuth (de la consola de Google Cloud)
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456

# NextAuth (genera uno aleatorio con: openssl rand -base64 32)
NEXTAUTH_SECRET=tu_secret_aleatorio_muy_seguro_aqui
NEXTAUTH_URL=http://localhost:3000

# Google Sheets API (del archivo JSON descargado)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=gastos-compartidos-api@proyecto.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j

# Usuarios autorizados (emails separados por coma)
AUTHORIZED_USERS=manuel@gmail.com,pablo@gmail.com
```

⚠️ **Importante**: 
- El `GOOGLE_SHEETS_PRIVATE_KEY` debe incluir los `\n` literales
- Los emails en `AUTHORIZED_USERS` deben coincidir con los que harán login

---

## 📱 Uso

### Desarrollo

```bash
npm run dev       # Inicia servidor de desarrollo
npm run build     # Compila para producción
npm run start     # Inicia servidor de producción
npm run lint      # Verifica código
```

### Funcionalidades

#### 1. Login
- Accede a la aplicación con tu cuenta de Google
- Solo los emails en `AUTHORIZED_USERS` pueden ingresar

#### 2. Registrar Gasto Simple
1. Clic en "Agregar Gasto Simple"
2. Completa: concepto, monto, persona, fecha
3. Guardar

#### 3. Registrar Gasto en Cuotas
1. Clic en "Agregar Gasto en Cuotas"
2. Completa: concepto, monto total, cantidad de cuotas
3. Opcional: agrega un reintegro
4. Selecciona mes de inicio
5. Guardar

**Ejemplo de reintegro:**
- Compra de $600 en 6 cuotas de $100
- Reintegro de $180
- Resultado:
  - Cuota 1: $0 (cubierta por reintegro)
  - Cuota 2: $20 ($100 - $80 restante del reintegro)
  - Cuotas 3-6: $100 cada una

#### 4. Ver Balance
- El balance se calcula automáticamente
- Muestra totales por persona (simples + cuotas)
- Indica quién debe compensar y cuánto

#### 5. Cambiar de Mes
- Usa las flechas o el selector de mes
- Los gastos simples y cuotas se filtran por mes

---

## 📂 Estructura del Proyecto

```
proyecto/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/            # NextAuth endpoints
│   │   │   ├── gastos/          # CRUD de gastos
│   │   │   ├── balance/         # Cálculo de balance
│   │   │   └── init/            # Inicialización de sheets
│   │   ├── dashboard/           # Página principal
│   │   ├── layout.tsx           # Layout global
│   │   ├── page.tsx             # Página de login
│   │   ├── providers.tsx        # Context providers
│   │   └── globals.css          # Estilos globales
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes genéricos
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Loading.tsx
│   │   └── gastos/              # Componentes específicos
│   │       ├── FormularioGastoSimple.tsx
│   │       ├── FormularioGastoCuotas.tsx
│   │       ├── BalanceCard.tsx
│   │       └── ListaGastos.tsx
│   ├── lib/                     # Lógica de negocio
│   │   ├── googleSheets.ts      # Integración con Sheets API
│   │   └── utils.ts             # Utilidades
│   └── types/                   # Tipos TypeScript
│       └── index.ts
├── public/                      # Archivos estáticos
│   ├── icons/                   # Iconos PWA
│   └── manifest.json            # Manifiesto PWA
├── next.config.js               # Configuración Next.js + PWA
├── tailwind.config.ts           # Configuración Tailwind
├── tsconfig.json                # Configuración TypeScript
├── package.json                 # Dependencias
└── README.md                    # Esta documentación
```

---

## 🚀 Deployment

### Deploy en Vercel (Recomendado)

Vercel es gratis y optimizado para Next.js:

#### Opción 1: Deploy con CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configurar variables de entorno en Vercel
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_SHEETS_PRIVATE_KEY
vercel env add GOOGLE_SHEETS_CLIENT_EMAIL
vercel env add GOOGLE_SPREADSHEET_ID
vercel env add AUTHORIZED_USERS

# 5. Deploy producción
vercel --prod
```

#### Opción 2: Deploy con GitHub

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com/)
3. Clic en "Import Project"
4. Selecciona tu repositorio
5. Agrega las variables de entorno en Settings → Environment Variables
6. Deploy automático en cada push

#### Configuración Post-Deploy

1. Actualiza `NEXTAUTH_URL` a tu dominio de Vercel:
   ```
   https://gastos-compartidos.vercel.app
   ```

2. Agrega la URL a Google OAuth:
   - Google Cloud Console → Credenciales
   - Edita el cliente OAuth
   - Agrega a URIs autorizados:
     ```
     https://tu-app.vercel.app/api/auth/callback/google
     ```

### Deploy en Netlify (Alternativa)

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Inicializar
netlify init

# 4. Deploy
netlify deploy --prod
```

---

## 🏗 Arquitectura

### Flujo de Datos

```
Usuario → Next.js App → API Routes → Google Sheets
                     ↓
                NextAuth (Google OAuth)
```

### Componentes Principales

#### 1. Autenticación
- **NextAuth.js** maneja login con Google
- Solo usuarios en `AUTHORIZED_USERS` pueden acceder
- Sesiones JWT con 30 días de validez

#### 2. API Routes (Serverless)
- `POST /api/gastos/simple` - Crear gasto simple
- `POST /api/gastos/cuotas` - Crear gasto en cuotas
- `GET /api/gastos?mes=YYYY-MM` - Obtener gastos del mes
- `GET /api/balance?mes=YYYY-MM` - Calcular balance
- `POST /api/init` - Inicializar spreadsheet

#### 3. Google Sheets
- Service Account con permisos de editor
- 4 hojas: gastos_simples, gastos_cuotas, cuotas_mensuales, balances
- Sincronización en tiempo real

#### 4. PWA
- Manifest.json con iconos
- Service Worker para cache
- Instalable en dispositivos móviles

### Cálculo de Cuotas con Reintegro

```typescript
// Ejemplo: 6 cuotas de $100 con reintegro de $180
let reintegroRestante = 180;

for (let i = 0; i < 6; i++) {
  const montoOriginal = 100;
  let montoCuota = montoOriginal;
  
  if (reintegroRestante >= montoOriginal) {
    // Reintegro cubre toda la cuota
    montoCuota = 0;
    reintegroRestante -= montoOriginal;
  } else if (reintegroRestante > 0) {
    // Reintegro cubre parte
    montoCuota = montoOriginal - reintegroRestante;
    reintegroRestante = 0;
  }
  
  // Cuota 1: $0, Cuota 2: $20, Cuotas 3-6: $100
}
```

---

## 📖 API Reference

### POST /api/gastos/simple

Crea un gasto simple.

**Body:**
```json
{
  "concepto": "Supermercado",
  "monto": 150.50,
  "persona": "Manuel",
  "fecha": "2024-03-15"
}
```

**Response:**
```json
{
  "success": true,
  "id": "GS-1710523456789"
}
```

### POST /api/gastos/cuotas

Crea un gasto en cuotas.

**Body:**
```json
{
  "concepto": "Notebook",
  "montoTotal": 600,
  "cantidadCuotas": 6,
  "montoPorCuota": 100,
  "mesInicio": "2024-03",
  "reintegro": 180,
  "persona": "Pablo",
  "fecha": "2024-03-15"
}
```

**Response:**
```json
{
  "success": true,
  "id": "GC-1710523456789"
}
```

### GET /api/gastos?mes=YYYY-MM

Obtiene todos los gastos de un mes.

**Response:**
```json
{
  "gastosSimples": [
    {
      "id": "GS-123",
      "concepto": "Supermercado",
      "monto": 150,
      "persona": "Manuel",
      "fecha": "2024-03-15"
    }
  ],
  "cuotasMensuales": [
    {
      "id": "CM-456-1",
      "gastoId": "GC-456",
      "concepto": "Notebook",
      "mes": "2024-03",
      "numeroCuota": 1,
      "montoCuota": 0,
      "montoOriginal": 100,
      "reintegroAplicado": 100,
      "persona": "Pablo"
    }
  ]
}
```

### GET /api/balance?mes=YYYY-MM

Calcula el balance del mes.

**Response:**
```json
{
  "mes": "2024-03",
  "totalManuel": 250,
  "totalPablo": 100,
  "diferencia": 150,
  "deudor": "Pablo",
  "montoACompensar": 75,
  "gastosSimples": {
    "Manuel": 150,
    "Pablo": 100
  },
  "gastosCuotas": {
    "Manuel": 100,
    "Pablo": 0
  }
}
```

---

## 🔧 Troubleshooting

### Error: "No autorizado"
- Verifica que tu email esté en `AUTHORIZED_USERS`
- Revisa las credenciales de Google OAuth

### Error: "Faltan credenciales de Google Sheets"
- Verifica `GOOGLE_SHEETS_PRIVATE_KEY` y `GOOGLE_SHEETS_CLIENT_EMAIL`
- Asegúrate que la clave privada incluya `\n`

### Error: "Permission denied" en Sheets
- Comparte el spreadsheet con el email de la service account
- Dale permisos de "Editor"

### PWA no se instala
- Genera los iconos en `/public/icons/`
- Verifica que esté en HTTPS (no funciona en HTTP)
- Usa Chrome/Edge en Android o Safari en iOS

---

## 📄 Licencia

Este proyecto es privado y de uso personal.

---

## 👥 Autores

Desarrollado para gestionar gastos entre **Manuel** y **Pablo**.

---

## 🎯 Próximas Mejoras (Roadmap)

- [ ] Exportar reportes a PDF
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Gráficos de gastos
- [ ] Categorías de gastos
- [ ] Múltiples monedas
- [ ] Historial completo

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la documentación
2. Verifica los logs en Vercel
3. Revisa las credenciales de Google

---

**¡Listo para usar! 🚀**

Para iniciar: `npm install && npm run dev`
