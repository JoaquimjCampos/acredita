# Kixikila - Fluxo de Payouts (Recebimento de Fundos)

## Visão Geral

O sistema de payouts do Kixikila gerencia o processo completo de desembolso de fundos para os beneficiários em cada ronda, desde a criação até a confirmação do pagamento.

## Arquitetura do Fluxo

### Estados do Payout

```
scheduled → processing → completed
                ↓
              failed
```

1. **scheduled**: Payout criado e agendado
2. **processing**: Em processo de desembolso
3. **completed**: Pago com sucesso
4. **failed**: Falha no pagamento

## Backend - Implementação

### Modelo `KixikilaPayout`

```python
class KixikilaPayout(models.Model):
    STATUS_CHOICES = (
        ("scheduled", "Agendado"),
        ("processing", "A processar"),
        ("completed", "Concluído"),
        ("failed", "Falhou"),
    )

    group = ForeignKey(KixikilaGroup)
    recipient = ForeignKey(User)  # Beneficiário da ronda
    round = PositiveIntegerField()  # Ronda do ciclo
    
    total_amount = DecimalField()  # Total de contribuições confirmadas
    platform_fee = DecimalField()  # Taxa da plataforma (ex: 2.5%)
    net_amount = DecimalField()  # Valor líquido (total - taxa)
    
    scheduled_date = DateField()  # Data programada
    disbursed_at = DateTimeField()  # Data efetiva do desembolso
    payment_method = CharField()  # transfer/card/cash/mobile
    status = CharField()
    
    intended_use = CharField()  # Uso pretendido (opcional)
    proof_of_use = FileField()  # Comprovativo de uso (opcional)
```

### Métodos do Modelo

#### `is_eligible` (property)
Verifica se o payout está elegível para processamento:
- Status deve ser "scheduled"
- `scheduled_date` deve ser <= hoje

#### `can_be_disbursed` (property)
Verifica se todos os requisitos estão atendidos:
- Status == "scheduled"
- Todas as contribuições da ronda confirmadas
- Número de contribuições confirmadas >= número de membros ativos

#### `mark_as_processing()`
Transição: `scheduled` → `processing`
- Valida que status atual é "scheduled"
- Atualiza status para "processing"

#### `mark_as_completed(payment_method)`
Transição: `processing` → `completed`
- Valida que status atual é "processing"
- Define `disbursed_at` = agora
- Atualiza `payment_method` (opcional)
- Atualiza membership: `payout_received = True`, `payout_date = now()`

#### `mark_as_failed(reason)`
Transição: qualquer → `failed`
- Define status como "failed"
- Registra motivo no campo `intended_use`

### Validações (`clean()`)

1. **Recipient é membro ativo**: Verifica que o beneficiário pertence ao grupo
2. **Net amount correto**: `net_amount == total_amount - platform_fee`

## Endpoints da API

### 1. Listar Payouts
```http
GET /api/v2/kixikila/payouts/
```

**Query Params:**
- `status`: scheduled/processing/completed/failed
- `group`: ID do grupo

**Resposta:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "group": 1,
      "group_name": "Grupo Amigos",
      "recipient": 2,
      "recipient_username": "maria",
      "recipient_email": "maria@example.com",
      "round": 1,
      "total_amount": "5000.00",
      "platform_fee": "125.00",
      "net_amount": "4875.00",
      "status": "completed",
      "scheduled_date": "2025-01-01",
      "disbursed_at": "2025-01-02T14:30:00Z",
      "payment_method": "transfer",
      "is_eligible": false,
      "can_be_disbursed": false
    }
  ]
}
```

**Permissões:**
- Usuários normais: apenas seus próprios payouts
- Staff/Admin: todos os payouts

### 2. Criar Payout para Ronda
```http
POST /api/v2/kixikila/payouts/create_for_round/
```

**Permissões:** Apenas Admin

**Body:**
```json
{
  "group_id": 1,
  "round": 2,
  "recipient_id": 3,
  "payment_method": "transfer"
}
```

**Lógica:**
1. Valida que recipient é membro ativo do grupo
2. Verifica que não existe payout para esta ronda
3. Calcula `total_amount` somando contribuições confirmadas da ronda
4. Calcula `platform_fee` (2.5% do total)
5. Calcula `net_amount` (total - taxa)
6. Cria payout com status "scheduled"

**Validações:**
- ❌ Recipient não é membro: 400 Bad Request
- ❌ Já existe payout para ronda: 400 Bad Request
- ❌ Não há contribuições confirmadas: 400 Bad Request

### 3. Processar Payout
```http
POST /api/v2/kixikila/payouts/{id}/process/
```

**Permissões:** Apenas Admin

**Validações:**
- ✅ `is_eligible == true` (status=scheduled, data chegou)
- ✅ `can_be_disbursed == true` (todas contribuições confirmadas)

**Ação:**
- Marca payout como "processing"

### 4. Completar Payout
```http
POST /api/v2/kixikila/payouts/{id}/complete/
```

**Permissões:** Apenas Admin

**Body:**
```json
{
  "payment_method": "mobile_money"
}
```

**Ação:**
1. Marca payout como "completed"
2. Define `disbursed_at` = agora
3. Atualiza membership do recipient:
   - `payout_received = True`
   - `payout_date = agora`

### 5. Falhar Payout
```http
POST /api/v2/kixikila/payouts/{id}/fail/
```

**Permissões:** Apenas Admin

**Body:**
```json
{
  "reason": "Dados bancários inválidos"
}
```

**Ação:**
- Marca payout como "failed"
- Registra motivo

## Frontend - Implementação

### Serviço: `PayoutService`

```typescript
class PayoutService {
  // Listar payouts do usuário
  static async getPayouts(filters?: {
    status?: string;
    group?: number;
  }): Promise<KixikilaPayoutDTO[]>

