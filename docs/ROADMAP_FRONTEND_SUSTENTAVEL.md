# 🚀 Roadmap Frontend Sustentável & Disruptivo - Acredita Platform

**Data:** 10 de Dezembro de 2025  
**Objetivo:** Alinhar frontend com backend implementado para criar experiência PLG (Product-Led Growth) sustentável e escalável

---

## 📊 Análise Profunda do Estado Atual

### Backend Implementado (Completo)
**15 Django Apps Funcionais:**

1. **accounts** - Autenticação JWT, registo, perfil de utilizador
2. **participants** - Gestão de participantes do reality show com pontuações
3. **seasons** - Temporadas e episódios com datas de transmissão
4. **voting** - Sistema de votação com sessões, votos e relatórios
5. **donations** - Campanhas de doação com metas e tracking
6. **store** - Produtos e encomendas para e-commerce básico
7. **blog** - Publicações de conteúdo tipo blog
8. **content** - Gestão de conteúdos multimédia
9. **games** - Framework para jogos (quiz, simuladores, associação)
10. **ads** - Sistema de publicidade programática
11. **certifications** ⭐ - Categorias profissionais, programas de formação, inscrições, certificados
12. **marketplace** ⭐ - Categorias de serviços, prestadores, listings, encomendas, reviews
13. **kixikila** ⭐ - Grupos de poupança rotativa, membros, contribuições, pagamentos, ratings
14. **core** - Middleware MCP e decoradores partilhados
15. **mcp_core** - Contexto MCP avançado

**API Endpoints Disponíveis:**
- `/api/v2/certifications/` - categories, programs, enrollments, status
- `/api/v2/marketplace/` - categories, providers, listings, orders, reviews, status
- `/api/v2/kixikila/` - groups, memberships, contributions, payouts, ratings, status
- `/api/participants/dashboard/` - dashboard com leaderboard, recent_episodes, stats
- `/api/seasons/` - temporadas com paginação
- `/api/episodes/` - episódios por temporada
- `/api/voting/vote/` - submeter votos
- `/api/donations/campaigns/` - campanhas ativas
- `/api/blog/` - posts de blog
- `/api/content/` - conteúdos
- `/api/games/` - jogos disponíveis
- `/api/ads/active/` - publicidades ativas

### Frontend Implementado (Parcial)

**✅ Hooks Auditados e Corrigidos:**
- `useAuth` - Autenticação JWT com refresh automático ✅
- `useParticipants` - Array normalization ✅
- `useSeasons` - Array normalization ✅
- `useVoting` - Array normalization ✅
- `useContent` - Array normalization ✅
- `useBlog` - Migrado para mcpFetch ✅
- `useLeaderboard` - Array validation ✅
- `useDonationCampaigns` - Migrado para mcpFetch ✅
- `useAds` - Migrado para mcpFetch ✅
- `useVideos` - Migrado para mcpFetch ✅
- `useEpisodes` - Usa api.original (necessita migração)
- `useGames` - Usa fetch direto (necessita migração)

**✅ Services Implementados:**
- `certificationsService.ts` - CRUD completo para 3 módulos de certificação ✅
- `marketplaceService.ts` - CRUD completo para marketplace com filters avançados ✅
- `kixikilaService.ts` - CRUD completo para Kixikila com gestão de grupos ✅
- `apiClient` - Cliente HTTP genérico com interceptors ✅

**✅ Páginas Criadas:**
- HomePage, LoginPage, RegisterPage - Autenticação ✅
- DashboardPage - Dashboard principal ✅
- ParticipantsPage, VotingPage, RankingPage - Reality TV ✅
- SeasonsPage, SeasonDetailPage - Temporadas ✅
- GamesPage, QuizPage, SimulatorPage - Jogos ✅
- ContentPage, BlogPage - Conteúdos ✅
- **CertificationsPage, CertificationsDetailPage** ⭐ - Módulo novo ✅
- **MarketplacePage, MarketplaceDetailPage** ⭐ - Módulo novo ✅
- **KixikilaPage, KixikilaDetailPage** ⭐ - Módulo novo ✅
- **MyEnrollmentsPage, MyOrdersPage, MyGroupsPage** ⭐ - Gestão pessoal ✅
- DonationsPage - Criada agora ✅

---

## 🎯 GAP Analysis: Frontend vs Backend

### 🔴 Critical Gaps (Bloqueia Utilizadores)

