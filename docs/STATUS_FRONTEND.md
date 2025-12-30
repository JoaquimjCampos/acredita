## Status Frontend — 2025-12-25

### HomePage
- Minimalista: hero renovado com badge PLG/Blue Ocean, CTAs arredondadas; chips de valor e social proof.
- Social proof: chips com métricas do core (confiança média, ciclos Kixikila, vendas marketplace) com skeleton loading.
- Sessão autenticada: resumo rápido com métricas do core.
- Grid de módulos (Kixikila, Marketplace, Certificações) como pilares principais.
- Destaque de temporada com datas/CTA; CTA final para visitantes.
- Seções removidas para leveza: quiz, leaderboard, games, feedback widget, funding dashboard detalhado.

### Dashboard
- Cartões principais: trust, certificações, vendas marketplace, ciclos Kixikila.
- Coluna primária agora mostra "Oportunidades"; coluna secundária mantém breakdown de confiança.

### Analytics
- Helper `trackEvent` em `utils/analytics.ts`: sendBeacon fallback, opcional `X-Analytics-Key` header.
- Eventos instrumentados: `hero-cta-click`, `hero-social-proof` (chips).
- Endpoint configurável via `VITE_API_BASE`/`REACT_APP_API_BASE`.

### Dados & Hooks
- `useCoreDashboard` para métricas unificadas.
- `useSeasons` para destaque de temporada.

### Pendências rápidas
- Adicionar frontend hook para `/api/v2/core/me/activity`.
- Instrumentar eventos em módulo cards e featured season CTA.
- Smoke `npm start` para validar hero/layout em runtime.

