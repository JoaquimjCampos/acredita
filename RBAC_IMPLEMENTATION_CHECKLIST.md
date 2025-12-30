# ✅ Checklist de Implementação RBAC - Acredita

**Versão:** 1.0  
**Data:** 27 de Dezembro de 2025  
**Status:** Pronto para Implementação  
**Responsável:** Desenvolvimento

---

## 📋 Fase 1: Backend Foundation (Dias 1-3)

### 1.1 Setup Django Permissions

- [ ] **1.1.1** Criar arquivo `backend/accounts/management/commands/setup_permissions.py`
  - [ ] Criar grupos: Participante, Eleitor, Mentor, Administrador
  - [ ] Definir permissões para cada grupo
  - [ ] Testar: `python manage.py setup_permissions`
  - [ ] Verificar em Django Admin

- [ ] **1.1.2** Criar arquivo `backend/accounts/permissions.py`
  - [ ] Permissão: `can_create_kixikila`
  - [ ] Permissão: `can_create_marketplace_listing`
  - [ ] Permissão: `can_create_certification_course`
  - [ ] Permissão: `can_create_blog_post`
  - [ ] Permissão: `can_publish_content`
  - [ ] Permissão: `can_manage_users`
  - [ ] Permissão: `can_view_analytics`
  - [ ] Permissão: `can_moderate_content`

### 1.2 Criar Permission Classes

- [ ] **1.2.1** Arquivo `backend/core/permissions.py`
  - [ ] `IsParticipant` - user_type == 'participant'
  - [ ] `IsMentor` - user_type == 'mentor'
  - [ ] `IsAdmin` - user.is_staff
  - [ ] `IsVoter` - user_type == 'voter'
  - [ ] `IsOwnerOrAdmin` - object owner or admin
  - [ ] `CanCreateKixikila` - has permission
  - [ ] `CanCreateMarketplaceListing`
  - [ ] `CanCreateCertificationCourse`
  - [ ] `CanCreateBlogPost`
  - [ ] Testes: `backend/tests/test_permissions/test_classes.py`

### 1.3 Criar Middleware de Validação

- [ ] **1.3.1** Arquivo `backend/core/middleware.py`
  - [ ] `RoleValidationMiddleware` - validar role em todas as requests
  - [ ] Log de acesso negado
  - [ ] Log de IP + user_agent
  - [ ] Validação de rotas protegidas
  - [ ] Testes: `backend/tests/test_permissions/test_middleware.py`

### 1.4 Criar Modelo de Auditoria

- [ ] **1.4.1** Arquivo `backend/core/models.py`
  - [ ] Modelo `AuditLog`
    - [ ] user (FK)
    - [ ] action (choice: access/create/update/delete/denied)
    - [ ] resource (string: /api/v2/...)
    - [ ] method (GET/POST/PUT/DELETE)
    - [ ] status_code (integer)
    - [ ] user_role (string)
    - [ ] ip_address
    - [ ] timestamp
    - [ ] data (JSON extras)
  - [ ] Índices para query eficiente
  - [ ] Migração: `python manage.py makemigrations`
  - [ ] `python manage.py migrate`

### 1.5 Refatorar ViewSets (1 por vez)

#### 1.5.1 Certifications

- [ ] **Arquivo:** `backend/certifications/views.py`
  
  - [ ] `CertificationViewSet`
    - [ ] `get_permissions()` 
      - [ ] Create/Update/Delete: IsMentor (retorna 403 se não)
      - [ ] List/Retrieve: IsAuthenticated
    - [ ] `get_queryset()`
      - [ ] Admin: todos
      - [ ] Mentor: filtrar por instructor=user
      - [ ] Outros: apenas status='published'
    - [ ] `perform_create()`: serializer.save(instructor=self.request.user)
  
  - [ ] `CertificationSerializer`
    - [ ] Campos base: id, title, description, price
    - [ ] Condicional mentor: enrollments, revenue, edit_url
    - [ ] Condicional admin: audit_trail, flags
  
  - [ ] Testes: `backend/tests/test_certifications/test_rbac.py`
    - [ ] test_mentor_can_create
    - [ ] test_voter_cannot_create
    - [ ] test_queryset_filtering

#### 1.5.2 Blog

- [ ] **Arquivo:** `backend/blog/views.py`
  
  - [ ] `BlogPostViewSet`
    - [ ] `get_permissions()`: Create → IsMentor
    - [ ] `get_queryset()`: Filtrar por status/author
    - [ ] `perform_create()`: Atribuir author automaticamente
  
  - [ ] Testes

#### 1.5.3 Marketplace

