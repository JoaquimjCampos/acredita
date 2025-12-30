## Estado Atual — 2025-12-25

### Backend
- Django + DRF ativo; migrações aplicadas (incluindo app core e analytics).
- Endpoints unificados: `/api/v2/core/me/dashboard`, `/api/v2/core/me/revenue`, e `/api/v2/core/me/activity` consumidos no frontend.
- Analytics: `/api/analytics/events` com rate limiting (IP-based, 120/min) e autenticação opcional via `X-Analytics-Key`.
- Apps legados (seasons, participants, games, donations, ads, marketplace, certifications) permanecem disponíveis; core agrega métricas.

### Frontend
- HomePage minimalista: hero renovado (PLG/Blue Ocean chips, social proof com métricas do core), resumo rápido (auth), grid de 3 módulos (Kixikila, Marketplace, Certificações), destaque de temporada, CTA final.
- Dashboard limpo: cartões de métricas principais e blocos de oportunidades/breakdown.
- Analytics: `trackEvent` helper com suporte a sendBeacon/fetch e header key opcional.
- Hooks de dado em uso: `useCoreDashboard`, `useSeasons` (destaque de temporada).

### Infra / Qualidade
- Tests criados anteriormente; executar `npm start` (frontend) e `manage.py runserver` (backend) para smoke.
- Documentos de UX/QA criados: `HOMEPAGE_UX_GUIDELINES.md`, `HOMEPAGE_QUALITY_CHECKLIST.md`, `HOMEPAGE_TEST_PLAN.md`.
- Logs: `backend/logs/analytics.log` para eventos frontend; `backend/logs/acredita.log` para logs gerais.

### Pendências imediatas
- Testar endpoint `/api/v2/core/me/activity` no dashboard.
- Configurar env vars: `ANALYTICS_KEY`, `REACT_APP_ANALYTICS_KEY`, `REACT_APP_API_BASE`.
- Instrumentar eventos adicionais (módulo cards, featured season CTA).