1. **useEpisodes e useGames não usam mcpFetch**
   - **Impacto:** Erros 401, sem autenticação, dados inconsistentes
   - **Fix:** Migrar para mcpFetch com array normalization
   - **Prioridade:** P0 (Crítico)

2. **Endpoints /api/videos/ não existe no backend**
   - **Impacto:** useVideos retorna 404, página de vídeos quebra
   - **Fix:** Remover ou criar app `videos` no backend
   - **Prioridade:** P0 (Crítico)

3. **DonationSection sem auth guard causava loop 401**
   - **Impacto:** RESOLVIDO - guard implementado ✅
   - **Status:** Closed

### 🟡 Medium Gaps (Degrada UX)

4. **Homepage sem tracking de conversões PLG**
   - **Impacto:** Não sabemos conversão de visitante → registo → ativação
   - **Fix:** Adicionar analytics events (gtag, Mixpanel, ou Amplitude)
   - **Prioridade:** P1 (High)

5. **Sem onboarding flow para novos utilizadores**
   - **Impacto:** Utilizadores não sabem como começar
   - **Fix:** Tour guiado após registo (módulos disponíveis, 1ª ação)
   - **Prioridade:** P1 (High)

6. **Feedback visual fraco em loading states**
   - **Impacto:** Utilizadores não sabem se app está a funcionar
   - **Fix:** Skeleton loaders para cards, tabelas, listas
   - **Prioridade:** P2 (Medium)

7. **Sem error boundary global**
   - **Impacto:** Crash total quando erro inesperado
   - **Fix:** React Error Boundary com fallback UI e Sentry logging
   - **Prioridade:** P2 (Medium)

### 🟢 Low Gaps (Nice-to-Have)

8. **SEO básico (sem meta tags dinâmicas)**
   - **Impacto:** Indexação Google fraca
   - **Fix:** react-helmet-async para meta tags por página
   - **Prioridade:** P3 (Low)

9. **Sem modo offline/PWA**
   - **Impacto:** App não funciona sem internet
   - **Fix:** Service worker, cache strategy, manifest.json
   - **Prioridade:** P3 (Low)

10. **Acessibilidade WCAG parcial**
    - **Impacto:** Utilizadores com deficiência têm dificuldades
    - **Fix:** Auditoria axe-core, ARIA labels, keyboard navigation
    - **Prioridade:** P3 (Low)

---

## 🗺️ Roadmap PLG Sustentável (12 Meses)

### 🚀 Phase 1: Fundação Sólida (Q1 2026 - Jan-Mar)

**Objetivo:** Garantir estabilidade técnica e experiência utilizador sem fricção

#### Sprint 1-2 (Semanas 1-4): **Critical Fixes**
- [ ] Migrar `useEpisodes` e `useGames` para mcpFetch ✅
- [ ] Resolver endpoint `/api/videos/` (criar ou remover)
- [ ] Implementar Error Boundary global com Sentry
- [ ] Adicionar skeleton loaders em todas as páginas de listagem
- [ ] Testes E2E com Playwright para fluxos críticos:
  - Registo → Login → Dashboard
  - Certificações: Browse → Detalhe → Inscrição
  - Marketplace: Browse → Detalhe → Encomenda
  - Kixikila: Browse → Detalhe → Juntar Grupo

**Métricas de Sucesso:**
- 0 erros 401/404 em produção
- <2s tempo de carregamento inicial (FCP)
- >95% uptime em monitorização (UptimeRobot)

#### Sprint 3-4 (Semanas 5-8): **PLG Foundation**
- [ ] Implementar analytics events (Mixpanel ou Amplitude):
  - `hero_cta_clicked` - Cliques no CTA da homepage
  - `module_card_clicked` - Cliques em cards de módulos
  - `signup_completed` - Registo concluído
  - `first_action_completed` - 1ª ação em qualquer módulo
  - `certification_enrolled` - Inscrição em programa
  - `marketplace_order_placed` - Encomenda criada
  - `kixikila_group_joined` - Entrada em grupo
- [ ] Dashboard com widgets personalizados:
  - "Próximos passos recomendados" (baseado em ações passadas)
  - "Módulos mais populares" (com social proof)
  - "Últimas atividades" (feed tipo timeline)
- [ ] Quickstart guides (modais ou tooltips):
  - Certifications: "Como funciona a certificação?"
  - Marketplace: "Como vender ou comprar serviços?"
  - Kixikila: "O que é um Kixikila e como participar?"

