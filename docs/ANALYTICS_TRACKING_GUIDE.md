# 📊 Guia de Rastreamento de Analytics - Acredita Platform

## Visão Geral

Este documento descreve o sistema padronizado de eventos de analytics implementado em toda a plataforma Acredita. Todos os CTAs (Call-To-Action) principais foram instrumentados com eventos enriquecidos que permitem rastreamento detalhado do comportamento do usuário e análise de conversão.

---

## Estrutura de Evento Padronizado

Todos os eventos de analytics seguem a seguinte estrutura:

```typescript
interface AnalyticsEvent {
  name: string;                          // Nome único do evento
  page?: string;                         // Página onde o evento ocorreu
  cta_type?: 'primary' | 'secondary' | 'module' | 'season' | 'upgrade' | 'login' | 'register' | 'vote' | 'filter' | 'unlock';
  label?: string;                        // Rótulo/descrição do CTA
  variant?: 'A' | 'B';                   // Variante A/B testing
  primary_engagement?: string;           // Módulo principal de engajamento do usuário
  personalized?: boolean;                // Se o CTA foi personalizado
  engagement_percentage?: number;        // Percentual de engajamento do usuário
  timestamp?: number;                    // Timestamp Unix do evento (ms)
  required_role?: string;                // Função necessária para acessar recurso
  target_role?: string;                  // Função alvo após upgrade
  username?: string;                     // Username (para login/registro)
  participant_id?: string;               // ID do participante (para votação)
  participant_name?: string;             // Nome do participante (para votação)
  filter_type?: string;                  // Tipo de filtro aplicado
  error_message?: string;                // Mensagem de erro (se houver)
  user_type?: string;                    // Tipo de usuário
  value?: number | string;               // Valor genérico (ex: season.id)
}
```

---

## CTAs Instrumentados

### 1. **Hero CTA (Homepage)**

**Variante A - Text-Only:**
```json
{
  "name": "hero-cta-click",
  "page": "home",
  "cta_type": "primary",
  "label": "dashboard",
  "variant": "A",
  "primary_engagement": "marketplace",
  "personalized": false,
  "engagement_percentage": 60,
  "timestamp": 1704067200000
}
```

**Variante B - Com Imagem + Personalização:**
```json
{
  "name": "hero-cta-click",
  "page": "home",
  "cta_type": "secondary",
  "label": "Explorar Marketplace",
  "variant": "B",
  "primary_engagement": "marketplace",
  "personalized": true,
  "engagement_percentage": 60,
  "timestamp": 1704067200000
}
```

### 2. **Module Cards (Homepage)**

Quando o usuário clica em um card de módulo (Kixikila, Marketplace, Certificações):

```json
{
  "name": "module-card-clicked",
  "page": "home",
  "cta_type": "module",
  "label": "marketplace",
  "variant": "A",
  "primary_engagement": "marketplace",
  "personalized": false,
  "engagement_percentage": 60,
  "timestamp": 1704067200000
}
```

### 3. **Featured Season CTA (Homepage)**

```json
{
  "name": "featured-season-cta",
  "page": "home",
  "cta_type": "season",
  "label": "explorar",
  "value": 12,
  "variant": "A",
  "primary_engagement": "marketplace",
  "personalized": false,
  "engagement_percentage": 60,
  "timestamp": 1704067200000
}
```

### 4. **Upgrade Request (Upgrade Page)**

```json
{
  "name": "upgrade-request",
  "page": "upgrade",
  "cta_type": "upgrade",
  "target_role": "mentor",
  "variant": "A",
  "timestamp": 1704067200000
}
```

### 5. **Autenticação (Login/Register/Logout)**

**Signup Started:**
```json
{
  "name": "signup_started",
  "page": "register",
  "cta_type": "register",
  "username": "joaquim",
  "user_type": "participant",
  "timestamp": 1704067200000
}
```

**Signup Completed:**
```json
{
  "name": "signup_completed",
  "page": "register",
  "cta_type": "register",
  "username": "joaquim",
  "user_type": "participant",
  "timestamp": 1704067200000
}
```

**Login Started:**
```json
{
  "name": "login_started",
  "page": "login",
  "cta_type": "login",
  "username": "joaquim",
  "timestamp": 1704067200000
}
```

