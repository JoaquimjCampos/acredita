# 🧪 Plano de Testes - Homepage Simplificada

## 📋 Resumo Executivo

Este documento detalha o plano de testes para validar as melhorias de UX/UI implementadas na homepage da plataforma Acredita.

**Data**: 24 Dezembro 2025
**Versão**: 2.0 (Simplificada)
**Responsável**: Equipa de Qualidade Acredita

---

## 🎯 Objetivos dos Testes

1. Validar que todas as funcionalidades continuam operacionais
2. Confirmar melhorias de performance
3. Verificar responsividade em diferentes dispositivos
4. Assegurar acessibilidade (WCAG 2.1 AA)
5. Medir impacto nas métricas de conversão

---

## 🔍 Testes Funcionais

### 1. Hero Section

#### Caso de Teste: HER-001 - Navegação CTAs
**Pré-condição**: Usuário não autenticado na homepage
**Passos**:
1. Clicar em "Começar Grátis"
2. Verificar redirecionamento para `/registo`
3. Voltar à homepage
4. Clicar em "Ver Temporadas"
5. Verificar redirecionamento para `/temporadas`

**Resultado Esperado**: Navegação sem erros, URLs corretos
**Prioridade**: 🔴 Crítica

---

#### Caso de Teste: HER-002 - Estado Autenticado
**Pré-condição**: Usuário autenticado na homepage
**Passos**:
1. Verificar que o botão mostra "Meu Dashboard"
2. Clicar no botão
3. Verificar redirecionamento para `/dashboard`

**Resultado Esperado**: Botão adapta-se ao estado de autenticação
**Prioridade**: 🟡 Alta

---

### 2. Resumo Rápido (Autenticado)

#### Caso de Teste: RES-001 - Exibição de Stats
**Pré-condição**: Usuário autenticado com dados no perfil
**Passos**:
1. Verificar se a seção "Resumo rápido" aparece
2. Validar exibição do Trust Score
3. Validar exibição de Certificações
4. Validar exibição de Vendas Marketplace
5. Validar exibição de Ciclos Kixikila

**Resultado Esperado**: Todos os stats visíveis e com valores corretos
**Prioridade**: 🟡 Alta

---

#### Caso de Teste: RES-002 - Navegação Perfil/Dashboard
**Pré-condição**: Usuário autenticado na homepage
**Passos**:
1. Clicar em "Ver Perfil"
2. Verificar navegação para `/perfil`
3. Voltar à homepage
4. Clicar em "Ir para Dashboard"
5. Verificar navegação para `/dashboard`

**Resultado Esperado**: Navegação correta para ambas as páginas
**Prioridade**: 🟡 Alta

---

### 3. Value Propositions

#### Caso de Teste: VAL-001 - Exibição de Cards
**Pré-condição**: Homepage carregada
**Passos**:
1. Verificar presença de 3 cards (Participe e Ganhe, Destaque-se, Impacte Angola)
2. Verificar ícones visíveis
3. Verificar texto legível
4. Hover sobre cada card
5. Verificar efeito de elevação (shadow)

**Resultado Esperado**: 3 cards visíveis com hover states funcionais
**Prioridade**: 🟢 Média

---

### 4. Módulos (Grid)

#### Caso de Teste: MOD-001 - Navegação Módulos
**Pré-condição**: Homepage carregada
**Passos**:
1. Identificar 3 módulos (Kixikila, Marketplace, Certificações)
2. Clicar em "Explorar" no card Kixikila
3. Verificar navegação para `/kixikila`
4. Voltar à homepage
5. Repetir para Marketplace e Certificações

**Resultado Esperado**: Navegação correta para cada módulo
**Prioridade**: 🔴 Crítica

---

#### Caso de Teste: MOD-002 - Exibição de Features
**Pré-condição**: Homepage carregada
**Passos**:
1. Verificar que cada módulo exibe 3 features
2. Verificar ícones e texto das features
3. Validar que não há truncamento de texto

**Resultado Esperado**: Features listadas corretamente
**Prioridade**: 🟢 Média

---

### 5. Temporada em Destaque

#### Caso de Teste: TMP-001 - Exibição de Temporada Ativa
**Pré-condição**: Existe temporada ativa no sistema
**Passos**:
1. Verificar badge "AO VIVO"
2. Verificar título da temporada
3. Verificar descrição
4. Verificar datas (início e fim)
5. Verificar imagem de poster