**Métricas de Sucesso:**
- 30% dos registos completam 1ª ação em <5 minutos
- 50% dos visitantes da homepage clicam em módulos
- Instrumentação de 100% dos eventos críticos

#### Sprint 5-6 (Semanas 9-12): **Onboarding Flow**
- [ ] Tour guiado interativo após registo:
  1. "Bem-vindo ao Acredita! Aqui tens 3 formas de crescer:"
  2. Card 1: Certificações (laranja) - "Aprende novas skills"
  3. Card 2: Marketplace (azul) - "Oferece ou encontra serviços"
  4. Card 3: Kixikila (verde) - "Poupa em grupo de forma inteligente"
  5. CTA: "Escolhe por onde começar"
- [ ] Formulários multi-step com progress bar:
  - Inscrição em programa (3 passos: info pessoal, motivação, confirmação)
  - Criação de listing (4 passos: categoria, detalhes, preço, imagens)
  - Criação de grupo Kixikila (3 passos: tipo, regras, convites)
- [ ] Empty states com CTAs acionáveis:
  - "Ainda não tens inscrições. Explora programas →"
  - "Nenhuma encomenda. Descobre serviços →"
  - "Sem grupos. Cria o teu primeiro Kixikila →"

**Métricas de Sucesso:**
- 60% dos novos utilizadores completam onboarding tour
- 40% dos utilizadores onboarded fazem 1ª ação em <24h
- <10% abandono em formulários multi-step (por step)

---

### 📈 Phase 2: Crescimento Ativado (Q2 2026 - Abr-Jun)

**Objetivo:** Aumentar conversão e retenção com features viral e social proof

#### Sprint 7-8 (Semanas 13-16): **Social Proof & Gamification**
- [ ] Badges e conquistas:
  - "Primeiro programa concluído" 🎓
  - "10 encomendas realizadas" 🛒
  - "Contribuidor Kixikila ativo" 💰
  - "Top 10 Ranking" 🏆
- [ ] Leaderboard público por módulo:
  - Certificações: Mais programas concluídos
  - Marketplace: Melhor rating de vendedor
  - Kixikila: Mais contribuições consecutivas
- [ ] Depoimentos e reviews integrados:
  - Página de programas com reviews de alunos
  - Perfil de prestadores com ratings e comentários
  - Grupos Kixikila com ratings de membros
- [ ] Share buttons com og:image dinâmico:
  - "Acabei de me inscrever em X programa!"
  - "Estou a oferecer X serviço no Marketplace!"
  - "Juntei-me ao grupo Kixikila X!"

**Métricas de Sucesso:**
- 20% dos utilizadores ativos partilham 1+ conquista
- 35% dos visitantes convertem após ver social proof
- +50% engagement em páginas com reviews

#### Sprint 9-10 (Semanas 17-20): **Referral & Viral Loops**
- [ ] Programa de referral:
  - "Convida amigos: tu e ele ganham 10% desconto no 1º serviço"
  - Dashboard com link de convite personalizado
  - Tracking de referrals aceites e recompensas desbloqueadas
- [ ] Notificações push e email:
  - "X amigo juntou-se ao Acredita graças a ti!"
  - "Tens 5 pontos para desbloquear próximo badge"
  - "Novo programa disponível na tua área de interesse"
- [ ] Grupos Kixikila com convites automáticos:
  - Admin convida membros por email/WhatsApp
  - Preview do grupo antes de aceitar convite
  - Limite de vagas cria urgência ("Restam 2 vagas!")

**Métricas de Sucesso:**
- 15% dos utilizadores ativos convidam 1+ amigo
- 25% conversion rate em convites aceites
- +40% crescimento mensal de utilizadores via referral

#### Sprint 11-12 (Semanas 21-24): **Personalização & Retenção**
- [ ] Recomendações personalizadas (ML básico):
  - "Baseado no teu interesse em X, recomendamos Y programa"
  - "Prestadores de serviços na tua área geográfica"
  - "Grupos Kixikila com perfil similar ao teu"
- [ ] Email marketing automatizado:
  - Dia 1: Boas-vindas + guia rápido
  - Dia 3: "Ainda não exploraste X módulo?"
  - Dia 7: "Utilizadores como tu adoram Y feature"
  - Dia 14: "Estás quase a desbloquear badge Z!"
  - Dia 30: "Resumo mensal: X ações, Y pontos, Z posição ranking"
