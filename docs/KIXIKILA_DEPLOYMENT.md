# Kixikila - Checklist de Deployment

## Pré-Requisitos

### Ambiente de Desenvolvimento
- [ ] Python 3.9+ instalado
- [ ] Node.js 18+ e npm/yarn instalados
- [ ] Django 4.2+ configurado
- [ ] React 18+ configurado
- [ ] PostgreSQL ou SQLite configurado

### Dependências Backend
```bash
pip install djangorestframework
pip install django-cors-headers
pip install django-filter
```

### Dependências Frontend
```bash
npm install axios react-router-dom lucide-react react-hot-toast
```

---

## Backend Deployment

### 1. Migrações de Base de Dados

**Criar e Aplicar Migrações:**
```bash
# Criar migrações para o modelo KixikilaPayout
python manage.py makemigrations kixikila

# Aplicar migrações
python manage.py migrate kixikila

# Verificar status das migrações
python manage.py showmigrations kixikila
```

**Verificar Tabelas Criadas:**
```sql
-- Conectar ao banco de dados
psql -U postgres -d acredita_db

-- Listar tabelas kixikila
\dt kixikila*

-- Ver estrutura da tabela payouts
\d kixikila_kixikilapayout
```

**Campos Esperados em `kixikila_kixikilapayout`:**
- `id` (PK)
- `group_id` (FK → kixikila_group)
- `recipient_id` (FK → auth_user)
- `round` (IntegerField)
- `total_amount` (DecimalField)
- `platform_fee` (DecimalField)
- `net_amount` (DecimalField)
- `scheduled_date` (DateField)
- `status` (CharField: scheduled/processing/completed/failed)
- `payment_method` (CharField: bank_transfer/cash/mobile_money)
- `notes` (TextField, nullable)
- `created_at`, `updated_at` (DateTimeFields)

---

### 2. Configurar URLs

**Verificar `backend/kixikila/urls.py`:**
```python
from rest_framework.routers import DefaultRouter
from .views import KixikilaPayoutViewSet

router = DefaultRouter()
router.register(r'payouts', KixikilaPayoutViewSet, basename='kixikila-payout')

urlpatterns = router.urls
```

**Verificar `backend/acredita_backend/urls.py`:**
```python
urlpatterns = [
    path('api/kixikila/', include('backend.kixikila.urls')),
]
```

**Testar Endpoints:**
```bash
# Listar payouts (requer autenticação)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/kixikila/payouts/

# Criar payout para ronda
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"group_id": 1, "round": 1, "recipient_id": 2, "payment_method": "bank_transfer"}' \
  http://localhost:8000/api/kixikila/payouts/create_for_round/
```

---

### 3. Configurar Permissões

**Adicionar `IsAdminUser` às actions:**
```python
# Em views.py
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class KixikilaPayoutViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def create_for_round(self, request):
        # ...
```

**Verificar Permissões:**
- ✅ Usuários autenticados podem listar seus próprios payouts
- ✅ Administradores podem ver todos os payouts
- ✅ Apenas administradores podem criar/processar/completar payouts

---

### 4. Configurar Logging

**Adicionar em `settings.py`:**
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/kixikila.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'backend.kixikila': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

**Criar diretório de logs:**
```bash
sudo mkdir -p /var/log/django
sudo chown www-data:www-data /var/log/django
```

---

### 5. Testar Management Commands

**Auto-Create Payouts (Dry-Run):**
```bash
python manage.py auto_create_payouts --dry-run
```

**Saída Esperada:**
```
Processing 2 active group(s)...

Processing group: Grupo Amigos (ID: 1)
  Round 1: 5/5 contributions confirmed
  Round 1: [DRY RUN] Would create payout for maria
    Total: 25000.00 AOA
    Fee: 625.00 AOA
    Net: 24375.00 AOA

Summary:
  Groups processed: 2
  Payouts created: 0 (dry run)
```

**Process Eligible Payouts (Dry-Run):**
```bash
python manage.py process_eligible_payouts --dry-run
```

**Saída Esperada:**
```
Found 1 eligible payout(s)

Processing payout ID 5:
  Group: Grupo Amigos
  Recipient: maria
  Round: 1
  Amount: 24375.00 AOA
  ✓ All contributions confirmed
  [DRY RUN] Would mark as processing

Summary:
  Processed: 0 (dry run)
```

---

### 6. Configurar Cron Jobs

**Editar Crontab:**
```bash
crontab -e
```

**Adicionar Jobs:**
```cron
# Kixikila - Auto-criar payouts diariamente às 02:00
0 2 * * * cd /path/to/acredita && /path/to/venv/bin/python manage.py auto_create_payouts >> /var/log/kixikila_auto_create.log 2>&1

# Kixikila - Processar payouts elegíveis às 03:00
0 3 * * * cd /path/to/acredita && /path/to/venv/bin/python manage.py process_eligible_payouts >> /var/log/kixikila_process.log 2>&1
```

