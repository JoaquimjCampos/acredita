#!/usr/bin/env bash

# 🚀 SCRIPT DE VERIFICAÇÃO - Integração Frontend 3 Módulos
# 
# Verifica se a implementação das 3 páginas está correta
# Uso: bash verify_integration.sh

echo "🔍 Verificando integração frontend dos 3 módulos..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar arquivos criados
echo "📁 Verificando arquivos criados..."
files_check=(
    "frontend/src/pages/CertificationsPage.tsx"
    "frontend/src/pages/MarketplacePage.tsx"
    "frontend/src/pages/KixikilaPage.tsx"
    "frontend/src/pages/IntegrationTests.spec.tsx"
    "docs/IMPLEMENTACAO_PAGINAS_3_MODULOS.md"
)

for file in "${files_check[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo -e "${GREEN}✅${NC} $file ($lines linhas)"
    else
        echo -e "${RED}❌${NC} $file NÃO ENCONTRADO"
    fi
done

echo ""

# 2. Verificar imports em App.tsx
echo "🔗 Verificando imports em App.tsx..."
if grep -q "import CertificationsPage from" frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} CertificationsPage importada"
else
    echo -e "${RED}❌${NC} CertificationsPage não importada"
fi

if grep -q "import MarketplacePage from" frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} MarketplacePage importada"
else
    echo -e "${RED}❌${NC} MarketplacePage não importada"
fi

if grep -q "import KixikilaPage from" frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} KixikilaPage importada"
else
    echo -e "${RED}❌${NC} KixikilaPage não importada"
fi

echo ""

# 3. Verificar rotas em App.tsx
echo "🛣️  Verificando rotas em App.tsx..."
if grep -q 'path="/certifications"' frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} Rota /certifications adicionada"
else
    echo -e "${RED}❌${NC} Rota /certifications não encontrada"
fi

if grep -q 'path="/marketplace"' frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} Rota /marketplace adicionada"
else
    echo -e "${RED}❌${NC} Rota /marketplace não encontrada"
fi

if grep -q 'path="/kixikila"' frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} Rota /kixikila adicionada"
else
    echo -e "${RED}❌${NC} Rota /kixikila não encontrada"
fi

echo ""

# 4. Verificar service imports
echo "📦 Verificando service imports..."
if grep -q "import CertificationsService from" frontend/src/pages/CertificationsPage.tsx; then
    echo -e "${GREEN}✅${NC} CertificationsService importado"
else
    echo -e "${RED}❌${NC} CertificationsService não importado"
fi

if grep -q "import MarketplaceService from" frontend/src/pages/MarketplacePage.tsx; then
    echo -e "${GREEN}✅${NC} MarketplaceService importado"
else
    echo -e "${RED}❌${NC} MarketplaceService não importado"
fi

if grep -q "import KixikilaService from" frontend/src/pages/KixikilaPage.tsx; then
    echo -e "${GREEN}✅${NC} KixikilaService importado"
else
    echo -e "${RED}❌${NC} KixikilaService não importado"
fi

echo ""

# 5. Verificar ProtectedRoute
echo "🔐 Verificando ProtectedRoute..."
if grep -q "<ProtectedRoute><CertificationsPage" frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} CertificationsPage protegida"
else
    echo -e "${RED}❌${NC} CertificationsPage não protegida"
fi

if grep -q "<ProtectedRoute><MarketplacePage" frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} MarketplacePage protegida"
else
    echo -e "${RED}❌${NC} MarketplacePage não protegida"
fi

if grep -q "<ProtectedRoute><KixikilaPage" frontend/src/App.tsx; then
    echo -e "${GREEN}✅${NC} KixikilaPage protegida"
else
    echo -e "${RED}❌${NC} KixikilaPage não protegida"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ VERIFICAÇÃO CONCLUÍDA!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Próximos passos:"
echo "1. Iniciar backend: python manage.py runserver"
echo "2. Iniciar frontend: npm start"
echo "3. Fazer login: http://localhost:3000/login"
echo "4. Testar rotas:"
echo "   - http://localhost:3000/certifications"
echo "   - http://localhost:3000/marketplace"
echo "   - http://localhost:3000/kixikila"
echo ""
