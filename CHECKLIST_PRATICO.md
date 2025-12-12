#!/bin/bash

# 📋 CHECKLIST PRÁTICO - Validação da Implementação
# 
# Copie e cole cada comando no terminal para verificar
# Cada ✅ confirmado = funcionalidade validada

echo "════════════════════════════════════════════════════════════════"
echo "📋 CHECKLIST DE VALIDAÇÃO - Implementação 3 Módulos"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}PASSO 1: Verificar Backend${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Comando 1.1: Backend server rodando?${NC}"
echo "curl -s http://localhost:8000/api/certifications/categories/ | jq '.results | length'"
echo -e "${YELLOW}Esperado: Um número inteiro (ex: 3)${NC}"
echo ""

echo -e "${YELLOW}Comando 1.2: Marketplace endpoints acessíveis?${NC}"
echo "curl -s -H \"Authorization: Bearer YOUR_TOKEN\" http://localhost:8000/api/marketplace/listings/ | jq '.results | length'"
echo -e "${YELLOW}Esperado: Um número inteiro (ex: 5)${NC}"
echo ""

echo -e "${YELLOW}Comando 1.3: Kixikila endpoints acessíveis?${NC}"
echo "curl -s -H \"Authorization: Bearer YOUR_TOKEN\" http://localhost:8000/api/kixikila/groups/ | jq '.results | length'"
echo -e "${YELLOW}Esperado: Um número inteiro (ex: 2)${NC}"
echo ""

echo -e "${BLUE}PASSO 2: Verificar Frontend - Compilação${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Comando 2.1: Verificar se os 3 arquivos .tsx existem${NC}"
echo "ls -lh frontend/src/pages/{CertificationsPage,MarketplacePage,KixikilaPage}.tsx"
echo -e "${YELLOW}Esperado: 3 arquivos listados${NC}"
echo ""

echo -e "${YELLOW}Comando 2.2: Verificar se as rotas estão em App.tsx${NC}"
echo "grep -c 'path=\"/certifications\\|path=\"/marketplace\\|path=\"/kixikila\"' frontend/src/App.tsx"
echo -e "${YELLOW}Esperado: 3 (uma para cada rota)${NC}"
echo ""

echo -e "${YELLOW}Comando 2.3: Compilar frontend sem erros${NC}"
echo "cd frontend && npm run build 2>&1 | grep -i 'error\\|fail'"
echo -e "${YELLOW}Esperado: Sem output (sem erros)${NC}"
echo ""

echo -e "${BLUE}PASSO 3: Verificar Frontend - Runtime${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Comando 3.1: Frontend dev server rodando?${NC}"
echo "curl -s http://localhost:3000 | grep '<title>Acredita</title>'"
echo -e "${YELLOW}Esperado: Uma linha com <title>Acredita</title>${NC}"
echo ""

echo -e "${BLUE}PASSO 4: Testes Manuais no Browser${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Manual 4.1: Testar Certifications Page${NC}"
echo "1. Abrir: http://localhost:3000/certifications"
echo "2. Verificar:"
echo "   ✅ Página carrega sem 404"
echo "   ✅ Título 'Programas de Certificação' visível"
echo "   ✅ Categorias aparecem em cards"
echo "   ✅ Ao clicar categoria → lista de programas"
echo "   ✅ Search filtra programas"
echo "   ✅ Console não mostra erros vermelhos"
echo ""

echo -e "${YELLOW}Manual 4.2: Testar Marketplace Page${NC}"
echo "1. Abrir: http://localhost:3000/marketplace"
echo "2. Verificar:"
echo "   ✅ Página carrega sem 404"
echo "   ✅ Título 'Marketplace de Serviços' visível"
echo "   ✅ Serviços aparecem em grid"
echo "   ✅ Search funciona com debounce"
echo "   ✅ Filtro por categoria funciona"
echo "   ✅ Range de preço funciona"
echo "   ✅ Toggle 'Meus Serviços' (se autenticado)"
echo "   ✅ Console não mostra erros"
echo ""

echo -e "${YELLOW}Manual 4.3: Testar Kixikila Page${NC}"
echo "1. Abrir: http://localhost:3000/kixikila"
echo "2. Verificar:"
echo "   ✅ Página carrega sem 404"
echo "   ✅ Título 'Associações Comunitárias' visível"
echo "   ✅ Grupos aparecem em cards"
echo "   ✅ Search funciona"
echo "   ✅ Toggle 'Meus Grupos' funciona"
echo "   ✅ Badges de status (Ativo/Inativo) aparecem"
echo "   ✅ Stats (membros, contribuições) aparecem"
echo "   ✅ Console não mostra erros"
echo ""

echo -e "${BLUE}PASSO 5: Testes de API (via Network Tab)${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Network 5.1: Ao abrir /certifications${NC}"
echo "Procurar requests:"
echo "  GET /api/certifications/categories/ → 200 OK"
echo "  GET /api/certifications/programs/ → 200 OK"
echo ""

echo -e "${YELLOW}Network 5.2: Ao abrir /marketplace${NC}"
echo "Procurar requests:"
echo "  GET /api/marketplace/categories/ → 200 OK"
echo "  GET /api/marketplace/listings/ → 200 OK"
echo ""

echo -e "${YELLOW}Network 5.3: Ao abrir /kixikila${NC}"
echo "Procurar requests:"
echo "  GET /api/kixikila/groups/ → 200 OK"
echo ""

echo -e "${BLUE}PASSO 6: Verificar Authentication${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Auth 6.1: Sem login → redireciona para /login?${NC}"
echo "1. Abrir http://localhost:3000/certifications (sem estar logado)"
echo "2. Esperado: Redireciona para http://localhost:3000/login"
echo ""

echo -e "${YELLOW}Auth 6.2: Com login → acessa as páginas?${NC}"
echo "1. Fazer login em http://localhost:3000/login"
echo "2. Verificar localStorage:"
echo "   localStorage.getItem('access_token') → deve ter um JWT"
echo "3. Navegar para /certifications, /marketplace, /kixikila"
echo "4. Esperado: Todas as páginas carregam"
echo ""

echo -e "${BLUE}PASSO 7: Verificar Responsividade${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Responsive 7.1: Desktop (1920x1080)${NC}"
echo "F12 → Toggle device toolbar → Desktop"
echo "Verificar: Grid com 3 colunas"
echo ""

echo -e "${YELLOW}Responsive 7.2: Tablet (768x1024)${NC}"
echo "F12 → iPad dimensions"
echo "Verificar: Grid com 2 colunas"
echo ""

echo -e "${YELLOW}Responsive 7.3: Mobile (375x667)${NC}"
echo "F12 → iPhone dimensions"
echo "Verificar: Grid com 1 coluna, menu funciona"
echo ""

echo -e "${BLUE}PASSO 8: Verificar Error Handling${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Error 8.1: Backend desligado${NC}"
echo "1. Parar Django server"
echo "2. Tentar abrir /certifications"
echo "3. Esperado: Toast com erro \"Erro ao carregar categorias\""
echo "4. Reiniciar Django server"
echo ""

echo -e "${YELLOW}Error 8.2: Token inválido${NC}"
echo "1. Abrir DevTools Console"
echo "2. Executar: localStorage.setItem('access_token', 'invalid')"
echo "3. Recarregar página"
echo "4. Esperado: ApiClient tenta refresh automaticamente"
echo ""

echo -e "${BLUE}PASSO 9: Verificar Performance${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Performance 9.1: Tamanho do bundle${NC}"
echo "cd frontend && npm run build"
echo "du -sh build/"
echo -e "${YELLOW}Esperado: < 500KB${NC}"
echo ""

echo -e "${YELLOW}Performance 9.2: Lighthouse score${NC}"
echo "F12 → Lighthouse → Analyze page load"
echo -e "${YELLOW}Esperado: Performance > 80, Accessibility > 85${NC}"
echo ""

echo -e "${BLUE}PASSO 10: Verificar Tipos TypeScript${NC}"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Types 10.1: Type checking completo${NC}"
echo "cd frontend && npx tsc --noEmit"
echo -e "${YELLOW}Esperado: Sem output (sem errors)${NC}"
echo ""

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ CHECKLIST CONCLUÍDO!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Se todos os testes passaram: 🎉 PRONTO PARA PRODUCTION"
echo ""
echo "Se algum teste falhou:"
echo "1. Ver arquivo: docs/IMPLEMENTACAO_PAGINAS_3_MODULOS.md"
echo "2. Ver troubleshooting: docs/CONTINUACAO_IMPLEMENTACAO_10DEC.md"
echo "3. Verificar logs:"
echo "   - Backend: python manage.py runserver (output no terminal)"
echo "   - Frontend: npm start (console.log + warnings)"
echo ""

# ✅ CHECKLIST PRÁTICO DE VALIDAÇÃO

# 🚦 PRIORIDADES MÁXIMAS PARA ENTREGA

**1. Sistema deve estar funcional ponta-a-ponta:**
- [ ] Backend rodando e endpoints principais respondendo 200 OK
- [ ] Frontend compila sem erros e carrega as 3 páginas principais
- [ ] Login/autenticação funcionando (ProtectedRoute redireciona corretamente)
- [ ] Todas as rotas dos módulos carregam dados reais do backend

**2. Funcionalidades essenciais de cada módulo:**
- [ ] Certifications: Listar categorias, programas, pesquisar, inscrever
- [ ] Marketplace: Listar serviços, pesquisar, filtrar, criar serviço
- [ ] Kixikila: Listar grupos, pesquisar, toggle "Meus Grupos", estatísticas

**3. Qualidade e experiência do usuário:**
- [ ] Sem erros vermelhos no console do navegador
- [ ] Sem 404/500 no Network tab
- [ ] Layout responsivo e usável em mobile/desktop
- [ ] Toasts de erro amigáveis e feedback visual

**4. Pronto para staging/deploy:**
- [ ] Testes unitários e integração passam
- [ ] Documentação revisada e atualizada
- [ ] Checklist validado por pelo menos 1 QA/dev

---

**Como usar:**
- Marque cada item conforme for validando.
- Se algum item falhar, consulte a seção de troubleshooting ou documentação.
- Checklist pronta para revisão de QA e deploy!

---

# 🗺️ ROADMAP DE VALIDAÇÃO E ENTREGA

**Etapa 1: Validação Técnica**
- [ ] Backend e frontend rodando sem erros
- [ ] Testar login, rotas e principais funcionalidades dos 3 módulos
- [ ] Validar responsividade e ausência de erros no console

**Etapa 2: Testes e QA**
- [ ] Executar testes unitários e integração
- [ ] Validar flows críticos (cadastro, filtros, ações principais)
- [ ] Checklist revisado por QA/dev

**Etapa 3: Documentação e Preparação para Deploy**
- [ ] Atualizar documentação técnica e de uso
- [ ] Validar scripts/checklists de troubleshooting
- [ ] Aprovação final para staging

**Etapa 4: Deploy Staging/Produção**
- [ ] Deploy em ambiente de staging
- [ ] Testes finais de aceitação
- [ ] Go-live produção

---

*Este roadmap complementa o checklist, sem repetir itens já validados acima. Use como guia de progresso macro para a entrega.*

*Atualizado em 09/12/2025 por GitHub Copilot*