  // Obter payout específico
  static async getPayout(payoutId: number): Promise<KixikilaPayoutDTO>

  // Criar payout para ronda (admin)
  static async createPayoutForRound(data: {
    group_id: number;
    round: number;
    recipient_id: number;
    payment_method?: string;
  }): Promise<KixikilaPayoutDTO>

  // Processar payout (admin)
  static async processPayout(payoutId: number): Promise<KixikilaPayoutDTO>

  // Completar payout (admin)
  static async completePayout(
    payoutId: number,
    payment_method: string
  ): Promise<KixikilaPayoutDTO>

  // Falhar payout (admin)
  static async failPayout(
    payoutId: number,
    reason: string
  ): Promise<KixikilaPayoutDTO>
}
```

### Interface: `KixikilaPayoutDTO`

```typescript
interface KixikilaPayoutDTO {
  id: number;
  group: number;
  group_name: string;
  recipient: number;
  recipient_username: string;
  recipient_email: string;
  round: number;
  total_amount: string;
  platform_fee: string;
  net_amount: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  scheduled_date: string;
  disbursed_at: string | null;
  payment_method: string;
  intended_use: string;
  is_eligible: boolean;
  can_be_disbursed: boolean;
  created_at: string;
}
```

## Fluxo de Uso

### Para Administradores

#### 1. Criar Payout Manualmente
```typescript
// Após todas contribuições da ronda confirmadas
const payout = await PayoutService.createPayoutForRound({
  group_id: 1,
  round: 2,
  recipient_id: nextRecipientId,  // Definido pela ordem/sorteio
  payment_method: 'transfer'
});
```

#### 2. Processar Payout
```typescript
// Quando chegar a data agendada
const processing = await PayoutService.processPayout(payoutId);
// Status: scheduled → processing
```

#### 3. Confirmar Pagamento
```typescript
// Após transferência realizada
const completed = await PayoutService.completePayout(
  payoutId,
  'mobile_money'  // Método usado
);
// Status: processing → completed
// Atualiza membership do beneficiário
```

#### 4. Reportar Falha (se necessário)
```typescript
const failed = await PayoutService.failPayout(
  payoutId,
  'Conta bancária inválida'
);
// Status: qualquer → failed
```

### Para Membros (Beneficiários)

#### Visualizar Payouts Recebidos
```typescript
const myPayouts = await PayoutService.getPayouts({
  status: 'completed'
});

