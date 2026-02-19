#!/bin/bash

# Script de verificación del proyecto
# Verifica que todos los archivos necesarios existen y están correctos

echo "🔍 Verificando Proyecto: Gastos Compartidos"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 - FALTA"
        ((FAILED++))
        return 1
    fi
}

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1/ - FALTA"
        ((FAILED++))
        return 1
    fi
}

# Función para verificar archivo con warning si falta
check_file_warning() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 - OPCIONAL (puede estar en .gitignore)"
        ((WARNINGS++))
        return 1
    fi
}

echo "📦 Archivos de Configuración"
echo "----------------------------"
check_file "package.json"
check_file "tsconfig.json"
check_file "next.config.js"
check_file "tailwind.config.ts"
check_file "postcss.config.js"
check_file ".env.example"
check_file ".gitignore"
echo ""

echo "📚 Documentación Principal"
echo "-------------------------"
check_file "README.md"
check_file "RESUMEN.md"
check_file "ESTRUCTURA.md"
check_file "CHANGELOG.md"
check_file "LICENSE"
echo ""

echo "📖 Documentación Adicional"
echo "-------------------------"
check_file "docs/INDEX.md"
check_file "docs/QUICK_START.md"
check_file "docs/GOOGLE_SHEETS_SETUP.md"
check_file "docs/DEPLOY.md"
check_file "docs/EJEMPLOS.md"
check_file "docs/ICONOS.md"
check_file "docs/COMANDOS.md"
echo ""

echo "🔧 Scripts"
echo "---------"
check_file "scripts/generate-icons.sh"
echo ""

echo "🌐 PWA"
echo "-----"
check_file "public/manifest.json"
check_file "public/icons/README.md"
echo ""

echo "📂 Estructura de Directorios"
echo "----------------------------"
check_dir "src"
check_dir "src/app"
check_dir "src/app/api"
check_dir "src/app/api/auth/[...nextauth]"
check_dir "src/app/api/gastos"
check_dir "src/app/api/balance"
check_dir "src/app/api/init"
check_dir "src/app/dashboard"
check_dir "src/components"
check_dir "src/components/ui"
check_dir "src/components/gastos"
check_dir "src/lib"
check_dir "src/types"
check_dir "public"
check_dir "public/icons"
check_dir "docs"
check_dir "scripts"
echo ""

echo "🎨 Componentes UI"
echo "---------------"
check_file "src/components/ui/Button.tsx"
check_file "src/components/ui/Card.tsx"
check_file "src/components/ui/Input.tsx"
check_file "src/components/ui/Select.tsx"
check_file "src/components/ui/Loading.tsx"
echo ""

echo "💰 Componentes de Gastos"
echo "-----------------------"
check_file "src/components/gastos/FormularioGastoSimple.tsx"
check_file "src/components/gastos/FormularioGastoCuotas.tsx"
check_file "src/components/gastos/BalanceCard.tsx"
check_file "src/components/gastos/ListaGastos.tsx"
echo ""

echo "📄 Páginas"
echo "---------"
check_file "src/app/page.tsx"
check_file "src/app/layout.tsx"
check_file "src/app/providers.tsx"
check_file "src/app/globals.css"
check_file "src/app/dashboard/page.tsx"
echo ""

echo "🔌 API Routes"
echo "------------"
check_file "src/app/api/auth/[...nextauth]/route.ts"
check_file "src/app/api/gastos/route.ts"
check_file "src/app/api/gastos/simple/route.ts"
check_file "src/app/api/gastos/cuotas/route.ts"
check_file "src/app/api/balance/route.ts"
check_file "src/app/api/init/route.ts"
echo ""

echo "📚 Librerías y Utilidades"
echo "------------------------"
check_file "src/lib/googleSheets.ts"
check_file "src/lib/utils.ts"
check_file "src/types/index.ts"
echo ""

echo "🔧 Archivos Opcionales"
echo "---------------------"
check_file_warning ".env"
check_file_warning "node_modules"
check_file_warning ".next"
echo ""

echo "=========================================="
echo "📊 Resumen de Verificación"
echo "=========================================="
echo -e "${GREEN}✓ Pasados:${NC} $PASSED"
echo -e "${RED}✗ Fallidos:${NC} $FAILED"
echo -e "${YELLOW}⚠ Advertencias:${NC} $WARNINGS"
echo ""

# Verificaciones adicionales
echo "🔍 Verificaciones Adicionales"
echo "=========================================="

# Verificar package.json tiene las dependencias clave
if grep -q "next" package.json && grep -q "react" package.json; then
    echo -e "${GREEN}✓${NC} package.json contiene dependencias principales"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} package.json falta dependencias principales"
    ((FAILED++))
fi

# Verificar que README tiene contenido sustancial
if [ $(wc -l < README.md) -gt 100 ]; then
    echo -e "${GREEN}✓${NC} README.md tiene contenido completo ($(wc -l < README.md) líneas)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} README.md parece incompleto"
    ((FAILED++))
fi

# Contar archivos TypeScript
TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
echo -e "${GREEN}ℹ${NC} Archivos TypeScript/TSX: $TS_FILES"

# Contar archivos de documentación
DOC_FILES=$(find . -name "*.md" | wc -l)
echo -e "${GREEN}ℹ${NC} Archivos de documentación: $DOC_FILES"

echo ""
echo "=========================================="

# Resultado final
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡VERIFICACIÓN EXITOSA!${NC}"
    echo "El proyecto está completo y listo para usar."
    exit 0
else
    echo -e "${RED}❌ VERIFICACIÓN FALLIDA${NC}"
    echo "Faltan $FAILED archivos/directorios necesarios."
    echo "Revisa los archivos marcados con ✗"
    exit 1
fi