**Resultado Esperado**: Todos os dados da temporada exibidos
**Prioridade**: 🟡 Alta

---

#### Caso de Teste: TMP-002 - Navegação Temporada
**Pré-condição**: Temporada ativa exibida
**Passos**:
1. Clicar em "Explorar"
2. Verificar navegação para `/temporadas/{id}`
3. Voltar à homepage
4. Clicar em "Participantes"
5. Verificar navegação para `/participantes`

**Resultado Esperado**: Navegação correta para ambos links
**Prioridade**: 🟡 Alta

---

### 6. Games Section

#### Caso de Teste: GAM-001 - Lazy Loading
**Pré-condição**: Homepage carregada
**Passos**:
1. Verificar que GamesSection não carrega imediatamente
2. Scroll até a seção de jogos
3. Verificar que a seção carrega (Suspense resolvido)
4. Verificar jogos listados

**Resultado Esperado**: Lazy loading funciona, jogos carregam ao scroll
**Prioridade**: 🟡 Alta

---

### 7. CTA Final

#### Caso de Teste: CTA-001 - Visibilidade para Não-Autenticados
**Pré-condição**: Usuário não autenticado
**Passos**:
1. Scroll até o fim da página
2. Verificar presença de seção com CTA "Criar Conta Grátis"
3. Verificar trust indicators (1000+ Membros, Certificado, Gratuito)
4. Clicar em "Criar Conta Grátis"
5. Verificar navegação para `/registo`

**Resultado Esperado**: CTA visível apenas para não-autenticados, navegação correta
**Prioridade**: 🔴 Crítica

---

#### Caso de Teste: CTA-002 - Ocultação para Autenticados
**Pré-condição**: Usuário autenticado
**Passos**:
1. Scroll até o fim da página
2. Verificar que o CTA final NÃO aparece

**Resultado Esperado**: CTA não exibido para usuários autenticados
**Prioridade**: 🟢 Média

---

## 📱 Testes de Responsividade

### Device Matrix

| Device | Resolução | Navegador | Status |
|--------|-----------|-----------|--------|
| iPhone 12 | 390x844 | Safari | ⏳ Pendente |
| iPhone SE | 375x667 | Safari | ⏳ Pendente |
| Galaxy S21 | 360x800 | Chrome | ⏳ Pendente |
| iPad Air | 820x1180 | Safari | ⏳ Pendente |
| Desktop HD | 1920x1080 | Chrome | ⏳ Pendente |
| Desktop FHD | 1366x768 | Edge | ⏳ Pendente |
| Ultrawide | 2560x1440 | Firefox | ⏳ Pendente |

---

### Caso de Teste: RES-001 - Mobile Portrait
**Device**: iPhone 12 (390x844)
**Passos**:
1. Carregar homepage
2. Verificar hero section ocupa viewport
3. Verificar grid de value props em 1 coluna
4. Verificar grid de módulos em 1 coluna
5. Verificar touch targets ≥ 44px
6. Testar scroll suave

**Resultado Esperado**: Layout adapta-se corretamente, sem overflow horizontal
**Prioridade**: 🔴 Crítica

---

### Caso de Teste: RES-002 - Tablet Landscape
**Device**: iPad Air (1180x820)
**Passos**:
1. Carregar homepage
2. Verificar grid de value props em 3 colunas
3. Verificar grid de módulos em 2 colunas
4. Verificar temporada em destaque usa grid 2 colunas
5. Testar interações touch

**Resultado Esperado**: Layout usa 2-3 colunas conforme apropriado
**Prioridade**: 🟡 Alta

---

### Caso de Teste: RES-003 - Desktop
**Device**: Desktop 1920x1080
**Passos**:
1. Carregar homepage
2. Verificar hero section centralizado com max-width
3. Verificar todos os grids em 3 colunas
4. Verificar hover states em cards
5. Verificar que nenhum elemento ultrapassa max-width: 1280px

**Resultado Esperado**: Layout otimizado para desktop, hover states funcionais
**Prioridade**: 🟡 Alta

---

## ⚡ Testes de Performance

### Caso de Teste: PERF-001 - First Contentful Paint
**Ferramenta**: Lighthouse CI
**Passos**:
1. Executar `npm run lighthouse`
2. Verificar FCP
3. Validar que FCP < 1.5s

**Resultado Esperado**: FCP ≤ 1.5s
**Prioridade**: 🔴 Crítica

---