// Exibir:
// - Ronda recebida
// - Valor líquido
// - Data de recebimento
// - Método de pagamento
```

## Boas Práticas Implementadas

### 1. **Validação em Camadas**
- ✅ Validações no modelo (`clean()`)
- ✅ Validações nos endpoints (business logic)
- ✅ Validações no serializer
- ✅ Validações no frontend (UX)

### 2. **Rastreabilidade**
- ✅ Logging de todas as ações (criação, processamento, conclusão, falha)
- ✅ Campos de auditoria (`created_at`, `disbursed_at`)
- ✅ Registro do método de pagamento usado
- ✅ Motivos de falha registrados

### 3. **Segurança**
- ✅ Endpoints de admin protegidos (`IsAdminUser`)
- ✅ Membros só veem seus próprios payouts
- ✅ Validação de elegibilidade antes de processar
- ✅ Transições de estado validadas

### 4. **Integridade de Dados**
- ✅ `unique_together = ["group", "round"]` (1 payout por ronda)
- ✅ Validação de `net_amount` automática
- ✅ Atualização atômica de membership ao completar
- ✅ Verificação de contribuições confirmadas

### 5. **Transparência**
- ✅ Taxa da plataforma explícita e calculada
- ✅ Valores total e líquido separados
- ✅ Campos `is_eligible` e `can_be_disbursed` no serializer
- ✅ Status claro em português

### 6. **Flexibilidade**
- ✅ Múltiplos métodos de pagamento suportados
- ✅ Campo `intended_use` para rastrear uso dos fundos
- ✅ `proof_of_use` para upload de comprovativos
- ✅ Possibilidade de falha e retry

## Automação Futura

### Criação Automática de Payouts
```python
# Cron job diário ou ao confirmar última contribuição
def auto_create_payout_for_completed_round(group_id, round):
    group = KixikilaGroup.objects.get(id=group_id)
    memberships = KixikilaMembership.objects.filter(group=group, is_active=True)
    
    # Verificar se todas contribuições confirmadas
    confirmed = KixikilaContribution.objects.filter(
        membership__group=group,
        round=round,
        status='confirmed'
    ).count()
    
    if confirmed >= memberships.count():
        # Determinar próximo beneficiário (por ordem de position)
        next_recipient = memberships.filter(
            payout_received=False
        ).order_by('position').first()
        
        # Criar payout
        payout = KixikilaPayout.objects.create(
            group=group,
            recipient=next_recipient.member,
            round=round,
            # ... calcular valores
        )
```

### Processamento Automático
```python
# Cron job diário
def process_eligible_payouts():
    eligible = KixikilaPayout.objects.filter(
        status='scheduled',
        scheduled_date__lte=timezone.now().date()
    )
    
    for payout in eligible:
        if payout.can_be_disbursed:
            payout.mark_as_processing()
            # Integrar com gateway de pagamento
            initiate_bank_transfer(payout)
```

## Testes Recomendados

### Backend
```python
def test_create_payout_validates_recipient_is_member():
    # Tentar criar payout para não-membro → 400
    
def test_create_payout_calculates_fees_correctly():
    # total_amount = 5000
    # platform_fee = 125 (2.5%)
    # net_amount = 4875
    
def test_cannot_process_payout_with_pending_contributions():
    # can_be_disbursed == False → 400
    
def test_mark_as_completed_updates_membership():
    # payout_received = True
    # payout_date = now()
```

### Frontend
```typescript
describe('PayoutService', () => {
  it('should create payout for round', async () => {
    const payout = await PayoutService.createPayoutForRound({...});
    expect(payout.status).toBe('scheduled');
  });
  
  it('should process eligible payout', async () => {
    const processed = await PayoutService.processPayout(1);
    expect(processed.status).toBe('processing');
  });
});
```

## Checklist de Implementação

### Backend
- ✅ Modelo `KixikilaPayout` com validações
- ✅ Métodos auxiliares (`is_eligible`, `can_be_disbursed`)
- ✅ Transições de estado (`mark_as_*`)
- ✅ Serializer com validações
- ✅ Endpoint `create_for_round`
- ✅ Endpoint `process`
- ✅ Endpoint `complete`
- ✅ Endpoint `fail`
- ✅ Logging de todas as operações
- ✅ Permissões adequadas (admin-only actions)

### Frontend
- ✅ `PayoutService` com todos os métodos
- ✅ Interface `KixikilaPayoutDTO`
- ⏳ Aba "Payouts" na página de management
- ⏳ Formulário de criação de payout (admin)
- ⏳ Botões de ações (processar, completar, falhar)
- ⏳ Lista de payouts do usuário
- ⏳ Indicadores visuais de status

### Testes
- ⏳ Testes unitários do modelo
- ⏳ Testes de integração dos endpoints
- ⏳ Testes de permissões
- ⏳ Testes do frontend

### Documentação
- ✅ Documentação do fluxo de payouts
- ✅ Exemplos de uso da API
- ✅ Boas práticas implementadas

---
**Última Atualização**: 12 de Dezembro de 2025  
**Versão**: 2.0.0  
**Status**: Backend Completo ✅ | Frontend Em Andamento ⏳
