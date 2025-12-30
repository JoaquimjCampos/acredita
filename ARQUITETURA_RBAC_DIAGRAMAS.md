# 📐 Arquitetura RBAC - Diagramas Visuais

---

## 1️⃣ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  useAuth() + usePermissions() + ProtectedRoute           │   │
│  │  - Renderização condicional por role                     │   │
│  │  - Menu adaptativo                                       │   │
│  │  - UI sensível ao perfil                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 │ HTTP/JWT Token + X-User-Role
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                  API Gateway / Load Balancer                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - Rate Limiting por Role                                │   │
│  │  - Request Logging                                       │   │
│  │  - Circuit Breaker                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DJANGO REST FRAMEWORK                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  1. RoleValidationMiddleware                             │   │
│  │     - Extrai role do JWT                                 │   │
│  │     - Bloqueia acesso não autorizado                     │   │
│  │     - Loga tentativas negadas                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  2. ViewSet + Permission Classes                         │   │
│  │     - IsMentor, IsParticipant, IsAdmin                   │   │
│  │     - IsOwnerOrAdmin (dados pessoais)                    │   │
│  │     - CanCreateXXX (ações específicas)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  3. Queryset Filtering                                   │   │
│  │     - Admin: Vê tudo                                     │   │
│  │     - Mentor: Seus cursos                                │   │
│  │     - Participante: Suas vendas                          │   │
│  │     - Eleitor: Dados públicos                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  4. Role-Aware Serializer                                │   │
│  │     - Campos diferentes por role                         │   │
│  │     - Validação customizada                              │   │
│  │     - Mascarar dados sensíveis                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  5. Model Layer (Django ORM)                             │   │
│  │     - Django Groups + Permissions                        │   │
│  │     - AuditLog (rastreabilidade)                         │   │
│  │     - Cache de roles                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  - auth_group (Participante, Eleitor, Mentor, Admin)            │
│  - auth_permission (can_create_kixikila, can_publish_blog, ...) │
│  - core_auditlog (TODO log)                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Fluxo de Autenticação & Autorização

```
USER LOGIN
    ↓
┌─────────────────────────────────────┐
│ 1. Django Auth                      │
│    username + password              │
│    ↓                                │
│    User.objects.get(...)            │
│    ↓                                │
│    user.user_type (Eleitor)         │
│    user.groups (Eleitor group)      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. JWT Token Generation             │
│    (rest_framework_simplejwt)       │
│    ↓                                │
│    Token = {                        │
│      user_id: 123,                  │
│      user_type: 'voter',            │
│      groups: ['voter'],             │
│      perms: [...]                   │
│      iat: <timestamp>,              │
│      exp: <timestamp>               │
│    }                                │
│    ↓                                │
│    Return: {access, refresh}        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Frontend Store Token             │
│    localStorage.setItem('token')    │
└─────────────────────────────────────┘
    ↓
CADA REQUEST SUBSEQUENTE
    ↓
┌─────────────────────────────────────┐
│ 4. Frontend envia JWT               │
│    Authorization: Bearer <token>    │
│    X-User-Role: voter               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 5. Backend Valida JWT               │
│    JWTAuthentication().authenticate │
│    ↓                                │
│    Verifica assinatura              │
│    Verifica expiração               │
│    Extrai user_id                   │
│    ↓                                │
│    user = User.get(id=user_id)      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 6. RoleValidationMiddleware         │
│    user_type = 'voter'              │
│    ↓                                │
│    Rota /api/v2/kixikila/ ?         │
│    Permitida para 'voter' ? NÃO     │
│    ↓                                │
│    Log: Access Denied               │
│    ↓                                │
│    Return 403 Forbidden             │
└─────────────────────────────────────┘
    (ou permitir, se autorizado)
    ↓
┌─────────────────────────────────────┐
│ 7. Permission Classes               │
│    permission_classes = [IsMentor]  │
│    IsMentor.has_permission(...) ?   │
│    user.user_type == 'mentor' ?     │
│    ↓                                │
│    SIM → Continuar                  │
│    NÃO → Return 403 Forbidden       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 8. ViewSet get_queryset()           │
│    if user.is_staff:                │
│      queryset = all()               │
│    elif user.user_type == 'mentor': │
│      queryset = filter(owner=user)  │
│    else:                            │
│      queryset = filter(public=True) │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 9. Serializer                       │
│    class CertificationSerializer:   │
│      def get_fields(self):          │
│        if role == 'admin':          │
│          include all_fields         │
│        elif role == 'mentor':       │
│          include mentor_fields      │
│        else:                        │
│          include public_fields      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 10. Response                        │
│     Dados filtrados + permissões    │
│     ↓                               │
│     HTTP 200 + JSON                 │
│     (ou HTTP 403 se negado)         │
└─────────────────────────────────────┘
    ↓
FRONTEND
    ↓
    usePermissions() → Renderizar UI
```

