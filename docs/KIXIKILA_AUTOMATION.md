# Kixikila - Automação de Payouts

## Overview

Este documento descreve os comandos de automação disponíveis para gerenciar payouts do Kixikila de forma automatizada, incluindo criação e processamento.

## Comandos Disponíveis

### 1. Auto-Criar Payouts

**Comando:** `auto_create_payouts`

**Descrição:** Verifica todos os grupos ativos e cria automaticamente payouts para rondas onde todas as contribuições foram confirmadas.

**Uso Básico:**
```bash
python manage.py auto_create_payouts
```

**Opções:**

```bash
# Processar apenas um grupo específico
python manage.py auto_create_payouts --group-id=1

# Modo dry-run (simular sem criar)
python manage.py auto_create_payouts --dry-run

# Combinar opções
python manage.py auto_create_payouts --group-id=1 --dry-run
```

**Lógica:**
1. Busca grupos com `status='active'`
2. Para cada grupo, verifica rondas de 1 até `current_round`
3. Para cada ronda:
   - Verifica se já existe payout
   - Conta contribuições confirmadas
   - Se `confirmed_count >= total_members`:
     - Determina próximo beneficiário (menor `position` sem payout)
     - Calcula total, taxa (2.5%), e valor líquido
     - Cria payout com status "scheduled"

**Output Exemplo:**
```
Processing 3 active group(s)...

Processing group: Grupo Amigos (ID: 1)
  Round 1: Payout already exists (ID: 5)
  Round 2: 5/5 contributions confirmed
  Round 2: Creating payout for maria
    Total: 25000.00 AOA
    Fee: 625.00 AOA
    Net: 24375.00 AOA
    ✓ Payout created (ID: 6)
  Round 3: Waiting for 2 more contribution(s)

Summary:
  Groups processed: 3
  Payouts created: 1
  Payouts skipped: 2

✓ Successfully processed 1 payout(s)
```

**Automatização via Cron:**
```bash
# Executar diariamente às 02:00
0 2 * * * cd /path/to/project && python manage.py auto_create_payouts >> /var/log/kixikila_auto_create.log 2>&1
```

---

### 2. Processar Payouts Elegíveis

**Comando:** `process_eligible_payouts`

**Descrição:** Processa payouts agendados que atingiram sua data programada e têm todas as contribuições confirmadas.

**Uso Básico:**
```bash
python manage.py process_eligible_payouts
```

**Opções:**

```bash
# Modo dry-run (simular sem processar)
python manage.py process_eligible_payouts --dry-run
```

**Lógica:**
1. Busca payouts com:
   - `status='scheduled'`
   - `scheduled_date <= hoje`
2. Para cada payout:
   - Verifica `can_be_disbursed` (todas contribuições confirmadas)
   - Se elegível: marca como "processing"
   - *Opcional*: Integra com gateway de pagamento

**Output Exemplo:**
```
Found 2 eligible payout(s)

Processing payout ID 6:
  Group: Grupo Amigos
  Recipient: maria
  Round: 2
  Amount: 24375.00 AOA
  ✓ All contributions confirmed
  ✓ Marked as processing

Processing payout ID 7:
  Group: Grupo Negócios
  Recipient: joao
  Round: 1
  Amount: 48750.00 AOA
  ⚠ Not all contributions confirmed yet, skipping

Summary:
  Total eligible: 2
  Processed: 1
  Skipped: 1

✓ Successfully processed 1 payout(s)
```

**Automatização via Cron:**
```bash
# Executar diariamente às 03:00
0 3 * * * cd /path/to/project && python manage.py process_eligible_payouts >> /var/log/kixikila_process.log 2>&1
```

---

## Fluxo Completo de Automação

### Setup Recomendado

**1. Crontab Completo:**
```bash
# Kixikila Automation
0 2 * * * cd /path/to/project && python manage.py auto_create_payouts
0 3 * * * cd /path/to/project && python manage.py process_eligible_payouts
```

**2. Script de Wrapper (Opcional):**
```bash
#!/bin/bash
# /path/to/kixikila_automation.sh

LOGDIR="/var/log/kixikila"
mkdir -p $LOGDIR

echo "$(date): Starting Kixikila automation" >> $LOGDIR/automation.log

# Auto-criar payouts
python manage.py auto_create_payouts >> $LOGDIR/auto_create.log 2>&1
CREATE_EXIT=$?

# Processar payouts elegíveis
python manage.py process_eligible_payouts >> $LOGDIR/process.log 2>&1
PROCESS_EXIT=$?

if [ $CREATE_EXIT -eq 0 ] && [ $PROCESS_EXIT -eq 0 ]; then
    echo "$(date): Automation completed successfully" >> $LOGDIR/automation.log
else
    echo "$(date): Automation failed (create:$CREATE_EXIT, process:$PROCESS_EXIT)" >> $LOGDIR/automation.log
fi
```

**3. Crontab com Wrapper:**
```bash
0 2 * * * /path/to/kixikila_automation.sh
```

---

## Automatização no Windows (Task Scheduler)

### Usando PowerShell (recomendado)