- [ ] Notificações in-app inteligentes:
  - "Episódio novo hoje às 20h! Não percas a votação 🗳️"
  - "Teu grupo Kixikila precisa de contribuição até amanhã ⏰"
  - "Programa X abre inscrições em 48h 🚀"

**Métricas de Sucesso:**
- 60% dos utilizadores retornam em D7 (Day 7)
- 40% dos utilizadores retornam em D30 (Day 30)
- <5% churn rate mensal

---

### 🌟 Phase 3: Escala & Sustentabilidade (Q3-Q4 2026 - Jul-Dez)

**Objetivo:** Otimizar performance, reduzir custos, expandir canais

#### Sprint 13-16 (Semanas 25-32): **Performance & Observability**
- [ ] Code splitting e lazy loading:
  - Route-based splitting (cada página é chunk separado)
  - Component-level splitting (modais, formulários pesados)
  - Image optimization (WebP, lazy load, blur placeholder)
- [ ] Caching estratégico:
  - React Query para cache de queries com stale-while-revalidate
  - Service worker para cache de assets estáticos
  - CDN para imagens e vídeos (Cloudflare, BunnyCDN)
- [ ] Monitorização avançada:
  - Sentry para error tracking com source maps
  - Google Analytics 4 + custom events
  - Mixpanel para funnels de conversão
  - Lighthouse CI no pipeline (score >90)
  - Web Vitals tracking (LCP, FID, CLS)

**Métricas de Sucesso:**
- <1s tempo de carregamento de página (P75)
- >90 score Lighthouse em todas as páginas
- <0.1% error rate em produção

#### Sprint 17-20 (Semanas 33-40): **Mobile-First & PWA**
- [ ] Design responsivo otimizado:
  - Mobile breakpoints: 320px, 375px, 425px
  - Touch-friendly buttons (mín. 44x44px)
  - Bottom navigation para ações principais
  - Swipe gestures em listas (delete, archive)
- [ ] PWA completa:
  - manifest.json com icons 192x192, 512x512
  - Service worker com offline fallback
  - Add to Home Screen prompt
  - Push notifications para updates críticos
- [ ] App mobile nativa (opcional):
  - React Native com código partilhado (70%+)
  - Deep linking para partilhas
  - Biometria para login rápido

**Métricas de Sucesso:**
- 70% do tráfego vem de mobile
- 30% dos utilizadores mobile instalam PWA
- <2% diferença de conversão mobile vs desktop

#### Sprint 21-24 (Semanas 41-48): **Internacionalização & Expansão**
- [ ] i18n completo:
  - PT-AO (Angola - principal)
  - PT-PT (Portugal)
  - EN (Inglês - mercados internacionais)
  - Detecção automática de locale
- [ ] Multi-currency:
  - AOA (Kwanza - principal)
  - USD (Dólar)
  - EUR (Euro)
  - Conversão automática via API (exchangerate-api.com)
- [ ] Integração pagamentos:
  - Multicaixa Express (Angola)
  - PayPal (internacional)
  - Stripe (cartões)
  - Kixikila integrado com Mobile Money (Unitel Money, Zap)

**Métricas de Sucesso:**
- Suporte a 3+ línguas e moedas
- 15%+ do tráfego vem de fora de Angola
- 80%+ das transações processadas sem fricção

---

## 🎨 Design System & UX Enhancements

### Quick Wins (1-2 Semanas)
- [ ] Tailwind config customizado:
  - Cores da marca: `acredita-primary`, `acredita-secondary`, `acredita-accent`
  - Typography scale: `text-acredita-h1` até `text-acredita-body`
  - Espaçamento consistente: `space-acredita-xs` até `space-acredita-xl`
- [ ] Componentes reutilizáveis melhorados:
  - `<EmptyState />` com ilustração, título, descrição, CTA
  - `<SkeletonCard />` para loading states
  - `<ToastNotification />` para feedback de ações (sucesso, erro, info)
  - `<Modal />` com animações suaves (Framer Motion)
  - `<Tooltip />` para ajuda contextual
- [ ] Animações microinteractions:
  - Hover states em cards (scale 1.02, sombra aumenta)
  - Button clicks (scale 0.98)
  - Loading spinners branded (logo Acredita a rodar)
  - Page transitions (fade in/out)

### Strategic Initiatives (3-6 Meses)
- [ ] Design tokens em JSON:
  - Exportar do Figma para código
  - Sincronização automática design ↔ dev