---

## 3️⃣ Estado de Permissões por Módulo

### Matriz Visual

```
                 PUBLIC  ELEITOR  PARTIC.  MENTOR  ADMIN
HomePage         ✅      ✅       ✅       ✅      ✅
Auth            ✅      ✅       ✅       ✅      ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dashboard       ❌      ✅       ✅       ✅      ✅
Voting          ❌      ✅       ✅       ✅      ✅
Seasons (View)  ❌      👁️       ✅       ✅      ✅
Games           ❌      ✅       ✅       ✅      ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Certs (View)    ❌      ✅       ✅       ✅      ✅
Certs (Create)  ❌      ❌       ❌       ✅      ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Market (View)   ❌      ✅       ✅       ✅      ✅
Market (Sell)   ❌      ❌       ✅       ✅      ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kixikila (View) ❌      ❌       ✅       ✅      ✅
Kixikila (Mgmt) ❌      ❌       ✅       ❌      ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Blog (View)     ❌      ✅       ✅       ✅      ✅
Blog (Create)   ❌      ❌       ❌       ✅      ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Content Mgmt    ❌      ❌       ❌       ✅      ✅
Participants    ❌      ✅       ✅       ✅      ✅
Donations       ❌      ✅       ✅       ✅      ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin Panel     ❌      ❌       ❌       ❌      ✅
Analytics       ❌      ❌       ❌       ❌      ✅

Legenda:
✅ = Acesso Total
👁️ = Acesso Limitado
❌ = Sem Acesso
```

---

## 4️⃣ Estado de Dados por Role

### Certificações (Exemplo)

```
┌──────────────────────────────────────────────────────────┐
│  MODELO: Certification                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │ id: 1                                              │  │
│  │ title: "Python 101"                                │  │
│  │ instructor: User(id=5, type='mentor')              │  │
│  │ status: 'published'                                │  │
│  │ price: 50.00                                       │  │
│  │ created_at: 2025-12-27                             │  │
│  │ updated_at: 2025-12-27                             │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PÚBLICO (Anonymous)                │
│  ❌ Acesso Negado                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ELEITOR                            │
│  {                                  │
│    "id": 1,                         │
│    "title": "Python 101",           │
│    "instructor": { "id": 5, ... },  │
│    "status": "published",           │
│    "price": 50.00,                  │
│    "can_enroll": true,              │
│  }                                  │
│  ✅ Campos públicos apenas          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PARTICIPANTE (enrolled)            │
│  {                                  │
│    ... (todos campos do eleitor),   │
│    "progress": 45,                  │
│    "last_completed_lesson": 3,      │
│    "my_grade": 8.5,                 │
│    "certificate_available": true,   │
│  }                                  │
│  ✅ Campos públicos + pessoais      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  MENTOR (instructor)                │
│  {                                  │
│    ... (todos campos),              │
│    "enrollments": [                 │
│      { user_id: 10, progress: 45 }, │
│      ...                            │
│    ],                               │
│    "revenue": 500.00,               │
│    "edit_url": "/edit/1",           │
│  }                                  │
│  ✅ Campos administrativos          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ADMIN                              │
│  {                                  │
│    ... (TUDO + audit trail),        │
│    "audit_log": [                   │
│      { action: 'created', ... },    │
│      { action: 'updated', ... },    │
│    ],                               │
│    "internal_notes": "...",         │
│    "flags": [...],                  │
│  }                                  │
│  ✅ Acesso total + audit            │
└─────────────────────────────────────┘
```

---

## 5️⃣ Fluxo de Transição de Perfil