### 6. **Votação (Voting Page)**

```json
{
  "name": "vote_submitted",
  "page": "voting",
  "cta_type": "vote",
  "participant_id": "123",
  "participant_name": "Maria Silva",
  "timestamp": 1704067200000
}
```

### 7. **Ranking Filters (Ranking Page)**

```json
{
  "name": "ranking_filter_changed",
  "page": "ranking",
  "cta_type": "filter",
  "filter_type": "semana",
  "timestamp": 1704067200000
}
```

### 8. **PLG Unlock Click (Homepage)**

Quando usuário clica em funcionalidade bloqueada:

```json
{
  "name": "plg-unlock-click",
  "page": "home",
  "cta_type": "unlock",
  "label": "Criar Anúncio",
  "required_role": "participant",
  "variant": "A",
  "primary_engagement": "marketplace",
  "personalized": false,
  "engagement_percentage": 60,
  "timestamp": 1704067200000
}
```

---

## Integração no Backend

Todos os eventos são enviados para o endpoint:

```
POST /api/analytics/events
```

**Headers:**
```
Content-Type: application/json
X-Analytics-Key: (opcional, se configurado)
```

**Exemplo de Resposta (204 No Content):**
```
HTTP/1.1 204 No Content
```

Os eventos são persistidos em:
- **Banco de dados**: `analytics_events` (tabela)
- **Logs**: `backend/logs/analytics.log`

---

## Campos Opcionais por Contexto

### Para CTAs Autenticados:
- `primary_engagement`: Sempre incluído (detectado via `useUserEngagement` hook)
- `engagement_percentage`: Percentual de engajamento do usuário no módulo
- `personalized`: Booleano indicando personalização

### Para CTAs de Autenticação:
- `username`: Username ou email do usuário
- `user_type`: Tipo de usuário (participant, mentor, voter, admin)
- `error_message`: Se aplicável (para eventos _failed)

### Para CTAs de Filtro/Seleção:
- `filter_type`: Tipo de filtro aplicado
- `label`: Descrição da seleção

---

## Testing & Validation

### 1. **Verificar Envio de Eventos (DevTools)**

```bash
# Terminal 1: Backend
python manage.py runserver

# Terminal 2: Frontend
npm start

# Browser DevTools: F12 → Network
# Filter by: /api/analytics/events
# Verificar payloads nos requests
```

### 2. **Verificar Logs Backend**

```bash
tail -f backend/logs/analytics.log
```

Exemplo de log esperado:
```
[2026-01-01 12:00:00] Event logged: hero-cta-click from user jcampos (variant: B, personalized: true)
```

### 3. **Query Analytics via API**

```bash
curl -X GET http://localhost:8000/api/analytics/events/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Métricas de Sucesso

| Métrica | Target | Como Medir |
|---------|--------|-----------|
| Hero CTA CTR | >5% | `hero-cta-click` / page views |
| Module Engagement | Balanceado | Distribuição de `module-card-clicked` |
| Conversion Rate | >3% | `signup_completed` / `signup_started` |
| Analytics Reliability | 99%+ | Events logged / Events sent |

---

## Troubleshooting

### Eventos Não Estão Sendo Enviados

1. **Verificar Browser Console**: `F12 → Console`
2. **Verificar Network**: `F12 → Network → /api/analytics/events`
3. **Validar Endpoint**: Confirmar `REACT_APP_API_BASE` está correto em `.env`

### Payload Incompleto

1. Verificar se campos obrigatórios estão sendo passados
2. Validar tipos de dados (timestamp deve ser número, não string)
3. Confirmar que `variant` está em A/B testing

### Erros 400/401

1. Verificar autenticação do usuário
2. Validar CORS configuration no backend
3. Confirmar se `X-Analytics-Key` é necessário

---

## Próximos Passos

1. **Integração com Mixpanel/GA4**: Configurar exportação automática de eventos
2. **Dashboard de Analytics**: Criar dashboard visual para métricas
3. **A/B Testing**: Analisar resultados de Variante A vs B
4. **Personalization Refinement**: Melhorar engine de personalização baseado em dados

---

**Última Atualização:** 2026-01-01
**Versão:** 1.0
**Status:** ✅ Implementado e Testado