**Testar Manualmente:**
```bash
# Executar comando como se fosse cron
/path/to/venv/bin/python /path/to/acredita/manage.py auto_create_payouts
```

**Verificar Logs:**
```bash
tail -f /var/log/kixikila_auto_create.log
tail -f /var/log/kixikila_process.log
```

---

## Frontend Deployment

### 1. Verificar Componentes

**Componentes Criados:**
- [ ] `frontend/src/services/kixikila/payoutService.ts`
- [ ] `frontend/src/components/kixikila/PayoutsPanel.tsx`
- [ ] `frontend/src/pages/KixikilaManagementPage.tsx` (atualizado)

**Verificar Imports:**
```typescript
// Em KixikilaManagementPage.tsx
import PayoutService from '../services/kixikila/payoutService';
import PayoutsPanel from '../components/kixikila/PayoutsPanel';
import { KixikilaPayoutDTO } from '../types/api';
```

---

### 2. Adicionar Tipos TypeScript

**Verificar `frontend/src/types/api.ts`:**
```typescript
export interface KixikilaPayoutDTO {
  id: number;
  group: number;
  group_name: string;
  recipient: number;
  recipient_email: string;
  round: number;
  total_amount: string;
  platform_fee: string;
  net_amount: string;
  scheduled_date: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  payment_method: 'bank_transfer' | 'cash' | 'mobile_money' | null;
  notes: string | null;
  is_eligible: boolean;
  can_be_disbursed: boolean;
  created_at: string;
  updated_at: string;
}
```

---

### 3. Configurar Axios

**Verificar `frontend/src/services/api.ts`:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

### 4. Build e Deploy

**Desenvolvimento:**
```bash
cd frontend
npm install
npm start
```

**Produção:**
```bash
cd frontend

# Build otimizado
npm run build

# Servir com servidor estático (exemplo com serve)
npm install -g serve
serve -s build -p 3000
```

**Nginx Config (Produção):**
```nginx
server {
    listen 80;
    server_name acredita.example.com;

    location / {
        root /path/to/frontend/build;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Testes End-to-End

### 1. Criar Dados de Teste

**Via Django Shell:**
```python
python manage.py shell

from django.contrib.auth import get_user_model
from backend.kixikila.models import KixikilaGroup, KixikilaMembership, KixikilaContribution
User = get_user_model()

# Criar usuários
admin = User.objects.create_user('admin', 'admin@test.com', 'password', is_staff=True)
maria = User.objects.create_user('maria', 'maria@test.com', 'password')
joao = User.objects.create_user('joao', 'joao@test.com', 'password')
ana = User.objects.create_user('ana', 'ana@test.com', 'password')

# Criar grupo
group = KixikilaGroup.objects.create(
    name='Grupo Teste Deploy',
    admin=admin,
    monthly_contribution=10000,
    max_members=3,
    current_round=1,
    status='active'
)

# Criar membros
for i, user in enumerate([maria, joao, ana], 1):
    KixikilaMembership.objects.create(
        group=group,
        member=user,
        position=i,
        is_active=True
    )

# Criar contribuições confirmadas (ronda 1)
for membership in group.kixikila_memberships.all():
    KixikilaContribution.objects.create(
        membership=membership,
        round=1,
        amount=10000,
        status='confirmed',
        payment_date='2025-01-01'
    )

print(f"✓ Grupo criado: {group.id}")
print(f"✓ Membros: {group.kixikila_memberships.count()}")
print(f"✓ Contribuições: {KixikilaContribution.objects.filter(membership__group=group).count()}")
```

---

### 2. Testar Auto-Create Payouts

**Executar Comando:**
```bash
python manage.py auto_create_payouts --group-id=<group_id>
```

**Verificar Criação:**
```python
from backend.kixikila.models import KixikilaPayout

payout = KixikilaPayout.objects.filter(group_id=<group_id>, round=1).first()
print(f"Status: {payout.status}")
print(f"Recipient: {payout.recipient.username}")
print(f"Total: {payout.total_amount}")
print(f"Fee: {payout.platform_fee}")
print(f"Net: {payout.net_amount}")
```

**Resultado Esperado:**
```
Status: scheduled
Recipient: maria
Total: 30000.00
Fee: 750.00
Net: 29250.00
```

---

### 3. Testar Frontend

**1. Login como Admin:**
- Navegar para `http://localhost:3000/login`
- Credenciais: `admin` / `password`

**2. Acessar Grupo:**
- Ir para `http://localhost:3000/kixikila/<group_id>/manage`
- Clicar na aba "Desembolsos"

**3. Verificar PayoutsPanel:**
- [ ] Cards de resumo exibidos (Scheduled, Processing, Completed, Failed)
- [ ] Tabela com payout criado
- [ ] Status "Agendado" visível
- [ ] Data programada correta
- [ ] Botão "Processar" visível