### Caso de Teste: PERF-002 - Largest Contentful Paint
**Ferramenta**: Lighthouse CI
**Passos**:
1. Executar `npm run lighthouse`
2. Verificar LCP
3. Validar que LCP < 2.5s

**Resultado Esperado**: LCP ≤ 2.5s
**Prioridade**: 🔴 Crítica

---

### Caso de Teste: PERF-003 - Cumulative Layout Shift
**Ferramenta**: Lighthouse CI
**Passos**:
1. Executar `npm run lighthouse`
2. Verificar CLS
3. Validar que CLS < 0.1

**Resultado Esperado**: CLS ≤ 0.1 (sem layout shifts significativos)
**Prioridade**: 🟡 Alta

---

### Caso de Teste: PERF-004 - Bundle Size
**Ferramenta**: Webpack Bundle Analyzer
**Passos**:
1. Executar `npm run build`
2. Executar `npm run analyze`
3. Verificar tamanho total do bundle
4. Validar que bundle principal < 300KB (gzipped)

**Resultado Esperado**: Bundle otimizado, sem dependências desnecessárias
**Prioridade**: 🟡 Alta

---

## ♿ Testes de Acessibilidade

### Caso de Teste: A11Y-001 - Keyboard Navigation
**Ferramenta**: Manual + Tab key
**Passos**:
1. Usar apenas teclado (sem mouse)
2. Tab através de todos os elementos interativos
3. Verificar que focus é visível
4. Verificar ordem de tab lógica
5. Testar Esc em modals (se aplicável)

**Resultado Esperado**: Navegação completa por teclado, focus visível
**Prioridade**: 🔴 Crítica

---

### Caso de Teste: A11Y-002 - Screen Reader (NVDA)
**Ferramenta**: NVDA (Windows)
**Passos**:
1. Ativar NVDA
2. Navegar pela homepage com setas
3. Verificar que landmarks são anunciados
4. Verificar que headings são anunciados
5. Verificar que imagens têm alt text
6. Verificar que botões têm labels

**Resultado Esperado**: Conteúdo totalmente navegável e compreensível
**Prioridade**: 🔴 Crítica

---

### Caso de Teste: A11Y-003 - Color Contrast
**Ferramenta**: axe DevTools
**Passos**:
1. Instalar extensão axe DevTools
2. Executar scan na homepage
3. Verificar que não há violations de contraste
4. Validar ratio ≥ 4.5:1 para texto normal
5. Validar ratio ≥ 3:1 para texto grande

**Resultado Esperado**: Sem violations de contraste
**Prioridade**: 🟡 Alta

---

### Caso de Teste: A11Y-004 - Skip to Main Content
**Ferramenta**: Manual + Tab key
**Passos**:
1. Carregar homepage
2. Pressionar Tab
3. Verificar que primeiro elemento focável é "Skip to main content"
4. Pressionar Enter
5. Verificar que foco pula para #main-content

**Resultado Esperado**: Skip link funcional e primeiro no tab order
**Prioridade**: 🟡 Alta

---

## 🔐 Testes de Segurança

### Caso de Teste: SEC-001 - HTTPS
**Ferramenta**: Browser DevTools
**Passos**:
1. Carregar homepage
2. Verificar que URL começa com https://
3. Verificar que não há mixed content warnings
4. Verificar certificado SSL válido

**Resultado Esperado**: HTTPS everywhere, sem warnings
**Prioridade**: 🔴 Crítica

---

### Caso de Teste: SEC-002 - XSS Protection
**Ferramenta**: Manual
**Passos**:
1. Tentar injetar script via URL parameters
2. Tentar injetar script via form inputs
3. Verificar que scripts não executam
4. Verificar que conteúdo é sanitizado

**Resultado Esperado**: XSS attacks bloqueados
**Prioridade**: 🔴 Crítica

---

## 📊 Testes de Analytics

### Caso de Teste: ANA-001 - Event Tracking
**Ferramenta**: Browser DevTools > Network
**Passos**:
1. Carregar homepage
2. Clicar em "Começar Grátis" no hero
3. Verificar que evento `hero-cta-click` é disparado
4. Verificar que data-cta é enviado corretamente
5. Repetir para outros CTAs

**Resultado Esperado**: Todos os eventos rastreados corretamente
**Prioridade**: 🟡 Alta

---

### Caso de Teste: ANA-002 - Page View Tracking
**Ferramenta**: Browser DevTools > Network
**Passos**:
1. Carregar homepage
2. Verificar que pageview é enviado
3. Verificar que user_id é incluído (se autenticado)
4. Verificar que session_id é único