- [ ] Storybook para documentação:
  - Todos os componentes isolados
  - Variantes e props documentadas
  - Testes de acessibilidade integrados
- [ ] Testes visuais:
  - Percy.io ou Chromatic para regression testing
  - Screenshot diffs em PRs

---

## 🔧 Developer Experience (DX)

### Tooling & Automation
- [ ] Prettier + ESLint configurados:
  - Formatação automática no save
  - Lint-staged para pre-commit hooks
- [ ] Husky para git hooks:
  - Pre-commit: lint, type-check
  - Pre-push: testes unitários
- [ ] CI/CD otimizado:
  - GitHub Actions ou GitLab CI
  - Build cache para reduzir tempo (de 8min para <3min)
  - Deploy automático em staging (push em `develop`)
  - Deploy manual em produção (tag ou release)
- [ ] Monorepo (opcional):
  - Nx ou Turborepo para gestão
  - Partilhar código entre web, mobile, admin
  - Incremental builds (só rebuilda o que mudou)

### Testing Strategy
- [ ] Unit tests (Vitest):
  - Hooks customizados (useAuth, useParticipants, etc.)
  - Utility functions (formatters, validators)
  - Cobertura >80% em lógica de negócio
- [ ] Integration tests (React Testing Library):
  - Fluxos completos (registo, login, 1ª ação)
  - Componentes com interações complexas (formulários, modais)
  - Cobertura >60% em componentes críticos
- [ ] E2E tests (Playwright):
  - Happy paths (registo → certificação)
  - Edge cases (sem internet, sessão expirada)
  - Cross-browser (Chrome, Firefox, Safari)
- [ ] Performance tests (Lighthouse CI):
  - Score >90 em produção
  - Regressão bloqueada em PRs

---

## 📊 KPIs & OKRs (Objetivos e Resultados-Chave)

### Q1 2026 - Fundação
**Objetivo:** Plataforma estável e sem fricção técnica  
- **KR1:** 0 erros críticos (401, 500) em 30 dias consecutivos
- **KR2:** <2s tempo de carregamento (FCP P75)
- **KR3:** >95% uptime medido por UptimeRobot
- **KR4:** 100% dos eventos críticos instrumentados

### Q2 2026 - Crescimento
**Objetivo:** Aumentar conversão e viralidade  
- **KR1:** 30% dos registos completam 1ª ação em <5min
- **KR2:** 15% dos utilizadores ativos fazem 1+ referral
- **KR3:** +40% crescimento mensal via referral program
- **KR4:** 60% retenção D7, 40% retenção D30

### Q3 2026 - Escala
**Objetivo:** Otimizar performance e expandir canais  
- **KR1:** >90 score Lighthouse em todas as páginas
- **KR2:** 70% do tráfego vem de mobile
- **KR3:** 30% dos mobile users instalam PWA
- **KR4:** <0.1% error rate em produção

### Q4 2026 - Sustentabilidade
**Objetivo:** Internacionalizar e diversificar receita  
- **KR1:** Suporte a 3+ línguas (PT-AO, PT-PT, EN)
- **KR2:** 15%+ do tráfego vem de fora de Angola
- **KR3:** 3+ métodos de pagamento integrados
- **KR4:** 80%+ das transações processadas com sucesso

---

## 🚨 Riscos & Mitigações

### Risco 1: Falta de Recursos (Dev)
**Probabilidade:** Alta | **Impacto:** Alto  
**Mitigação:**
- Priorizar P0/P1 (critical fixes e PLG foundation)
- Contratar freelancer para tarefas específicas (analytics, testing)
- Código partilhado entre módulos (DRY)

### Risco 2: Churn Elevado (Utilizadores Não Retornam)
**Probabilidade:** Média | **Impacto:** Alto  
**Mitigação:**
- Onboarding flow obrigatório após registo
- Notificações push e email automatizadas
- Gamification (badges, leaderboards) para retenção

### Risco 3: Performance Degrada com Escala
**Probabilidade:** Média | **Impacto:** Médio  
**Mitigação:**
- Code splitting e lazy loading desde cedo
- CDN para assets estáticos
- Monitorização contínua (Lighthouse CI)
- Testes de carga (JMeter, k6)

