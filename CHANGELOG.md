# Changelog

Historial de cambios y versiones del proyecto.

## [1.0.0] - 2026-02-19

### ✨ Características Principales

#### Autenticación
- Login con Google OAuth
- Validación de usuarios autorizados
- Sesiones JWT persistentes
- Protección de rutas

#### Gastos Simples
- Formulario de registro
- Validación de datos
- Guardado en Google Sheets
- Listado mensual

#### Gastos en Cuotas
- Formulario con cálculo automático de cuotas
- Soporte para reintegros
- Distribución progresiva de reintegros
- Generación automática de cuotas mensuales

#### Balance y Cálculos
- Cálculo automático de balance mensual
- Totales por persona
- Desglose de gastos simples vs cuotas
- Indicador de deudor y monto a compensar

#### Interfaz de Usuario
- Diseño responsive mobile-first
- Componentes reutilizables
- Animaciones suaves
- Loading states
- Manejo de errores

#### PWA (Progressive Web App)
- Manifest.json configurado
- Service Worker con next-pwa
- Instalable en iOS y Android
- Soporte offline básico

#### Google Sheets Integration
- Integración completa con Sheets API
- 4 hojas estructuradas
- Inicialización automática
- Service Account authentication

### 📚 Documentación
- README completo con todas las secciones
- Quick Start Guide
- Guía de configuración de Google Sheets
- Guía de deploy a Vercel
- Ejemplos de uso detallados
- Documentación de generación de iconos
- Diagramas de arquitectura
- API Reference

### 🛠️ Tecnologías
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- NextAuth.js
- Google Sheets API
- Vercel (hosting)

### 📦 Estructura del Proyecto
- Arquitectura modular y escalable
- Separación de responsabilidades
- Componentes reutilizables
- Servicios bien definidos
- Tipado completo con TypeScript

---

## [Próximas Versiones]

### [1.1.0] - Planificado
- [ ] Editar gastos existentes
- [ ] Eliminar gastos
- [ ] Categorías de gastos
- [ ] Filtros avanzados
- [ ] Búsqueda de gastos

### [1.2.0] - Planificado
- [ ] Gráficos de tendencias
- [ ] Exportar reportes a PDF
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Mejoras de performance

### [2.0.0] - Futuro
- [ ] Soporte para múltiples usuarios
- [ ] Grupos de gastos
- [ ] Múltiples monedas
- [ ] Integración bancaria
- [ ] App móvil nativa

---

## Formato

Este changelog sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

### Tipos de cambios
- **✨ Características**: Nuevas funcionalidades
- **🐛 Correcciones**: Bugs corregidos
- **🔒 Seguridad**: Vulnerabilidades resueltas
- **⚡ Performance**: Mejoras de rendimiento
- **♻️ Refactoring**: Cambios en el código sin afectar funcionalidad
- **📚 Documentación**: Cambios en docs
- **🎨 Estilos**: Cambios visuales
- **🧪 Tests**: Pruebas agregadas o modificadas