```
┌──────────────────────────────┐
│  NOVO UTILIZADOR             │
│  user_type = 'voter'         │
│  groups = [Eleitor]          │
│  permissions = [read_only]   │
└──────────────────────────────┘
         ↓
    USUÁRIO CUMPRE:
    - Verificação de email
    - Completar perfil
    - Aceitar termos
         ↓
    USUÁRIO PEDE UPGRADE:
    ┌──────────────────────────┐
    │ Clica "Quero Vender"     │
    │        ↓                 │
    │ Modal de Requisição      │
    │ "Quer virar Participante?"
    │        ↓                 │
    │ Preenche formulário:     │
    │ - Razão                  │
    │ - Categoria              │
    │        ↓                 │
    │ Submit                   │
    └──────────────────────────┘
         ↓
┌──────────────────────────────┐
│  VALIDAÇÃO (Manual/Auto)     │
│  - Admin revê               │
│  - Aprova ou Rejeita        │
│        ↓                     │
│  Update User:               │
│  user_type = 'participant'  │
│  groups = [Participante]    │
│  permissions = [create_kix] │
│        ↓                     │
│  Email: Bem-vindo!          │
│  "Agora pode vender..."     │
└──────────────────────────────┘
         ↓
┌──────────────────────────────┐
│  PARTICIPANTE ATIVO          │
│  - Cria grupo Kixikila      │
│  - Vende no Marketplace     │
│  - Participa em Temporadas  │
└──────────────────────────────┘
         ↓
    PODE EVOLUIR PARA MENTOR:
    - Se criar 3+ cursos → Mentor automático
    - Ou requisitar manualmente
```

---

## 6️⃣ Componentes Frontend: Renderização Condicional

```tsx
┌─────────────────────────────────────────────────┐
│  Dashboard Component                            │
│                                                 │
│  const { user } = useAuth();                    │
│  const perms = usePermissions();                │
│                                                 │
│  return (                                       │
│    <div>                                        │
│      {/* Sempre visível */}                     │
│      <DashboardStats />                         │
│                                                 │
│      {/* Condicional: Participante */}          │
│      {perms.isParticipant && (                  │
│        <>                                       │
│          <KixikilaWidget />                     │
│          <MarketplaceWidget />                  │
│        </>                                      │
│      )}                                         │
│                                                 │
│      {/* Condicional: Mentor */}                │
│      {perms.isMentor && (                       │
│        <>                                       │
│          <MyCourses />                          │
│          <StudentManagement />                  │
│        </>                                      │
│      )}                                         │
│                                                 │
│      {/* Condicional: Admin */}                 │
│      {perms.isAdmin && (                        │
│        <>                                       │
│          <GlobalStats />                        │
│          <UserManagement />                     │
│          <Audit />                              │
│        </>                                      │
│      )}                                         │
│    </div>                                       │
│  );                                             │
└─────────────────────────────────────────────────┘
```

---

## 7️⃣ Database Schema

```sql
-- Tabelas Existentes (estender)
auth_user (já existe)
├─ id (PK)
├─ username
├─ email
├─ user_type ('participant', 'voter', 'mentor', 'admin')
├─ groups (M2M → auth_group)
└─ user_permissions (M2M → auth_permission)

auth_group (usar padrão Django)
├─ id (PK)
├─ name ('Participante', 'Eleitor', 'Mentor', 'Admin')
└─ permissions (M2M → auth_permission)

auth_permission (estender)
├─ id (PK)
├─ content_type_id
├─ codename ('can_create_kixikila', 'can_publish_blog', ...)
└─ name

-- NOVA Tabela
core_auditlog
├─ id (PK)
├─ user_id (FK → auth_user)
├─ action ('access', 'create', 'update', 'delete', 'denied')
├─ resource ('/api/v2/kixikila/')
├─ method ('GET', 'POST', ...)
├─ status_code (200, 403, ...)
├─ user_role ('voter', 'participant', ...)
├─ ip_address
├─ timestamp (index)
└─ data (JSON extras)
```

---

## 8️⃣ Checklist de Segurança

```
🔐 AUTENTICAÇÃO
✅ JWT com expiração
✅ Refresh tokens
✅ Logout limpa tokens
✅ HTTPS only (production)

🔐 AUTORIZAÇÃO
✅ Permission classes em todos os ViewSets
✅ Queryset filtering por role
✅ Serializers role-aware
✅ Middleware de validação
✅ Rate limiting por role
✅ Não confiar em X-User-Role (derivar do JWT)

🔐 AUDITORIA
✅ AuditLog de todas as ações
✅ IP logging
✅ Timestamps (timezone-aware)
✅ User-agent tracking

🔐 DATA PROTECTION
✅ Mascarar emails/telefones por role
✅ Não retornar senhas
✅ Não retornar tokens em responses
✅ Validar entrada (inputs)
✅ Sanitizar outputs

🔐 MONITORING
✅ Alertas de acesso negado
✅ Alertas de anomalias
✅ Dashboard de auditoria
✅ Logs centralizados (Sentry/ELK)
```

---

**Fim dos Diagramas**

Referência: `ANALISE_FLUXOS_UTILIZADOR.md` + `GUIA_RAPIDO_RBAC.md`