1. Executar script pronto:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
cd C:\apps\Acredita\scripts
./schedule_kixikila_tasks.ps1 -ProjectRoot "C:\apps\Acredita" -PythonPath "C:\apps\Acredita\venv\Scripts\python.exe"
```

2. Verificar tarefas:
```powershell
schtasks /Query /TN "Kixikila_AutoCreatePayouts"
schtasks /Query /TN "Kixikila_ProcessEligiblePayouts"
```

3. Rodar manualmente (teste):
```powershell
"C:\apps\Acredita\venv\Scripts\python.exe" "C:\apps\Acredita\manage.py" auto_create_payouts
"C:\apps\Acredita\venv\Scripts\python.exe" "C:\apps\Acredita\manage.py" process_eligible_payouts
```

4. Remover tarefas (se necessário):
```powershell
schtasks /Delete /TN "Kixikila_AutoCreatePayouts" /F
schtasks /Delete /TN "Kixikila_ProcessEligiblePayouts" /F
```

---

## Integração com Gateway de Pagamento

Para automatizar completamente o desembolso, integre no comando `process_eligible_payouts`:

```python
# Em process_eligible_payouts.py, após mark_as_processing():

try:
    # Integração exemplo com gateway
    payment_response = initiate_bank_transfer(
        recipient_account=payout.recipient.bank_account,
        amount=payout.net_amount,
        reference=f"KIXIKILA-{payout.group.id}-R{payout.round}"
    )
    
    if payment_response.success:
        payout.mark_as_completed(payment_method='transfer')
        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Payment initiated and completed'
            )
        )
    else:
        payout.mark_as_failed(payment_response.error_message)
        self.stdout.write(
            self.style.ERROR(
                f'  ✗ Payment failed: {payment_response.error_message}'
            )
        )
except Exception as e:
    payout.mark_as_failed(str(e))
    logger.error(f"Payment error for payout {payout.id}: {e}", exc_info=True)
```

---

## Monitoramento

### Logs

**Locais Recomendados:**
```
/var/log/kixikila/
├── auto_create.log       # Criação de payouts
├── process.log           # Processamento de payouts
└── automation.log        # Log geral de automação
```

**Rotação de Logs:**
```
# /etc/logrotate.d/kixikila
/var/log/kixikila/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

### Alertas

**Exemplo com Email:**
```bash
#!/bin/bash
# kixikila_automation_with_alerts.sh

LOGFILE="/var/log/kixikila/automation.log"
ERROR_EMAIL="admin@example.com"

python manage.py auto_create_payouts 2>&1 | tee -a $LOGFILE

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "Kixikila auto_create_payouts failed" | mail -s "Kixikila Alert" $ERROR_EMAIL
fi

python manage.py process_eligible_payouts 2>&1 | tee -a $LOGFILE

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "Kixikila process_eligible_payouts failed" | mail -s "Kixikila Alert" $ERROR_EMAIL
fi
```

---

## Testes

### Testar Comandos Localmente

**1. Setup de Teste:**
```bash
# Criar grupo de teste
python manage.py shell

>>> from backend.kixikila.models import *
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()

# Criar grupo
>>> group = KixikilaGroup.objects.create(
...     name="Teste Auto",
...     monthly_contribution=5000,
...     max_members=3,
...     current_round=1,
...     status='active'
... )

# Criar membros
>>> user1 = User.objects.get(username='maria')
>>> user2 = User.objects.get(username='joao')
>>> user3 = User.objects.get(username='ana')

>>> for i, user in enumerate([user1, user2, user3], 1):
...     KixikilaMembership.objects.create(
...         group=group, member=user, position=i, is_active=True
...     )

# Criar contribuições confirmadas
>>> for membership in group.kixikila_memberships.all():
...     KixikilaContribution.objects.create(
...         membership=membership,
...         round=1,
...         amount=5000,
...         status='confirmed'
...     )
```

**2. Executar Comando (Dry-Run):**
```bash
python manage.py auto_create_payouts --group-id=<group_id> --dry-run
```

**3. Executar Comando (Real):**
```bash
python manage.py auto_create_payouts --group-id=<group_id>
```

**4. Verificar Resultado:**
```bash
python manage.py shell

>>> from backend.kixikila.models import KixikilaPayout
>>> KixikilaPayout.objects.filter(group_id=<group_id>)
<QuerySet [<KixikilaPayout: Payout maria - Teste Auto round 1>]>
```

---

## Troubleshooting

### Problema: Payouts não sendo criados

**Verificações:**
1. Grupo tem `status='active'`?
2. Todas as contribuições da ronda estão `confirmed`?
3. Já existe payout para aquela ronda?

**Debug:**
```bash
python manage.py auto_create_payouts --group-id=X --dry-run
```

### Problema: Payouts não sendo processados

**Verificações:**
1. Payout tem `status='scheduled'`?
2. `scheduled_date <= hoje`?
3. Propriedade `can_be_disbursed == True`?

**Debug:**
```bash
python manage.py shell

>>> from backend.kixikila.models import KixikilaPayout
>>> payout = KixikilaPayout.objects.get(id=X)
>>> payout.is_eligible
>>> payout.can_be_disbursed
```

### Problema: Comando falha silenciosamente

**Verificar Logs Django:**
```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/kixikila.log',
        },
    },
    'loggers': {
        'backend.kixikila': {
            'handlers': ['file'],
            'level': 'INFO',
        },
    },
}
```

---

## Checklist de Deploy

- [ ] Comandos testados localmente com `--dry-run`
- [ ] Comandos testados em staging com dados reais
- [ ] Logs configurados e rotacionados
- [ ] Crontab configurado
- [ ] Alertas de erro configurados
- [ ] Integração com gateway de pagamento testada (se aplicável)
- [ ] Documentação atualizada
- [ ] Equipe treinada nos comandos

---

**Última Atualização**: 12 de Dezembro de 2025  
**Versão**: 2.0.0  
**Autor**: Sistema Kixikila - Acredita Platform