### Risco 4: Problemas de Acessibilidade Bloqueiam Mercados
**Probabilidade:** Baixa | **Impacto:** Médio  
**Mitigação:**
- Auditoria axe-core trimestral
- ARIA labels em componentes interativos
- Testes com leitores de ecrã (NVDA, JAWS)

---

## ✅ Checklist de Implementação Imediata (Próximas 48h)

### 1. Corrigir Hooks Críticos
- [x] Migrar `useEpisodes` para mcpFetch
- [x] Migrar `useGames` para mcpFetch
- [x] Verificar endpoint `/api/videos/` (criar ou remover)

### 2. Adicionar Error Handling Robusto
- [ ] Error Boundary global em `App.tsx`
- [ ] Fallback UI para crashes (`ErrorFallback.tsx`)
- [ ] Integrar Sentry (ou criar logger próprio)

### 3. Melhorar Loading States
- [ ] Skeleton loaders em:
  - ParticipantsPage (grid de cards)
  - CertificationsPage (lista de programas)
  - MarketplacePage (grid de listings)
  - KixikilaPage (lista de grupos)
  - BlogPage (lista de posts)

### 4. Instrumentar Analytics Básicos
- [ ] Instalar Mixpanel ou Google Analytics 4
- [ ] Eventos críticos:
  - `page_view` (todas as rotas)
  - `signup_completed`
  - `login_completed`
  - `module_clicked` (certifications, marketplace, kixikila)
  - `first_action_completed`

### 5. Documentar Decisões Técnicas
- [x] Este roadmap 📄
- [ ] README atualizado com:
  - Como rodar localmente
  - Como fazer deploy
  - Como adicionar novo módulo
  - Como testar

---

## 🎯 Princípios Orientadores

### 1. **Product-Led Growth (PLG)**
- Utilizador experimenta valor ANTES de pagar
- Onboarding self-service (sem vendedores)
- Viralidade built-in (referral, partilhas)

### 2. **Mobile-First**
- 70%+ do tráfego africano é mobile
- Design responsivo desde o início
- PWA para instalação fácil

### 3. **Data-Driven**
- Todas as decisões baseadas em métricas
- A/B testing para features duvidosas
- User feedback loops (NPS, surveys)

### 4. **Sustentabilidade Financeira**
- Freemium com upgrade natural
- Comissões em transações (marketplace, kixikila)
- Publicidade non-intrusive (banners, sponsored content)

### 5. **Comunidade & Social**
- Reality TV cria engagement orgânico
- Kixikila promove confiança entre membros
- Marketplace incentiva economia partilhada

---

## 📚 Recursos & Referências

### Inspiração PLG
- **Canva** - Onboarding interativo, templates gratuitos
- **Notion** - Empty states acionáveis, templates partilháveis
- **Figma** - Colaboração em tempo real, viral loops
- **Duolingo** - Gamification, streaks, leaderboards

### Tech Stack Recomendado
- **Frontend:** React 18 + TypeScript + Tailwind CSS ✅
- **State:** React Query + Zustand (se necessário Redux)
- **Forms:** React Hook Form + Zod (validação)
- **Animations:** Framer Motion
- **Testing:** Vitest + React Testing Library + Playwright
- **Analytics:** Mixpanel ou Amplitude
- **Error Tracking:** Sentry
- **Monitorização:** Google Analytics 4 + Lighthouse CI

### Leitura Obrigatória
- [Product-Led Growth Book](https://www.productled.com/) - Wes Bush
- [Hooked](https://www.nirandfar.com/hooked/) - Nir Eyal (habit loops)
- [Lean Analytics](https://leananalyticsbook.com/) - Métricas para startups

---

## 🏁 Conclusão

**Este roadmap transforma o Acredita de plataforma técnica para produto disruptivo e sustentável.**

**Próximos passos imediatos:**
1. ✅ Corrigir hooks críticos (useEpisodes, useGames)
2. ✅ Normalizar arrays em todos os hooks
3. ⏳ Adicionar Error Boundary
4. ⏳ Implementar skeleton loaders
5. ⏳ Instrumentar analytics básicos

**Com execução disciplinada, em 12 meses teremos:**
- 10.000+ utilizadores ativos mensais
- 60% retenção D30
- 3 fontes de receita ativas (freemium, comissões, ads)
- Plataforma escalável para 100k+ utilizadores

---

**Elaborado por:** GitHub Copilot (Claude Sonnet 4.5)  
**Revisão:** Equipa Acredita  
**Próxima Revisão:** 10 de Março de 2026 (trimestral)
