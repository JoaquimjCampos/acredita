# Integração Profunda Kixikila no Acredita

## 🎯 Visão Estratégica

Kixikila como **fonte principal de financiamento sustentável** para candidatos do programa Acredita, complementando prêmios e doações.

---

## 📊 Arquitetura de Integração

### 1. **Modelo de Dados**
```
User (Acredita)
  ├─ OneToOne Participant
  │   └─ ForeignKey KixikilaGroup (grupo principal)
  │       └─ KixikilaMembership
  │           ├─ Contributions
  │           └─ Payouts (financiamento)
  └─ Multiple KixikilaMemberships (grupos secundários)
```

**Nova Relação: Participant ↔ KixikilaGroup**
- Campo: `primary_savings_group` (ForeignKey, nullable)
- Permite rastreamento de financiamento por candidato
- Vincula identidade Acredita com captação Kixikila

---

## 💰 Fluxo de Financiamento Sustentável

### Fase 1: Candidato entra em Acredita
1. Cria conta como participante
2. Acesso a dashboard com informações de financiamento
3. Recomendação: criar ou aderir grupo Kixikila

### Fase 2: Adesão a Grupo Kixikila
1. Forma grupo com 5-10 pares (coexistentes no Acredita)
2. Contribuições mensais fixas (ex: 5.000 AOA)
3. Solidariedade com pares do programa

### Fase 3: Recebimento Rotativo
1. A cada ronda, 1 candidato recebe payout
2. Montante = (Contribuição Mensal × Nº Membros × Rondas) - 2.5% taxa
3. Usa recursos para desenvolvimento do negócio/educação

### Fase 4: Impacto Rastreável
1. Dashboard mostra: "Financiamento levantado via Kixikila"
2. Histórico de desempenho no grupo
3. Reputação de honra (importante para próximos empréstimos)

---

## 🏗️ Componentes de Integração

### Backend Endpoints
```
GET    /api/v2/participants/{id}/funding-summary/
  └─ Retorna: total levantado, grupo atual, próximo payout, reputação

GET    /api/v2/participants/{id}/kixikila-groups/
  └─ Retorna: grupos ativos, histórico de payouts

POST   /api/v2/participants/{id}/create-group/
  └─ Cria grupo Kixikila automaticamente

PATCH  /api/v2/participants/{id}/leave-group/{group_id}/
  └─ Sai do grupo (com penalidades se não concluído)

GET    /api/v2/dashboard/funding-leaderboard/
  └─ Ranking de candidatos por financiamento Kixikila
```

### Frontend Components

#### 1. **FundingDashboard** (novo)
- Cards: Total levantado, Próximo payout, Reputação
- Gráfico: Histórico de contribuições
- CTA: "Aderir/criar grupo"

#### 2. **KixikilaCard** em ParticipantProfile
- Mostra: Grupo principal, posição na fila, data próximo payout
- Link rápido para gestão

#### 3. **MyGroupsWidget** em HomePage
- Lista grupos do utilizador
- Status de contribuições pendentes
- Notificação se chegou payout

#### 4. **SustainableFundingPage** (novo)
- Educação sobre Kixikila como ferramenta
- Casos de sucesso
- Guia de boas práticas

---

## 🔐 Critérios de Elegibilidade

### Para Criar Grupo
- ✅ Participante ativo em Acredita (status: approved, active, winner)
- ✅ Reputação ≥ 0
- ✅ Nenhum grupo em default

### Para Aderir Grupo
- ✅ Participante ativo
- ✅ Verificado (is_verified=True)
- ✅ Reputação ≥ mínimo do grupo

### Proteções
- ❌ Não pode sair a meio (penalidade: reputação -50)
- ❌ Contribuição atrasada: notificação automática
- ❌ 3 faltas consecutivas: expulsão automática

---

## 📱 Notificações Integradas

| Evento | Destinatário | Mensagem |
|--------|--------------|----------|
| Ronda comça | Todos | "Nova ronda iniciada - contribuição devida em X dias" |
| Payout próximo | Próximo | "Seu payout será em X dias: Y AOA" |
| Payout recebido | Recebedor | "Parabéns! Você recebeu Y AOA" |
| Falta detectada | Faltoso | "Contribuição em atraso - regularize em 48h" |

---

## 📊 Dashboard de Reputação

**Fator de Reputação Kixikila:**
```
Reputação = Base(50) 
  + (Contribuições Confirmadas × 5)
  - (Atrasos × 20)
  - (Saída prematura × 50)
  + (Payout recebido sem faltas × 25)
```

Exibição em:
- ParticipantProfile (badge visual)
- KixikilaGroup (visibilidade para pares)
- Leaderboard (competição amigável)

---

## 🎓 Casos de Uso Reais

### Caso 1: Candidato Agricultor
- Precisa de 50.000 AOA para sementes
- Entra em grupo Kixikila de agricultores (10 membros, 5.000 AOA/mês)
- Em 2 rodas (10 meses), recebe 45.000 AOA (após taxa)
- Investe em sementes, produz, ganha receita
- Participação futura em próximos ciclos

### Caso 2: Candidata Costureira
- Quer comprar máquina de costura (20.000 AOA)
- Adere grupo de costureiras já formado
- Espera 2 rodas, recebe payout
- Compra máquina, aumenta produtividade
- Próxima meta: contratar ajudante

---

## 🔄 Roadmap de Implementação

### V1 (Semana 1-2)
- Adicionar campo `primary_savings_group` a Participant
- Criar endpoints de financiamento
- Widget de Kixikila em ParticipantProfile

### V2 (Semana 3-4)
- FundingDashboard completo
- Notificações automáticas
- Sistema de reputação básico

### V3 (Semana 5-6)
- Leaderboard de financiamento
- Relatórios de impacto
- Integração com gamificação (badges)

### V4 (Futura)
- Empréstimo garantido por Kixikila
- Seguro micro-crédito
- Integração com banco parceiro

---

## 🔍 Métricas de Sucesso

| KPI | Meta | Método |
|-----|------|--------|
| % Candidatos em Kixikila | 40% | Rastreamento automático |
| Capital Levantado | 500.000 AOA/mês | Sum(payouts) |
| Retenção | 80% no grupo | Atrasos/saídas <20% |
| Impacto Econômico | +30% receita negócio | Survey pós-payout |
| Reputação Média | > 75 | Dashboard |

---

## 📋 Tarefas Imediatas

- [ ] Adicionar migration: `Participant.primary_savings_group`
- [ ] Criar serializers para endpoints de financiamento
- [ ] Implementar FundingDashboard component
- [ ] Criar KixikilaCard widget
- [ ] Adicionar notificações automáticas
- [ ] Documentar best practices em SustainableFundingPage

---

**Responsável**: Backend/Frontend Team  
**Início**: 13 Dec 2025  
**Duração Estimada**: 6 semanas (V1-V3)