**4. Processar Payout:**
- Clicar em "Processar" no payout agendado
- Verificar mudança de status para "Em Processamento"
- Verificar que botão "Completar" aparece

**5. Completar Payout:**
- Clicar em "Completar"
- Selecionar método de pagamento: "Transferência Bancária"
- Confirmar
- Verificar status muda para "Concluído"
- Verificar data de conclusão preenchida

**6. Verificar Dados no Backend:**
```python
payout.refresh_from_db()
print(f"Status: {payout.status}")  # completed
print(f"Payment Method: {payout.payment_method}")  # bank_transfer

membership = payout.recipient.kixikila_memberships.get(group=payout.group)
print(f"Payout Received: {membership.payout_received}")  # True
```

---

### 4. Testar Workflow Completo

**Cenário: Grupo de 3 Membros em 3 Rondas**

**Ronda 1:**
1. Confirmar contribuições dos 3 membros
2. Executar `auto_create_payouts` → cria payout para membro posição 1 (maria)
3. Processar e completar payout
4. Verificar `membership.payout_received = True` para maria

**Ronda 2:**
1. Avançar grupo para `current_round = 2`
2. Confirmar contribuições dos 3 membros
3. Executar `auto_create_payouts` → cria payout para membro posição 2 (joao)
4. Processar e completar payout
5. Verificar `membership.payout_received = True` para joao

**Ronda 3:**
1. Avançar grupo para `current_round = 3`
2. Confirmar contribuições dos 3 membros
3. Executar `auto_create_payouts` → cria payout para membro posição 3 (ana)
4. Processar e completar payout
5. Verificar `membership.payout_received = True` para ana

**Ronda 4 (Reset de Ciclo):**
1. Avançar grupo para `current_round = 4`
2. Confirmar contribuições dos 3 membros
3. Executar `auto_create_payouts` → **deve resetar ciclo** e criar payout novamente para maria
4. Verificar lógica de reset funcionando

---

## Checklist Final

### Backend
- [ ] Migrações aplicadas (`python manage.py migrate`)
- [ ] URLs configuradas e testadas
- [ ] Permissões validadas (admin vs user)
- [ ] Logging configurado (`/var/log/django/kixikila.log`)
- [ ] Management commands testados (`--dry-run` e execução real)
- [ ] Cron jobs configurados e testados
- [ ] Validações de modelo funcionando (clean(), save())
- [ ] Todas as actions do ViewSet testadas (create_for_round, process, complete, fail)

### Frontend
- [ ] PayoutService implementado e testado
- [ ] PayoutsPanel integrado em KixikilaManagementPage
- [ ] Tab "Desembolsos" visível para admins
- [ ] Modal de criação funcional
- [ ] Botões de ação (Processar, Completar, Falhar) funcionais
- [ ] Status badges com cores corretas
- [ ] Refresh manual funcional
- [ ] Build de produção (`npm run build`) sem erros
- [ ] TypeScript sem erros de tipo

### Documentação
- [ ] `KIXIKILA_PAYOUTS_FLOW.md` completo
- [ ] `KIXIKILA_AUTOMATION.md` completo
- [ ] `KIXIKILA_DEPLOYMENT.md` completo (este arquivo)
- [ ] README atualizado com novos recursos

### Segurança
- [ ] Endpoints protegidos com autenticação
- [ ] Actions administrativas protegidas com `IsAdminUser`
- [ ] Validações de entrada nos serializers
- [ ] Logs não expõem dados sensíveis
- [ ] CORS configurado corretamente

### Performance
- [ ] Queries otimizadas (select_related, prefetch_related)
- [ ] Índices de banco de dados verificados
- [ ] Paginação ativa nos endpoints de lista
- [ ] Frontend lazy-load para componentes pesados

### Monitoramento
- [ ] Logs centralizados configurados
- [ ] Alertas de erro configurados (email/Slack)
- [ ] Métricas de payouts criados/processados
- [ ] Dashboard de monitoramento (opcional)

---

## Troubleshooting Comum

### Erro: "No such table: kixikila_kixikilapayout"
**Solução:**
```bash
python manage.py makemigrations kixikila
python manage.py migrate kixikila
```

### Erro: "Permission denied" em cron jobs
**Solução:**
```bash
# Verificar permissões do script
chmod +x /path/to/script.sh

# Verificar permissões do log
sudo chown user:user /var/log/kixikila_*.log
```

### Erro: Frontend não carrega payouts
**Solução:**
1. Verificar console do navegador para erros de rede
2. Verificar se token de autenticação está presente
3. Verificar CORS no backend:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://acredita.example.com",
]
```

### Erro: Payout não é criado automaticamente
**Solução:**
1. Verificar se todas as contribuições estão `status='confirmed'`
2. Verificar se grupo tem `status='active'`
3. Executar comando com `--dry-run` para ver logs detalhados

---

**Última Atualização**: 12 de Dezembro de 2025  
**Versão**: 1.0.0  
**Autor**: Acredita Platform - Kixikila Team
