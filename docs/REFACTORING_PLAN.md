# Plano de Refatoração - Eliminação de Redundâncias

**Data:** 15 de Dezembro de 2025  
**Status:** Em Progresso

## Redundâncias Identificadas e Resolvidas ✅

### 1. Backend - Imports Duplicados
- ✅ **`backend/accounts/models.py`**: Removidos imports duplicados de `AbstractUser` e `models`
- ✅ **`backend/accounts/views.py`**: Consolidado `get_user_model()` no topo do arquivo
- ✅ **`backend/store/models.py`**: Marcado como deprecated e unmanaged

### 2. Frontend - Interfaces TypeScript
- ✅ **`ServiceListing` interface**: Criado tipo centralizado em `types/marketplace.ts`
- ✅ **MarketplaceListPage.tsx**: Substituída interface local por import centralizado
- ✅ **MarketplaceDetailPage.tsx**: Substituída interface local por import centralizado

### 3. Store App (Deprecated)
- ✅ Removido de `INSTALLED_APPS` (sessão anterior)
- ✅ Removido de `urls.py` (sessão anterior)
- ✅ Models marcados como `managed = False` para compatibilidade de migração

## Redundâncias Pendentes ⏳

### 4. UserProfile Model (CRÍTICO)
**Problema:** Campos duplicados entre `User` e `UserProfile`

**Campos em User:**
- `province`, `city`, `profile_image`, `bio`

**Campos em UserProfile:**
- Social media links, preferences, privacy settings

**Solução Recomendada:**
1. Mover campos de localização e perfil público para `User` (já estão)
2. Manter `UserProfile` apenas para preferências e privacidade
3. Ou consolidar tudo em `User` e remover `UserProfile` completamente

**Impacto:** 
- 2 migrations necessárias
- Atualizar serializers e views
- Testar autenticação completa

### 5. Autenticação Duplicada (FastAPI vs DRF)

**Endpoints Duplicados:**
- `/api/auth/login/` (DRF) vs `/token/` (FastAPI)
- `/api/accounts/register/` (DRF) vs `/register/` (FastAPI)
- `/api/accounts/profile/` (DRF) vs `/profile/` (FastAPI)

**Solução Recomendada:**
1. **Manter apenas DRF** para consistência
2. Remover endpoints FastAPI de autenticação
3. FastAPI foca em features específicas (MCP, analytics)
4. Frontend usa apenas endpoints DRF (`/api/auth/*`)

**Impacto:**
- Remover 100+ linhas de `fastapi_app/main.py`
- Atualizar documentação API
- Verificar frontend não usa endpoints FastAPI

### 6. Múltiplos Métodos de HTTP Requests (Frontend)

**Problema Atual:**
- `fetch()` direto (MarketplaceListPage, MarketplaceDetailPage)
- `apiService.*` (QuizPage, AssociationPage, CrosswordsPage)
- `axios.*` (GameList)
- `mcpFetch()` (SimulatorPage, InteractiveSimulatorPage)

**Solução Recomendada:**
1. Padronizar em **`apiService`** para todas as chamadas DRF
2. Manter **`mcpFetch`** apenas para endpoints MCP específicos
3. Remover uso direto de `fetch()` e `axios`

**Implementação:**
```typescript
// services/api.ts
class ApiService {
  // Marketplace
  async getMarketplaceListings(): Promise<ServiceListing[]> {
    const response = await this.api.get('/api/v2/marketplace/listings/');
    return response.data.results || response.data;
  }
  
  async getMarketplaceListing(id: number): Promise<ServiceListing> {
    const response = await this.api.get(`/api/v2/marketplace/listings/${id}/`);
    return response.data;
  }
}
```

**Impacto:**
- Atualizar 8-10 componentes frontend
- Melhor tratamento de erros centralizado
- Interceptors funcionam em todas as requests

### 7. User Type Alignment (Backend ↔ Frontend)

**Backend (`UserSerializer`):**
```python
fields = [
    'id', 'username', 'email', 'first_name', 'last_name',
    'user_type', 'phone_number', 'date_of_birth', 'province',
    'city', 'profile_image', 'bio', 'is_verified',
    'newsletter_subscription', 'date_joined', 'last_login'
]
```

**Frontend (`User` interface):**
```typescript
export interface User {
  id: string;
  nome: string;
  email: string;
  foto_perfil?: string;
  provincia?: string;
  idade?: number;
  first_name?: string;
  last_name?: string;
  user_type?: string;
  is_staff?: boolean;
}
```

**Problemas:**
- Naming mismatch: `nome` vs `first_name`, `foto_perfil` vs `profile_image`
- Campos faltando: `phone_number`, `bio`, `is_verified`, `newsletter_subscription`
- Campos extras: `idade` (calculado de `date_of_birth`?)

**Solução:**
Alinhar interface frontend com backend serializer:

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type?: string;
  phone_number?: string;
  date_of_birth?: string;
  province?: string;
  city?: string;
  profile_image?: string;
  bio?: string;
  is_verified: boolean;
  newsletter_subscription: boolean;
  date_joined: string;
  last_login?: string;
  is_staff?: boolean;
  
  // Computed properties for backwards compatibility
  nome?: string;  // Deprecated: use first_name
  foto_perfil?: string;  // Deprecated: use profile_image
  provincia?: string;  // Deprecated: use province
}
```

## Priorização

### Alta Prioridade (Próxima Sessão)
1. ✅ Imports duplicados (COMPLETO)
2. ✅ ServiceListing interface (COMPLETO)
3. ⏳ Consolidar HTTP request methods (8-10 componentes)
4. ⏳ User type alignment (types/index.ts + AuthContext)

### Média Prioridade (Semana 2)
5. ⏳ FastAPI authentication cleanup (remover duplicação)
6. ⏳ UserProfile consolidation (avaliar necessidade)

### Baixa Prioridade (Backlog)
7. ⏳ Store app removal completo (após validação marketplace)
8. ⏳ Component library consolidation (Card, Button variants)

## Métricas de Sucesso

- **Linhas removidas:** ~200+ (target: 500+)
- **Imports duplicados eliminados:** 6 de 6 ✅
- **Interfaces TypeScript unificadas:** 1 de 3
- **Endpoints duplicados removidos:** 0 de 6
- **API consistency:** 20% → 80% (target)

## Testes Necessários Após Refatoração

1. [ ] Login/Register flow completo
2. [ ] User profile update
3. [ ] Marketplace listing e detail pages
4. [ ] Quiz, Association, Crosswords gameplay
5. [ ] Build frontend sem erros TypeScript
6. [ ] Django migrations apply cleanly
7. [ ] All API endpoints return expected data

## Notas

- Manter backward compatibility durante transição
- Criar deprecated warnings para campos antigos
- Atualizar documentação de API após cada mudança
- Code review obrigatório para mudanças em autenticação