**Resultado Esperado**: Pageviews rastreados com metadados corretos
**Prioridade**: 🟢 Média

---

## 🧪 Testes de Integração

### Caso de Teste: INT-001 - API Calls (Autenticado)
**Pré-condição**: Usuário autenticado
**Passos**:
1. Carregar homepage
2. Verificar chamada a `/api/v2/core/me/dashboard/`
3. Verificar que response contém trust, certifications, marketplace, kixikila
4. Verificar que UI renderiza dados corretamente

**Resultado Esperado**: API call bem-sucedido, UI atualizado
**Prioridade**: 🔴 Crítica

---

### Caso de Teste: INT-002 - API Calls (Seasons)
**Pré-condição**: Temporadas existem no backend
**Passos**:
1. Carregar homepage
2. Verificar chamada a `/api/v2/seasons/` ou equivalente
3. Verificar que response contém temporadas
4. Verificar que featured season é exibida

**Resultado Esperado**: Temporadas carregadas e exibidas corretamente
**Prioridade**: 🟡 Alta

---

### Caso de Teste: INT-003 - API Error Handling
**Pré-condição**: Simular erro de API
**Passos**:
1. Mock de API para retornar 500 error
2. Carregar homepage
3. Verificar que UI exibe mensagem de erro amigável
4. Verificar que página não quebra

**Resultado Esperado**: Erro tratado graciosamente, sem crash
**Prioridade**: 🟡 Alta

---

## 📈 Métricas de Sucesso

### KPIs Pré-Mudança (Baseline)
- **Bounce Rate**: 55%
- **Avg. Time on Page**: 1min 12s
- **Sign-up Rate**: 1.2%
- **Module CTR**: 8%
- **FCP**: 2.3s
- **LCP**: 3.1s

### KPIs Pós-Mudança (Meta)
- **Bounce Rate**: < 40% (↓ 27%)
- **Avg. Time on Page**: > 2min (↑ 67%)
- **Sign-up Rate**: > 3% (↑ 150%)
- **Module CTR**: > 15% (↑ 88%)
- **FCP**: < 1.5s (↓ 35%)
- **LCP**: < 2.5s (↓ 19%)

---

## 🗓️ Cronograma de Testes

| Fase | Duração | Responsável | Status |
|------|---------|-------------|--------|
| Testes Funcionais | 2 dias | QA Team | ⏳ Pendente |
| Testes de Responsividade | 1 dia | QA Team | ⏳ Pendente |
| Testes de Performance | 1 dia | DevOps | ⏳ Pendente |
| Testes de Acessibilidade | 1 dia | A11y Specialist | ⏳ Pendente |
| Testes de Segurança | 1 dia | Security Team | ⏳ Pendente |
| Testes de Analytics | 0.5 dia | Data Team | ⏳ Pendente |
| Testes de Integração | 1 dia | Dev Team | ⏳ Pendente |
| **Total** | **7.5 dias** | | |

---

## ✅ Critérios de Aceitação

A homepage está pronta para produção quando:

1. ✅ **Funcionalidade**: 100% dos testes funcionais críticos passam
2. ✅ **Performance**: Lighthouse score ≥ 90
3. ✅ **Acessibilidade**: Sem violations críticas no axe
4. ✅ **Responsividade**: Funciona em todos devices da matriz
5. ✅ **Segurança**: HTTPS + XSS protection verificados
6. ✅ **Analytics**: Eventos rastreados corretamente
7. ✅ **Integração**: APIs funcionam e erros são tratados

---

## 📝 Relatório de Bugs

Template para reportar bugs encontrados:

```markdown
### BUG-XXX: [Título do Bug]

**Severidade**: Crítica / Alta / Média / Baixa
**Prioridade**: P0 / P1 / P2 / P3

**Descrição**:
[Descrição clara do problema]

**Passos para Reproduzir**:
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado**:
[O que deveria acontecer]

**Resultado Atual**:
[O que realmente acontece]

**Screenshots**:
[Anexar se aplicável]

**Ambiente**:
- OS: [Windows/Mac/Linux/iOS/Android]
- Browser: [Chrome/Firefox/Safari/Edge + versão]
- Resolução: [1920x1080, etc.]
```

---

**Última atualização**: 24 Dezembro 2025
**Versão do Plano**: 1.0
**Próxima revisão**: Após execução dos testes
