# 📊 Análise Profunda: Fluxos de Utilizador por Perfil e Módulos

**Data:** 27 de Dezembro de 2025  
**Status:** Análise Completa | Pronto para Implementação  
**Prioridade:** 🔴 **CRÍTICA** - Impacto direto na UX e segurança

---

## 📋 Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Perfis de Utilizador Atuais](#perfis-de-utilizador-atuais)
3. [Módulos e Acesso](#módulos-e-acesso)
4. [Fluxos por Perfil](#fluxos-por-perfil)
5. [Matriz de Permissões](#matriz-de-permissões)
6. [Problemas Identificados](#problemas-identificados)
7. [Recomendações Arquitetónicas](#recomendações-arquitetónicas)
8. [Plano de Implementação](#plano-de-implementação)

---

## Resumo Executivo

### Estado Atual
- ✅ **4 Perfis Definidos** (Participante, Eleitor, Administrador, Mentor)
- ✅ **13 Módulos Principais** (Temporadas, Votação, Jogos, Marketplace, etc.)
- ⚠️ **Problemas Críticos:**
  1. **Sem RBAC explícito** - Apenas field `user_type` no User model
  2. **Acesso baseado em URL** - ProtectedRoute genérica (só verifica autenticação)
  3. **Sem modelo de permissões granulares** - Django Permissions não implementadas
  4. **Rotas duplicadas** - `/participants` e `/participantes` (mesmo conteúdo)
  5. **Sem validação de módulos por perfil** - Backend não valida acesso

### Impacto
- 🔴 **Segurança:** Usuário pode acessar dados não autorizados via API
- 🔴 **UX:** Menúdos confusos, rotas duplicadas, sem guia clara por perfil
- 🔴 **Manutenção:** Lógica de acesso espalhada entre frontend/backend
- 🟡 **Performance:** Sem cache de permissões

### Recomendação
Implementar **RBAC (Role-Based Access Control)** com:
- Django Permissions + Grupos
- Middleware de validação
- Serializers diferenciados por perfil
- Frontend com UI sensível ao perfil
- Auditoria de acesso

---

## Perfis de Utilizador Atuais

### 1️⃣ **Participante** (Participant)
**Objetivo:** Participar ativamente em temporadas/reality shows

**Características:**
- Entra em grupos (Kixikila)
- Participa em votações (Reality)
- Completa tarefas/simuladores
- Ganha reputação

**Módulos Principais:**
- Temporadas (Reality/Voting)
- Kixikila (Grupos de Poupança)
- Jogos (Quiz, Simuladores)
- Certificações (Cursos/Skills)

**Status Atual:** Bem definido, com modelo Participant associado

---

### 2️⃣ **Eleitor** (Voter)
**Objetivo:** Votar em participantes/produtos

**Características:**
- Acesso aos rankings
- Participação em votações
- Visualiza resultados
- Sem acesso a gestão

**Módulos Principais:**
- Votação (Viewing + Voting)
- Ranking/Classificação
- Blog/Conteúdo

**Status Atual:** Genérico, default para novos utilizadores

---

### 3️⃣ **Mentor** (Mentor)
**Objetivo:** Orientar, ensinar, moderar

**Características:**
- Cria/edita conteúdo educacional
- Modera discussões
- Dá feedback
- Gere grupos de aprendizagem

**Módulos Principais:**
- Certificações (Criar cursos)
- Blog (Publicar artigos)
- Conteúdo (Gestão)
- Suporte

**Status Atual:** Não implementado | Sem modelo, sem permissões

---

### 4️⃣ **Administrador** (Admin)
**Objetivo:** Gestão geral da plataforma

**Características:**
- Acesso a tudo
- Auditoria completa
- Configurações
- Relatórios

**Módulos Principais:**
- Admin Django (Tudo)
- Analytics
- Gestão de utilizadores
- Reports

**Status Atual:** Usa Django Admin, sem RBAC definido

---

## Módulos e Acesso

### Mapa de Módulos

```
ACREDITA (Raiz)
├── 🏠 HomePage (Todos - Público)
├── 🔐 Auth (Login/Registo - Todos)
│
├── 📊 DASHBOARD (Autenticado)
│   ├── Stats Pessoais
│   ├── Atividade Recente
│   └── Módulos Recomendados
│
├── 🗳️ VOTING (Eleitor+, Participante)
│   ├── Votação em Direto
│   ├── Resultados
│   └── Histórico
│
├── 🏁 SEASONS/REALITY (Participante, Eleitor)
│   ├── Detalhes Temporada
│   ├── Participantes
│   ├── Rankings
│   └── Resultados
│
├── 🎮 GAMES (Participante, Eleitor)
│   ├── Quiz (Learning)
│   ├── Simuladores (Practice)
│   ├── Associações (Community)
│   └── Palavras Cruzadas (Fun)
│
├── 🎓 CERTIFICATIONS (Participante, Mentor)
│   ├── Listar Cursos
│   ├── Inscrever
│   ├── Progresso
│   └── [Mentor] Criar Cursos
│
├── 🛍️ MARKETPLACE (Participante, Eleitor)
│   ├── Listar Produtos/Serviços
│   ├── Detalhes
│   ├── Comprar
│   └── [Participante] Vender
│
├── 💰 KIXIKILA (Participante, Mentor)
│   ├── Grupos
│   ├── Contribuir
│   ├── Saques
│   └── [Mentor] Moderar
│
├── 📚 BLOG (Eleitor+)
│   ├── Listar Posts
│   ├── Ver Post
│   └── [Mentor] Criar Post
│
├── 📄 CONTENT (Mentor+)
│   ├── Gestão de Conteúdo
│   ├── Media Manager
│   └── Publicação
│
├── 👥 PARTICIPANTS (Eleitor+)
│   ├── Listar Participantes
│   ├── Perfil
│   └── Seguir
│
├── 💳 DONATIONS (Todos)
│   ├── Listar Causas
│   └── Doar
│
└── 🛒 CART (Autenticado)
    └── Checkout
```

---

## Fluxos por Perfil

### 🔄 Fluxo: Novo Utilizador (Eleitor - Default)

```
1. Login/Registo
   ↓
2. Dashboard (Stats Básicas)
   ├─ Trust Score: 0
   ├─ Certificações: 0
   ├─ Marketplace: 0
   ├─ Kixikila: 0
   └─ Seasons: 0
   ↓
3. HomePage (Explorar)
   ├─ Modelos Recomendados
   ├─ Temporadas Ativas
   └─ Featured Content
   ↓
4. Opções:
   ├─ Ver Rankings → Voting
   ├─ Explorar Marketplace
   ├─ Ler Blog
   └─ Clicar em Module → Detalhes
   ↓
5. Acesso Negado (sem permissão):
   ├─ Não pode Criar Grupo Kixikila
   ├─ Não pode Publicar Post (Mentor-only)
   ├─ Não pode Vender no Marketplace
   └─ Não pode Acessar Painel Admin
```

### 🔄 Fluxo: Participante Ativo

```
1. Login
   ↓
2. Dashboard
   ├─ Trust Score: 150+ pts
   ├─ Grupo Kixikila: 1-5
   ├─ Certificações: 0-3
   ├─ Marketplace: 0-2 produtos
   └─ Seasons: 1-2 participações
   ↓
3. Menu Principal
   ├─ [NOVO] Meu Painel Kixikila
   ├─ [NOVO] Meus Cursos/Certificações
   ├─ [NOVO] Minha Loja
   ├─ Votação
   ├─ Participar Temporada (New)
   └─ Jogos/Aprendizagem
   ↓
4. Casos de Uso Frequentes:
   ├─ Gerir Grupo Kixikila
   │  ├─ Ver membros
   │  ├─ Aprovar saques
   │  └─ Ver ciclo ativo
   │
   ├─ Vender no Marketplace
   │  ├─ Criar/editar serviço
   │  ├─ Ver pedidos
   │  └─ Registar entrega
   │
   ├─ Participar Temporada
   │  ├─ Inscrever-se
   │  ├─ Completar tarefas
   │  └─ Votar em outros
   │
   └─ Aprender & Certificar
      ├─ Inscrever em curso
      ├─ Completar aulas
      └─ Fazer exame
```

### 🔄 Fluxo: Mentor (Educador/Moderador)

```
1. Login
   ↓
2. Dashboard Estendido
   ├─ Meus Cursos (Certificações)
   ├─ Meus Artigos (Blog)
   ├─ Grupos Supervisionados (Kixikila)
   ├─ Utilizadores Sob Mentoria
   └─ Notificações de Moderação
   ↓
3. Menu Principal
   ├─ [NOVO] Portal Mentor
   │  ├─ Criar Curso
   │  ├─ Gerir Alunos
   │  └─ Ver Progresso
   │
   ├─ [NOVO] Blogging
   │  ├─ Escrever Artigo
   │  ├─ Publicar
   │  └─ Ver Comentários
   │
   ├─ [NOVO] Moderação
   │  ├─ Grupos para Moderar
   │  ├─ Denúncias
   │  └─ Ações
   │
   ├─ Mercado (Se for Vendedor também)
   │  └─ Vender Serviços
   │
   └─ Participar (Se for Participante também)
   ↓
4. Permissões Específicas:
   ├─ Criar/Editar Cursos (Certificações)
   ├─ Publicar Posts (Blog)
   ├─ Moderar Comentários
   ├─ Gerir Documentação
   ├─ Suporte a Utilizadores
   └─ NÃO: Acesso Admin, Gestão de Pagamentos
```

### 🔄 Fluxo: Administrador

```
1. Login
   ↓
2. Dashboard Admin
   ├─ KPIs Globais
   ├─ Utilizadores Ativos
   ├─ Receita
   ├─ Alertas de Segurança
   └─ Tarefas Pendentes
   ↓
3. Menu Admin Expandido
   ├─ 👥 GESTÃO DE UTILIZADORES
   │  ├─ Listar Utilizadores
   │  ├─ Atribuir Tipos
   │  ├─ Desativar Contas
   │  └─ Ver Atividade
   │
   ├─ 📊 ANALYTICS & REPORTS
   │  ├─ Utilização por Módulo
   │  ├─ Conversões
   │  ├─ Receita por Fonte
   │  └─ Retenção
   │
   ├─ 🛡️ SEGURANÇA & COMPLIANCE
   │  ├─ Auditoria de Acesso
   │  ├─ Gestão de Permissões
   │  ├─ Logs de Sistema
   │  └─ Denúncias & Casos
   │
   ├─ ⚙️ CONFIGURAÇÕES
   │  ├─ Feature Flags
   │  ├─ Parâmetros Globais
   │  ├─ Email Templates
   │  └─ Integrações
   │
   └─ 💰 FINANCEIRO
      ├─ Payouts
      ├─ Transações
      ├─ Conformidade Fiscal
      └─ Relatórios
   ↓
4. Permissões Totais:
   ├─ Acesso a Tudo
   ├─ Criar/Editar/Deletar Qualquer Recurso
   ├─ Impersonar Utilizadores
   ├─ Ver Dados Sensíveis
   └─ Auditoria Completa
```

---

## Matriz de Permissões

### Permissões por Módulo

| Módulo | Public | Eleitor | Participante | Mentor | Admin |
|--------|--------|---------|--------------|--------|-------|
| **HomePage** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Auth** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dashboard** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Voting** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Seasons** | ❌ | 👁️ | ✅ | ✅ | ✅ |
| **Games** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Certifications (View)** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Certifications (Create)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Marketplace (Browse)** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Marketplace (Sell)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Kixikila (View)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Kixikila (Create)** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Blog (View)** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Blog (Create)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Content Manager** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Participants** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Donations** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Admin Panel** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Analytics** | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legenda:**
- ✅ Acesso Total
- 👁️ Acesso Limitado (Ver apenas)
- ❌ Sem Acesso

---

## Problemas Identificados

### 🔴 Críticos

#### 1. **Sem RBAC Explícito**
**Onde:** Backend inteiro  
**Problema:** 
- Apenas field `user_type` no User model
- Nenhuma validação de permissões nos endpoints
- Backend assume que `user_type` é respeitado no frontend

**Risco:** Usuário pode fazer request direta à API e burlar permissões

```python
# ❌ ATUAL - Vulnerável
class MeDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Só verifica autenticação
    # Sem verificação de user_type!
```

---

#### 2. **Rotas Duplicadas & Inconsistentes**
**Onde:** Frontend App.tsx  
**Problema:**
- `/participants` e `/participantes` apontam para mesma página
- Sem convenção de nomes (en/pt misturados)
- Menu de navegação não sensível ao perfil

**Risco:** Confusão para utilizador, SEO negativo

```tsx
// ❌ ATUAL
<Route path="/participants" element={<ParticipantsPage />} />
<Route path="/participantes" element={<ParticipantsPage />} />  // Duplicado!
```

---

#### 3. **Acesso Baseado em URL (Não em Permissões)**
**Onde:** Frontend ProtectedRoute.tsx  
**Problema:**
- ProtectedRoute apenas verifica `isAuthenticated`
- Se URL é acessível, usuário acessa
- Sem validação de role

**Risco:** Usuário não autorizado acessa página (mesmo que erro ao backend)

```tsx
// ❌ ATUAL
<Route path="/content-manager" element={<ProtectedRoute><MediaManagementPage /></ProtectedRoute>} />
// Se usuário conseguir acessar URL, vê a página!
```

---

#### 4. **Sem Modelo de Permissões Granulares**
**Onde:** Django Permissions  
**Problema:**
- Django tem sistema de permissions, mas não é usado
- Sem grupos definidos
- Sem permissões por tipo de utilizador

**Risco:** Impossível criar regras complexas (ex: "Mentor pode deletar apenas seus próprios posts")

```python
# ❌ NÃO EXISTE
class Meta:
    permissions = [
        ('can_create_course', 'Can create certification course'),
        ('can_publish_blog', 'Can publish blog post'),
        ('can_manage_kixikila', 'Can manage kixikila group'),
    ]
```

---

#### 5. **Sem Middleware de Validação**
**Onde:** Backend middleware  
**Problema:**
- Nenhum middleware verifica permissões por rota
- Lógica de acesso espalhada
- Sem auditoria centralizada

**Risco:** Impossível garantir segurança, difícil de auditar

---

#### 6. **Serializers Retornam Tudo para Todos**
**Onde:** Backend serializers  
**Problema:**
- UserPublicSerializer retorna campos desnecessários
- Sem diferenciação de dados por role
- Sem rate limiting por tipo de utilizador

**Risco:** Exposure de dados sensíveis (emails, telefones ocultos)

---

### 🟡 Médios

#### 7. **Menu Não Sensível ao Perfil**
**Onde:** Frontend Layout.tsx  
**Problema:**
- Menu estático (same para todos)
- Sem items contextualmente relevantes
- Sem guia clara para novo utilizador

**Impacto:** Má UX, confusão navegacional

---

#### 8. **Sem Cache de Permissões**
**Onde:** Backend + Frontend  
**Problema:**
- Cada request valida permissões do zero
- Sem caching de role/permissions
- Performance subótima em alta concorrência

**Impacto:** Latência, carga servidor

---

#### 9. **Falta Modelo de Transição Entre Perfis**
**Onde:** Sistema inteiro  
**Problema:**
- User pode ter múltiplos perfis?
- Como mudar de Eleitor → Participante?
- Timeline não definida

**Impacto:** Fluxo confuso, lógica espalhada

---

---

## Recomendações Arquitetónicas

### 🎯 Objetivo: Implementar RBAC Robusto

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                       │
├─────────────────────────────────────────────────────────┤
│ useAuth() + usePermissions()                            │
├─────────────────────────────────────────────────────────┤
│                   API CLIENT                             │
│  - Bearer Token (JWT)                                   │
│  - X-User-Role Header (cached)                          │
├─────────────────────────────────────────────────────────┤
│                   NGINX/API Gateway                      │
│  - Rate Limiting por Role                               │
│  - Logging Centralizado                                 │
├─────────────────────────────────────────────────────────┤
│                 DJANGO REST FRAMEWORK                    │
├─────────────────────────────────────────────────────────┤
│ 1. Middleware: RoleValidationMiddleware                 │
│    - Verifica role do token                             │
│    - Bloqueia acesso não autorizado                     │
│                                                          │
│ 2. Permissions: Custom Permission Classes               │
│    - IsParticipant, IsMentor, IsAdmin                   │
│    - IsOwnerOrAdmin (para dados pessoais)               │
│                                                          │
│ 3. Serializers: Role-Aware                              │
│    - Diferentes campos por role                         │
│    - Validação customizada                              │
│                                                          │
│ 4. ViewSets: Filtro + Permissions                       │
│    - Filtra dados por role                              │
│    - Valida operações (create, update, delete)          │
│                                                          │
│ 5. Models: Django Groups + Permissions                  │
│    - Auth_group para cada role                          │
│    - Permissions granulares                             │
│                                                          │
│ 6. Auditoria: AuditLog Model                            │
│    - Registra acesso/alterações                         │
│    - Rastreabilidade completa                           │
└─────────────────────────────────────────────────────────┘
```

---

### 📐 Implementação Detalhada

#### **1. Backend: Django Groups & Permissions**

```python
# backend/accounts/permissions.py

from django.contrib.auth.models import Permission, Group, ContentType
from django.contrib.auth import get_user_model

def setup_permissions():
    """Create groups and permissions for RBAC"""
    
    # Criar grupos
    participant_group, _ = Group.objects.get_or_create(name='Participante')
    voter_group, _ = Group.objects.get_or_create(name='Eleitor')
    mentor_group, _ = Group.objects.get_or_create(name='Mentor')
    admin_group, _ = Group.objects.get_or_create(name='Administrador')
    
    # Permissões customizadas
    permissions = [
        ('can_create_kixikila', 'Can create kixikila group'),
        ('can_create_marketplace_listing', 'Can create marketplace listing'),
        ('can_create_certification_course', 'Can create certification course'),
        ('can_create_blog_post', 'Can create blog post'),
        ('can_publish_content', 'Can publish content'),
        ('can_manage_users', 'Can manage users'),
        ('can_view_analytics', 'Can view analytics'),
        ('can_approve_transactions', 'Can approve transactions'),
        ('can_moderate_content', 'Can moderate content'),
    ]
    
    # Adicionar permissões a grupos
    participant_perms = [
        'can_create_kixikila',
        'can_create_marketplace_listing',
        'can_publish_content',
    ]
    
    mentor_perms = participant_perms + [
        'can_create_certification_course',
        'can_create_blog_post',
        'can_publish_content',
        'can_moderate_content',
    ]
    
    admin_perms = mentor_perms + [
        'can_manage_users',
        'can_view_analytics',
        'can_approve_transactions',
    ]
    
    # Atribuir permissões aos grupos
    for perm_codename, _ in permissions:
        perm = Permission.objects.get(codename=perm_codename)
        participant_group.permissions.add(perm)
        mentor_group.permissions.add(perm)
        admin_group.permissions.add(perm)
    
    return {
        'participant': participant_group,
        'voter': voter_group,
        'mentor': mentor_group,
        'admin': admin_group,
    }
```

---

#### **2. Backend: Permission Classes**

```python
# backend/core/permissions.py

from rest_framework import permissions

class IsParticipant(permissions.BasePermission):
    """Permite apenas utilizadores com tipo Participante"""
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'participant'

class IsMentor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'mentor'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user == request.user

class CanManageKixikila(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('accounts.can_create_kixikila')
```

---

#### **3. Backend: Middleware para Validação**

```python
# backend/core/middleware.py

from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied
import logging

logger = logging.getLogger(__name__)

class RoleValidationMiddleware(MiddlewareMixin):
    """Valida role do utilizador e bloqueia acesso não autorizado"""
    
    # Mapeamento de rotas para roles permitidas
    ROLE_ROUTES = {
        '/api/v2/certifications/': ['mentor', 'admin'],
        '/api/v2/blog/': ['mentor', 'admin'],
        '/api/v2/content/': ['mentor', 'admin'],
        '/api/v2/kixikila/create/': ['participant', 'admin'],
        '/api/v2/marketplace/list/create/': ['participant', 'admin'],
        '/api/admin/': ['admin'],
    }
    
    def process_request(self, request):
        # Extrair token e validar
        auth = JWTAuthentication()
        try:
            validated_user_and_token = auth.authenticate(request)
            if validated_user_and_token:
                request.user, _ = validated_user_and_token
        except:
            pass
        
        # Validar acesso à rota
        path = request.path
        for route_prefix, allowed_roles in self.ROLE_ROUTES.items():
            if path.startswith(route_prefix):
                if request.user and request.user.is_authenticated:
                    if request.user.user_type not in allowed_roles and not request.user.is_staff:
                        logger.warning(
                            f"Unauthorized access attempt: user={request.user.id}, "
                            f"path={path}, role={request.user.user_type}"
                        )
                        return None  # Deixar DRF permissions lidar
                break
```

---

#### **4. Backend: ViewSet com Permissions**

```python
# backend/certifications/views.py

from rest_framework import viewsets, permissions
from backend.core.permissions import IsMentor, IsAdmin
from .models import Certification
from .serializers import CertificationSerializer

class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Apenas Mentor ou Admin pode criar/editar
            return [permissions.IsAuthenticated(), IsMentor()]
        else:
            # Qualquer autenticado pode ver
            return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Admin vê tudo
            return Certification.objects.all()
        elif user.user_type == 'mentor':
            # Mentor vê seus cursos
            return Certification.objects.filter(instructor=user)
        else:
            # Outros veem apenas publicados
            return Certification.objects.filter(status='published')
    
    def perform_create(self, serializer):
        # Atribuir criador automaticamente
        serializer.save(instructor=self.request.user)
```

---

#### **5. Frontend: usePermissions Hook**

```typescript
// frontend/src/hooks/usePermissions.ts

import { useAuth } from '../contexts/AuthContext';

interface Permissions {
  canCreateKixikila: boolean;
  canCreateMarketplaceListing: boolean;
  canCreateCertificationCourse: boolean;
  canCreateBlogPost: boolean;
  canPublishContent: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canModeateContent: boolean;
  isMentor: boolean;
  isParticipant: boolean;
  isAdmin: boolean;
  isVoter: boolean;
}

export const usePermissions = (): Permissions => {
  const { user } = useAuth();
  
  if (!user) {
    return {
      canCreateKixikila: false,
      canCreateMarketplaceListing: false,
      canCreateCertificationCourse: false,
      canCreateBlogPost: false,
      canPublishContent: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canModeateContent: false,
      isMentor: false,
      isParticipant: false,
      isAdmin: false,
      isVoter: false,
    };
  }
  
  const userType = user.user_type || 'voter';
  
  return {
    canCreateKixikila: ['participant', 'admin'].includes(userType),
    canCreateMarketplaceListing: ['participant', 'admin'].includes(userType),
    canCreateCertificationCourse: ['mentor', 'admin'].includes(userType),
    canCreateBlogPost: ['mentor', 'admin'].includes(userType),
    canPublishContent: ['mentor', 'admin'].includes(userType),
    canManageUsers: userType === 'admin',
    canViewAnalytics: userType === 'admin',
    canModeateContent: ['mentor', 'admin'].includes(userType),
    isMentor: userType === 'mentor',
    isParticipant: userType === 'participant',
    isAdmin: userType === 'admin',
    isVoter: userType === 'voter',
  };
};
```

---

#### **6. Frontend: ProtectedRoute com Permissions**

```tsx
// frontend/src/components/auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: keyof ReturnType<typeof usePermissions>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission
}) => {
  const { isAuthenticated } = useAuth();
  const permissions = usePermissions();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !permissions[requiredPermission]) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
```

---

#### **7. Frontend: Navegação Sensível ao Perfil**

```tsx
// frontend/src/components/layout/Layout.tsx

import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const permissions = usePermissions();
  
  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: BarChart3,
      show: true, // Sempre visível para autenticados
    },
    {
      label: 'Votação',
      path: '/voting',
      icon: Vote,
      show: ['voter', 'participant', 'mentor', 'admin'].includes(user?.user_type),
    },
    {
      label: 'Meu Kixikila',
      path: '/kixikila',
      icon: Users,
      show: permissions.isParticipant || permissions.isAdmin,
    },
    {
      label: 'Minha Loja',
      path: '/marketplace/provider',
      icon: Store,
      show: permissions.canCreateMarketplaceListing,
    },
    {
      label: 'Meus Cursos',
      path: '/certifications/my-courses',
      icon: BookOpen,
      show: permissions.canCreateCertificationCourse,
    },
    {
      label: 'Publicar Post',
      path: '/blog/create',
      icon: Pen,
      show: permissions.canCreateBlogPost,
    },
    {
      label: 'Painel Admin',
      path: '/admin',
      icon: Settings,
      show: permissions.isAdmin,
    },
  ];
  
  return (
    <div>
      <Header>
        <Nav>
          {navigationItems
            .filter(item => item.show)
            .map(item => (
              <NavLink key={item.path} to={item.path}>
                <item.icon /> {item.label}
              </NavLink>
            ))}
        </Nav>
      </Header>
      <main>{children}</main>
    </div>
  );
};
```

---

### 🔐 Auditoria & Logging

```python
# backend/core/models.py

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AuditLog(models.Model):
    """Registra todas as ações de acesso/alteração"""
    
    ACTION_CHOICES = [
        ('access', 'Access'),
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('denied', 'Access Denied'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource = models.CharField(max_length=255)  # Ex: '/api/v2/kixikila/'
    method = models.CharField(max_length=10)  # GET, POST, PUT, DELETE
    status_code = models.IntegerField()
    user_role = models.CharField(max_length=20)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['user_role', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.resource} - {self.timestamp}"
```

---

## Plano de Implementação

### 📅 Fases

#### **Fase 1: Backend Foundation (3 dias)**

1. **Django Permissions Setup** (4h)
   - [ ] Criar Groups: Participante, Eleitor, Mentor, Admin
   - [ ] Definir Permissions granulares
   - [ ] Script para setup automático

2. **Permissões Classes** (4h)
   - [ ] IsParticipant, IsMentor, IsAdmin
   - [ ] IsOwnerOrAdmin (genérico)
   - [ ] CanManageXXX (específicas)

3. **Middleware de Validação** (4h)
   - [ ] RoleValidationMiddleware
   - [ ] AuditLog recording
   - [ ] Rate limiting por role

4. **ViewSets Refatorados** (8h)
   - [ ] Certifications (Mentor-only create)
   - [ ] Blog (Mentor-only create)
   - [ ] Marketplace (Participant-only sell)
   - [ ] Kixikila (Participant-only create)

5. **Testing** (4h)
   - [ ] Testes de permissões
   - [ ] Testes de acesso negado
   - [ ] Testes de dados filtrados

**Total Fase 1: 2-3 dias**

---

#### **Fase 2: Frontend Implementation (2 dias)**

1. **usePermissions Hook** (3h)
   - [ ] Implementar hook
   - [ ] Cache de permissões
   - [ ] Sincronização com backend

2. **ProtectedRoute Estendida** (3h)
   - [ ] Suporte a requiredRole
   - [ ] Suporte a requiredPermission
   - [ ] Telas de acesso negado

3. **Navegação Adaptativa** (4h)
   - [ ] Menu sensível ao perfil
   - [ ] Rotas removidas (duplicadas)
   - [ ] Convenção pt vs en resolvida

4. **UI Sensível ao Perfil** (4h)
   - [ ] Dashboard por perfil
   - [ ] CTAs contextuais
   - [ ] Modais de upgrade (Eleitor → Participante)

5. **Testing** (2h)
   - [ ] Testes de renderização por role
   - [ ] Testes de navegação

**Total Fase 2: 1-2 dias**

---

#### **Fase 3: Transição de Perfis (1 dia)**

1. **Modelo de Transição** (4h)
   - [ ] UserRoleTransition model
   - [ ] Requisição de upgrade (Eleitor → Participante)
   - [ ] Validação (KYC/verification)
   - [ ] Automação (após validação, assinalar grupo)

2. **UX de Upgrade** (4h)
   - [ ] Modal de incentivo
   - [ ] Formulário de requisição
   - [ ] Confirmação automática (ou manual)
   - [ ] Email de boas-vindas

**Total Fase 3: 1 dia**

---

#### **Fase 4: Auditoria & Compliance (1 dia)**

1. **AuditLog Completa** (4h)
   - [ ] Registar todas as ações
   - [ ] Dashboard de auditoria
   - [ ] Relatórios para admin

2. **Rate Limiting** (2h)
   - [ ] Limitador por role
   - [ ] Alerta de anomalias

**Total Fase 4: 1 dia**

---

### 🎯 Linha Temporal Completa

```
Semana 1:
├─ Day 1-3: Backend Foundation (Fase 1)
├─ Day 4-5: Frontend Implementation (Fase 2)
│
Semana 2:
├─ Day 1: Transição de Perfis (Fase 3)
├─ Day 2: Auditoria (Fase 4)
├─ Day 3-5: Testing Integrado + Refinamentos
│
Semana 3:
├─ Day 1-2: QA & Bug Fixes
├─ Day 3: Staging Deployment
├─ Day 4-5: User Testing & Feedback
│
Deployment:
└─ Production (Final)
```

**Total: ~15 dias (2.5 semanas)**

---

## Próximas Ações

1. ✅ **Aprovação:** Executiva review desta proposta
2. ⏳ **Sprint Planning:** Quebrar Fase 1 em tasks de 4-8h
3. ⏳ **Banco de Dados:** Preparar migrations para Groups/Permissions
4. ⏳ **Testing:** Começar com test-driven development (TDD)
5. ⏳ **Documentação:** Manter wiki atualizada

---

**Status:** 🟢 **Pronto para Implementação**  
**Autor:** Análise Copilot  
**Data:** 27 de Dezembro de 2025