- [ ] **Arquivo:** `backend/marketplace/views.py`
  
  - [ ] `ListingViewSet`
    - [ ] `get_permissions()`: Create → IsParticipant
    - [ ] `get_queryset()`: Filtrar por status/provider
  
  - [ ] Testes

#### 1.5.4 Kixikila

- [ ] **Arquivo:** `backend/kixikila/views.py`
  
  - [ ] `KixikilaGroupViewSet`
    - [ ] `get_permissions()`: Create → IsParticipant
    - [ ] `get_queryset()`: Apenas grupos onde é membro/admin
  
  - [ ] Testes

### 1.6 Setup Auditoria

- [ ] **1.6.1** Criar signal handlers
  - [ ] post_save (AuditLog) em todas as criações
  - [ ] post_update (AuditLog) em updates
  - [ ] AuditLog on API access (middleware)

- [ ] **1.6.2** Dashboard de Auditoria (Backend)
  - [ ] ViewSet: `AuditLogViewSet` (admin-only)
  - [ ] Filtros: user, action, resource, date range
  - [ ] Exportar CSV

### 1.7 Testes Backend

- [ ] **1.7.1** Suite de Testes
  - [ ] `backend/tests/test_permissions/`
    - [ ] `test_participant_can_create_kixikila.py`
    - [ ] `test_voter_cannot_create_kixikila.py`
    - [ ] `test_mentor_can_create_course.py`
    - [ ] `test_admin_can_do_everything.py`
    - [ ] `test_queryset_filtering.py`
    - [ ] `test_serializer_fields.py`
  
  - [ ] Executar: `pytest backend/tests/test_permissions/`
  - [ ] Cobertura: >90%

---

## 📋 Fase 2: Frontend Implementation (Dias 4-5)

### 2.1 Hook: usePermissions

- [ ] **2.1.1** Arquivo `frontend/src/hooks/usePermissions.ts`
  - [ ] Função: `usePermissions()`
  - [ ] Retorna:
    - [ ] `isMentor: boolean`
    - [ ] `isParticipant: boolean`
    - [ ] `isAdmin: boolean`
    - [ ] `isVoter: boolean`
    - [ ] `canCreateKixikila: boolean`
    - [ ] `canCreateMarketplaceListing: boolean`
    - [ ] `canCreateCertificationCourse: boolean`
    - [ ] `canCreateBlogPost: boolean`
  - [ ] Testes: `frontend/src/__tests__/hooks/usePermissions.test.ts`

### 2.2 ProtectedRoute Estendida

- [ ] **2.2.1** Modificar `frontend/src/components/auth/ProtectedRoute.tsx`
  - [ ] Props: `requiredRole?: string`
  - [ ] Props: `requiredPermission?: keyof ReturnType<usePermissions>`
  - [ ] Lógica:
    - [ ] Se não autenticado: redirecionar para /login
    - [ ] Se requiredRole e não tem: render AccessDenied
    - [ ] Se requiredPermission e não tem: render AccessDenied
    - [ ] Caso contrário: render children
  - [ ] Componente: `AccessDenied` (página 403)

- [ ] **2.2.2** Usar em App.tsx
  ```tsx
  <Route 
    path="/kixikila" 
    element={
      <ProtectedRoute requiredRole="participant">
        <KixikilaPage />
      </ProtectedRoute>
    }
  />
  ```

### 2.3 Navegação Adaptativa

- [ ] **2.3.1** Modificar `frontend/src/components/layout/Layout.tsx`
  - [ ] Usar `usePermissions()` no componente
  - [ ] Definir items com `show` condicional
  - [ ] Renderizar apenas items visíveis
  - [ ] Exemplo:
    ```tsx
    {
      label: 'Meu Kixikila',
      path: '/kixikila',
      show: perms.isParticipant,
      icon: Users
    }
    ```

- [ ] **2.3.2** Remover Rotas Duplicadas
  - [ ] Remover: `/participants` (manter apenas `/participantes` ou decidir)
  - [ ] Padronizar: pt (português) para rotas principais
  - [ ] Manter: aliases para SEO (com redirect 301)

### 2.4 UI Sensível ao Perfil

- [ ] **2.4.1** Dashboard por Perfil
  - [ ] `frontend/src/pages/DashboardPage.tsx`
  - [ ] Widgets diferentes por role
  - [ ] Conteúdo recomendado por role

- [ ] **2.4.2** CTAs Contextuais
  - [ ] HomePage: CTA diferente se Eleitor vs Participante
  - [ ] Usar `HeroVariant` já existente + novas variantes por role

- [ ] **2.4.3** Modais de Upgrade
  - [ ] Eleitor clica "Vender" → Modal "Upgrade para Participante"
  - [ ] Mentor clica "Criar Curso" → (já pode, sem modal)

### 2.5 Testes Frontend

- [ ] **2.5.1** `frontend/src/__tests__/hooks/usePermissions.test.ts`
  - [ ] test_mentor_permissions
  - [ ] test_participant_permissions
  - [ ] test_voter_permissions
  - [ ] test_admin_permissions

- [ ] **2.5.2** `frontend/src/__tests__/components/ProtectedRoute.test.tsx`
  - [ ] test_renders_component_if_authenticated
  - [ ] test_redirects_if_not_authenticated
  - [ ] test_denies_if_role_mismatch

- [ ] **2.5.3** `frontend/src/__tests__/components/Layout.test.tsx`
  - [ ] test_shows_correct_menu_items_by_role

---

## 📋 Fase 3: Transição de Perfis (Dia 6)

### 3.1 Modelo de Transição

- [ ] **3.1.1** Arquivo `backend/accounts/models.py`
  - [ ] Modelo: `UserRoleTransition`
    - [ ] user (FK)
    - [ ] from_role (string)
    - [ ] to_role (string)
    - [ ] status (pending/approved/rejected)
    - [ ] reason (texto)
    - [ ] requested_at (timestamp)
    - [ ] approved_by (FK → admin)
    - [ ] approved_at (timestamp)
  
  - [ ] Métodos:
    - [ ] `approve()`: Atualizar user.user_type + groups
    - [ ] `reject()`: Email de rejeição

- [ ] **3.1.2** ViewSet `UserRoleTransitionViewSet`
  - [ ] Create: Criar requisição
  - [ ] List: Ver minhas requisições
  - [ ] Approve (admin-only): Aprovar
  - [ ] Reject (admin-only): Rejeitar

### 3.2 Frontend: UX de Upgrade

- [ ] **3.2.1** Modal de Requisição
  - [ ] Componente: `RoleUpgradeModal`
  - [ ] Campos: motivo, categoria
  - [ ] Submit: POST /api/v2/accounts/role-transition/
  - [ ] Success: Email + notificação

- [ ] **3.2.2** Automação (Opcional)
  - [ ] Se completou 3 cursos → Mentor automático
  - [ ] Se fez 1ª venda → Participante automático confirmado

---

## 📋 Fase 4: Auditoria & Compliance (Dia 7)

### 4.1 Dashboard de Auditoria (Admin)

- [ ] **4.1.1** Backend ViewSet
  - [ ] `AuditLogViewSet` (admin-only)
  - [ ] GET: Listar logs com filtros
  - [ ] Filtros: user, action, resource, date_range
  - [ ] Exportar: CSV

- [ ] **4.1.2** Frontend Page
  - [ ] `frontend/src/pages/AuditLogPage.tsx` (admin-only)
  - [ ] Tabela: user | action | resource | time | ip
  - [ ] Filtros: data range, tipo ação, utilizador
  - [ ] Busca: recurso, IP

### 4.2 Rate Limiting

- [ ] **4.2.1** Backend
  - [ ] `throttle_classes` = [UserRateThrottle]
  - [ ] Limites: Admin (1000/hr) | Mentor (100/hr) | Participante (50/hr) | Eleitor (20/hr)
  - [ ] Implementar em `settings.py`

### 4.3 Alertas de Anomalias

- [ ] **4.3.1** Criar signal handlers
  - [ ] Alerta: >5 acessos negados por utilizador em 10 min
  - [ ] Alerta: Acesso de novo IP
  - [ ] Alerta: Múltiplas rôles para 1 utilizador (data inconsistency)

---

## 📋 Fase 5: Testing Integrado (Dias 8-10)

### 5.1 Testes de Segurança

- [ ] **5.1.1** Penetration Testing
  - [ ] Tentar burlar permissões
  - [ ] Tentar acessar dados de outros utilizadores
  - [ ] Tentar escalar privilégios

- [ ] **5.1.2** Audit Trail Verification
  - [ ] Verificar que todas as ações estão logged
  - [ ] Verificar que IPs estão registados
  - [ ] Verificar timestamps

### 5.2 Testes de Performance

- [ ] **5.2.1** Load Testing
  - [ ] 1000 utilizadores simultâneos
  - [ ] Verificar que permission checks são rápidos (<10ms)
  - [ ] Verificar que queries são otimizadas (sem N+1)

### 5.3 Testes de Compatibilidade

- [ ] **5.3.1** Navegadores
  - [ ] Chrome, Firefox, Safari, Edge
  - [ ] Mobile: iOS + Android

- [ ] **5.3.2** Versões Django/DRF
  - [ ] Compatibilidade com versões atuais
  - [ ] Testar upgrades

---

## 📋 Fase 6: Staging & Production (Dias 11-15)

### 6.1 Staging Deployment

- [ ] **6.1.1** Preparação
  - [ ] Backup de dados
  - [ ] Rollback plan
  - [ ] Notifications para users

- [ ] **6.1.2** Deploy
  - [ ] `git merge feature/rbac-implementation` → main
  - [ ] `python manage.py migrate --settings=backend.acredita_backend.settings_staging`
  - [ ] Verificar: 200 OK em endpoints críticos
  - [ ] Verificar: Permissions funcionando

- [ ] **6.1.3** Smoke Tests
  - [ ] Login (Eleitor, Participante, Mentor, Admin)
  - [ ] Acesso a módulos por role
  - [ ] Acesso negado onde esperado
  - [ ] Audit logs registados

### 6.2 User Testing (1-2 dias)

- [ ] **6.2.1** Beta Users
  - [ ] 50-100 utilizadores da comunidade
  - [ ] Feedback: UX, permissões, bugs

- [ ] **6.2.2** Análise de Feedback
  - [ ] Bugs encontrados
  - [ ] Sugestões de melhoria
  - [ ] Fixes prioritários

### 6.3 Production Deployment

- [ ] **6.3.1** Final Checks
  - [ ] Backup completo
  - [ ] Rollback tested
  - [ ] Oncall team pronto

- [ ] **6.3.2** Deploy (Horário de Baixa Atividade)
  - [ ] Merge feature branch
  - [ ] Migrations
  - [ ] Restart services
  - [ ] Health checks

- [ ] **6.3.3** Monitoring
  - [ ] Alertas: 403 errors > threshold
  - [ ] Alertas: Latência > 500ms
  - [ ] Dashboards: Usage por role, Top errors

- [ ] **6.3.4** Communication
  - [ ] Email: "RBAC agora ativo"
  - [ ] Blog: "O que mudou"
  - [ ] FAQ: Perguntas comuns

---

## 🎯 Prioridades e Dependências

### Must Have (MVP) - Semana 1
```
Phase 1: Backend Foundation
  ├─ 1.1: Django Permissions
  ├─ 1.2: Permission Classes
  ├─ 1.3: Middleware
  ├─ 1.4: AuditLog Model
  ├─ 1.5: ViewSet Refactoring (Certifications, Blog, Marketplace, Kixikila)
  └─ 1.7: Testing

Phase 2: Frontend
  ├─ 2.1: usePermissions Hook
  ├─ 2.2: ProtectedRoute Extended
  ├─ 2.3: Navigation Adaptive
  └─ 2.5: Testing
```

### Should Have (Sprint 2) - Semana 2
```
Phase 3: Role Transitions
  ├─ 3.1: Model + ViewSet
  └─ 3.2: Frontend UX

Phase 4: Auditoria
  ├─ 4.1: Dashboard
  └─ 4.2-4.3: Alertas
```

### Nice to Have (Sprint 3) - Semana 3+
```
- Advanced Analytics por role
- Custom Workflows
- ML-based Role Recommendations
- SSO Integration
```

---

## 📊 Progress Tracking

### Status Template

```
Date: ___/___/2025
Phase: ___
Task: _______________
Status: [ ] Not Started [ ] In Progress [ ] Blocked [ ] Complete
Blockers: _______________
% Complete: ___
Notes: _______________
```

### Marcos Principais

- [ ] Dia 3: Backend Foundation 100%
- [ ] Dia 5: Frontend Implementation 100%
- [ ] Dia 6: Role Transitions 100%
- [ ] Dia 7: Auditoria 100%
- [ ] Dia 10: Testing 100%
- [ ] Dia 12: Staging Live
- [ ] Dia 14: User Testing Feedback
- [ ] Dia 15: Production Deploy

---

## 🚨 Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| Dados inconsistentes (users com múltiplos roles) | Médio | Alto | Script de validação, testes |
| Performance degradation | Médio | Alto | Load testing, query optimization |
| Permissões muito restritivas (bloqueiam features) | Alto | Médio | User testing, rollback plan |
| Bugs em production | Médio | Alto | Staging testing, rollback pronto |
| Migrate data issues | Baixo | Alto | Backup, dry-run migrations |

---

## ✅ Sign-Off

- [ ] **Tech Lead:** _________________ Data: ___/___/2025
- [ ] **Product Owner:** _________________ Data: ___/___/2025
- [ ] **QA Lead:** _________________ Data: ___/___/2025

---

**Documento:** Checklist RBAC Implementation  
**Versão:** 1.0  
**Status:** Pronto para Aprovação  
**Próxima Ação:** Sprint Planning
