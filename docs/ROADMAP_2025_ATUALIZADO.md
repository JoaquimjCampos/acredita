# 🚀 Roadmap Estratégico 2025-2026: Acredita em Ti, Acredita em Angola
## Revisão Profunda e Plano de Expansão

**Última Atualização:** 09 de Dezembro de 2025  
**Versão:** 2.0  
**Estado do Projeto:** ✅ MVP Funcional | 🚀 Expansão Estratégica

---

## 📋 Índice
1. [Estado Atual do Projeto](#estado-atual)
2. [Visão Estratégica Expandida](#visão-estratégica)
3. [Três Pilares Estratégicos](#pilares-estratégicos)
4. [Roadmap Detalhado por Trimestre](#roadmap-trimestral)
5. [Arquitetura Técnica](#arquitetura-técnica)
6. [Plano de Implementação](#plano-implementação)
7. [Métricas e KPIs](#métricas-kpis)
8. [Riscos e Mitigação](#riscos-mitigação)

---

## 🎯 Estado Atual do Projeto {#estado-atual}

### ✅ Infraestrutura Técnica (100%)
> **Status real em 09/12/2025**
> - Pilar 1 (Certificações INEFOB): Módulo entregue em DEV com feature flag `certifications` e dados iniciais (5 categorias, 5 programas).
> - Deploy: Em DEV com servidor Django ativo. Próximo passo: code review + staging.
> - Risco: Nenhum bloqueio atual. Rollback simples via feature flag.
- **Frontend React 18 + TypeScript**: Interface responsiva e moderna
- **Autenticação JWT**: Sistema seguro implementado
- **Database**: SQLite (dev) | PostgreSQL (produção)
- **APIs RESTful**: Documentadas com OpenAPI/Swagger
- **Hot Reload**: Desenvolvimento ágil configurado

### ✅ Funcionalidades Core Implementadas
- ✅ Sistema de autenticação e gestão de utilizadores
- ✅ Gestão de temporadas (Seasons) e episódios
- ✅ Perfis de participantes e candidatos
- ✅ Sistema de votação público
- ✅ Painel de controlo (Dashboard) para utilizadores
- ✅ Jogos educativos (Quiz MVP)
- ✅ Sistema de doações (base implementada)
- ✅ Loja online (estrutura básica)
- ✅ Blog e gestão de conteúdos
- ✅ Sistema de anúncios (Ads)

### 🔄 Em Desenvolvimento
- 🔄 Jogos educativos avançados (palavras cruzadas, simuladores, associação)
- 🔄 Gamificação (badges, achievements, ranking público)
- 🔄 Integração de pagamentos (gateway)
- 🔄 Sistema de notificações em tempo real
- 🔄 Analytics e relatórios avançados

---

## 🌟 Visão Estratégica Expandida {#visão-estratégica}

### Missão
Transformar o **mercado informal angolano** numa economia digital estruturada, capacitando empreendedores, comerciantes e prestadores de serviços através de:
1. **Formação profissional certificada**
2. **Marketplace digital inclusivo**
3. **Financiamento colaborativo cultural (Kixikila digital)**

### Visão 2026
Tornar-se a **plataforma líder em Angola** para:
- Reconhecimento e certificação profissional
- Transição do informal para o formal
- Microfinanciamento baseado em confiança comunitária
- Empoderamento económico através de tecnologia

---

## 🏛️ Três Pilares Estratégicos {#pilares-estratégicos}

### 🎓 Pilar 1: Parcerias Público-Privadas & Certificação (PPP-INEFOB)

#### Objetivo
Estabelecer parceria estratégica com **INEFOB** (Instituto Nacional de Emprego e Formação Profissional) para reconhecimento oficial de profissões e capacitação de candidatos.

#### Contexto Angolano
- **70%+ da força de trabalho** está no setor informal
- Falta de reconhecimento oficial de competências adquiridas empiricamente
- Necessidade de certificação para acesso a crédito e oportunidades formais
- Gap entre formação técnica e demanda do mercado

#### Implementação Técnica

**Fase 1: Módulo de Certificação & Formação (Q1 2026)**

```python
# backend/certifications/models.py
class ProfessionalCategory(models.Model):
    """Categorias profissionais reconhecidas pelo INEFOB"""
    name = models.CharField(max_length=200)  # Ex: Motoqueiro, Costureira, Vendedor
    inefob_code = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    requirements = models.JSONField()  # Requisitos técnicos
    certification_level = models.CharField(max_length=50)  # Básico, Intermediário, Avançado
    
class TrainingProgram(models.Model):
    """Programas de formação oferecidos"""
    category = models.ForeignKey(ProfessionalCategory, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    provider = models.CharField(max_length=200)  # INEFOB ou parceiro
    duration_hours = models.IntegerField()
    modules = models.JSONField()  # Lista de módulos do curso
    certification_type = models.CharField(max_length=100)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    is_inefob_certified = models.BooleanField(default=False)
    
class CandidateEnrollment(models.Model):
    """Inscrições de candidatos em programas"""
    candidate = models.ForeignKey('participants.Participant', on_delete=models.CASCADE)
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)  # enrolled, in_progress, completed, certified
    completion_percentage = models.IntegerField(default=0)
    certificate_issued_at = models.DateTimeField(null=True, blank=True)
    certificate_number = models.CharField(max_length=100, unique=True, null=True)
    
class SkillAssessment(models.Model):
    """Avaliação de competências práticas"""
    enrollment = models.ForeignKey(CandidateEnrollment, on_delete=models.CASCADE)
    assessed_by = models.CharField(max_length=200)  # Avaliador INEFOB
    assessment_date = models.DateTimeField()
    score = models.DecimalField(max_digits=5, decimal_places=2)
    competencies_validated = models.JSONField()
    inefob_approved = models.BooleanField(default=False)
```

**Fase 2: Portal de Formação (Q2 2026)**
- Integração LMS (Learning Management System)
- Vídeo-aulas e materiais didáticos
- Avaliações online e presenciais
- Emissão automática de certificados digitais (blockchain)
- Verificação QR Code para autenticidade

**APIs Necessárias:**
```
POST   /api/certifications/enroll/              # Inscrever em curso
GET    /api/certifications/my-programs/         # Meus cursos
GET    /api/certifications/categories/          # Categorias INEFOB
POST   /api/certifications/skill-assessment/    # Submeter avaliação
GET    /api/certifications/certificate/{id}/    # Obter certificado
POST   /api/certifications/verify/{code}/       # Verificar certificado
```

#### Parcerias Adicionais
- **Ministério da Juventude e Desportos**: Programas para jovens empreendedores
- **INAPEM**: Apoio a micro, pequenas e médias empresas
- **Universidades & Politécnicos**: Cursos técnicos e capacitação
- **ONGs**: Programas sociais e inclusão

#### KPIs (2026)
- 🎯 **5.000 candidatos certificados** no primeiro ano
- 🎯 **20+ categorias profissionais** reconhecidas
- 🎯 **80% de empregabilidade** pós-certificação
- 🎯 **50+ parceiros** de formação ativos

---

### 🏪 Pilar 2: Marketplace Digital - Formalização do Informal

#### Objetivo
Criar o **maior marketplace angolano** para freelancers, comerciantes e prestadores de serviços, facilitando a transição do mercado informal para o formal.

#### Contexto & Oportunidade
- **US$ 30+ bilhões** em transações informais por ano em Angola
- Falta de plataformas locais confiáveis (Olx, Facebook Marketplace dominam)
- Dificuldade de acesso a seguros, crédito e proteção legal no informal
- Oportunidade de criar "Amazon Angolana" para serviços + produtos

#### Implementação Técnica

**Fase 1: Marketplace Core (Q1-Q2 2026)**

```python
# backend/marketplace/models.py
class ServiceProvider(models.Model):
    """Prestadores de serviços certificados"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=200)
    business_type = models.CharField(max_length=100)  # Freelancer, Loja, Serviço
    categories = models.ManyToManyField('marketplace.ServiceCategory')
    certifications = models.ManyToManyField('certifications.TrainingProgram')
    
    # Documentação
    nif_number = models.CharField(max_length=50, blank=True)  # NIF angolano
    business_license = models.FileField(upload_to='licenses/', null=True)
    is_formal = models.BooleanField(default=False)  # Empresa formalizada
    
    # Localização
    province = models.CharField(max_length=100)
    municipality = models.CharField(max_length=100)
    neighborhood = models.CharField(max_length=200)
    address = models.TextField()
    location_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True)
    location_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True)
    
    # Reputação
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.IntegerField(default=0)
    verified = models.BooleanField(default=False)
    
class ServiceListing(models.Model):
    """Serviços/produtos oferecidos"""
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey('marketplace.ServiceCategory', on_delete=models.PROTECT)
    
    # Preços
    price_type = models.CharField(max_length=50)  # fixed, hourly, negotiable
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='AOA')
    
    # Disponibilidade
    available = models.BooleanField(default=True)
    delivery_time = models.CharField(max_length=100)  # "24h", "3 dias", etc
    
    # Media
    images = models.JSONField(default=list)
    video_url = models.URLField(blank=True)
    
    # SEO & Discovery
    tags = models.JSONField(default=list)
    views = models.IntegerField(default=0)
    featured = models.BooleanField(default=False)
    
class ServiceOrder(models.Model):
    """Pedidos de serviços"""
    listing = models.ForeignKey(ServiceListing, on_delete=models.PROTECT)
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    
    status = models.CharField(max_length=50)  # pending, accepted, in_progress, completed, cancelled
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(max_length=50)
    payment_method = models.CharField(max_length=50)
    
    # Timeline
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True)
    completed_at = models.DateTimeField(null=True)
    
    # Review
    customer_review = models.TextField(blank=True)
    customer_rating = models.IntegerField(null=True)
    
class MarketplaceReview(models.Model):
    """Avaliações de serviços"""
    order = models.OneToOneField(ServiceOrder, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    response = models.TextField(blank=True)  # Resposta do prestador
    helpful_count = models.IntegerField(default=0)
```

**Fase 2: Funcionalidades Avançadas (Q3 2026)**
- **Pagamentos Integrados**: Multicaixa Express, PayPal, Unitel Money
- **Sistema de Escrow**: Pagamento retido até conclusão do serviço
- **Chat em Tempo Real**: Comunicação cliente-prestador
- **Agendamento**: Calendário para serviços agendados
- **Faturação Automática**: Geração de faturas/recibos
- **Seguros**: Proteção para transações de alto valor
- **Logística**: Integração com transportadoras (entregas)

**Fase 3: Formalização Assistida (Q4 2026)**
- **Portal de Formalização**: Guia passo-a-passo para criar empresa
- **Integração INAGBE**: Registo automático de empresas
- **Consultoria Fiscal**: Suporte para emissão de NIF, pagamento de impostos
- **Contratos Digitais**: Templates legais validados
- **Proteção Legal**: Termos de serviço e resolução de disputas

#### Categorias Prioritárias
1. **Transportes**: Motoqueiros (mototáxi), táxi, entregas
2. **Construção**: Pedreiros, pintores, eletricistas, canalizadores
3. **Beleza & Estética**: Cabeleireiros, manicures, maquilhadores
4. **Alimentação**: Quituteiras, catering, padarias artesanais
5. **Reparações**: Eletrónica, mecânica, eletrodomésticos
6. **Limpeza**: Doméstica, empresarial, eventos
7. **Educação**: Explicadores, professores particulares
8. **Tecnologia**: Designers, programadores, marketing digital
9. **Artesanato**: Produtos locais, arte, decoração
10. **Serviços Financeiros**: Contabilistas, consultores

#### KPIs (2026)
- 🎯 **50.000 prestadores** registados
- 🎯 **200.000 transações** mensais
- 🎯 **AOA 500M+ GMV** (Gross Merchandise Value)
- 🎯 **30% formalização** dos prestadores no 1º ano
- 🎯 **4.5+ estrelas** rating médio

---

### 💰 Pilar 3: Kixikila Digital - Fundraising Cultural

#### Objetivo
Digitalizar e escalar o **Kixikila** (sistema tradicional angolano de crédito rotativo), criando uma alternativa sustentável ao microcrédito bancário.

#### Contexto Cultural & Económico
- **Kixikila**: Prática milenar de poupança e crédito comunitário
- **50%+ da população** sem acesso a serviços bancários formais
- Taxas de juro bancárias elevadas (30%+ ao ano)
- Alta confiança em sistemas comunitários baseados em reputação
- Necessidade de capital para:
  - Compra de equipamentos (motos, máquinas de costura, etc)
  - Stock inicial para comércio
  - Expansão de negócios
  - Emergências familiares

#### Como Funciona o Kixikila Tradicional
1. Grupo de 10-20 pessoas se reúne mensalmente
2. Cada membro contribui com quantia fixa (ex: 50.000 AOA)
3. Um membro recebe o total acumulado naquele mês
4. Ciclo se repete até todos serem contemplados
5. Sistema baseado em confiança e pressão social

#### Implementação Técnica: Kixikila 2.0

**Fase 1: Motor de Kixikila (Q2 2026)**

```python
# backend/kixikila/models.py
class KixikilaGroup(models.Model):
    """Grupo de poupança rotativa"""
    TYPE_CHOICES = (
        ('professional', 'Profissional'),  # Motoqueiros, costureiras, etc
        ('neighborhood', 'Bairro'),
        ('family', 'Familiar'),
        ('business', 'Empresarial'),
    )
    
    name = models.CharField(max_length=200)
    group_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    description = models.TextField()
    
    # Configuração
    monthly_contribution = models.DecimalField(max_digits=12, decimal_places=2)
    max_members = models.IntegerField()
    current_members = models.IntegerField(default=0)
    duration_months = models.IntegerField()  # Duração do ciclo
    
    # Timeline
    start_date = models.DateField()
    current_round = models.IntegerField(default=1)
    
    # Segurança & Confiança
    requires_verification = models.BooleanField(default=True)
    min_reputation_score = models.IntegerField(default=0)
    insurance_enabled = models.BooleanField(default=False)  # Seguro contra inadimplência
    
    # Estado
    status = models.CharField(max_length=50)  # forming, active, completed, suspended
    
    # Localização (opcional)
    province = models.CharField(max_length=100, blank=True)
    municipality = models.CharField(max_length=100, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_groups')
    
class KixikilaMembership(models.Model):
    """Participação em grupo"""
    group = models.ForeignKey(KixikilaGroup, on_delete=models.CASCADE)
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Ordem de recebimento
    position = models.IntegerField()  # 1, 2, 3... até max_members
    position_priority = models.CharField(max_length=50)  # random, auction, need-based
    
    # Status
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    contributions_made = models.IntegerField(default=0)
    payout_received = models.BooleanField(default=False)
    payout_date = models.DateTimeField(null=True)
    
    # Garantias (opcional)
    guarantor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='guaranteed_members')
    collateral_type = models.CharField(max_length=100, blank=True)
    
class KixikilaContribution(models.Model):
    """Contribuição mensal"""
    membership = models.ForeignKey(KixikilaMembership, on_delete=models.CASCADE)
    round = models.IntegerField()  # Mês do ciclo
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50)
    payment_reference = models.CharField(max_length=200)
    
    status = models.CharField(max_length=50)  # pending, confirmed, late, missed
    
class KixikilaPayout(models.Model):
    """Pagamento ao beneficiário do mês"""
    group = models.ForeignKey(KixikilaGroup, on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    round = models.IntegerField()
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Distribuição
    scheduled_date = models.DateField()
    disbursed_at = models.DateTimeField(null=True)
    payment_method = models.CharField(max_length=50)
    
    # Uso declarado
    intended_use = models.CharField(max_length=200)  # Compra de moto, stock, etc
    proof_of_use = models.FileField(upload_to='kixikila_proofs/', null=True)
    
class KixikilaRating(models.Model):
    """Reputação de membros"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Histórico
    groups_participated = models.IntegerField(default=0)
    contributions_on_time = models.IntegerField(default=0)
    contributions_late = models.IntegerField(default=0)
    contributions_missed = models.IntegerField(default=0)
    
    # Score (0-100)
    reputation_score = models.IntegerField(default=50)
    trust_level = models.CharField(max_length=50)  # beginner, reliable, trusted, champion
    
    # Penalidades
    warnings = models.IntegerField(default=0)
    suspended_until = models.DateField(null=True)
```

**Fase 2: Funcionalidades Avançadas (Q3 2026)**

1. **Matching Inteligente**
   - Algoritmo de formação de grupos por perfil, localização, profissão
   - Score de compatibilidade entre membros
   - Recomendações personalizadas

2. **Sistema de Leilão de Posições**
   - Membros podem "licitar" para receber antes
   - Premium vai para fundo comum ou reduz contribuições futuras

3. **Seguros & Garantias**
   - Seguro contra inadimplência (parceria com seguradora)
   - Fundo de garantia coletivo (5% de cada contribuição)
   - Sistema de garantidores (avalista digital)

4. **Gamificação**
   - Badges por pontualidade
   - Ranking de confiabilidade
   - Recompensas para membros exemplares

5. **Ferramentas de Gestão**
   - Dashboard do grupo (timeline, contribuições, próximo beneficiário)
   - Lembretes automáticos (SMS, WhatsApp)
   - Relatórios financeiros mensais
   - Chat do grupo

**Fase 3: Kixikila Empresarial (Q4 2026)**

- **Kixikila para Negócios**: Grupos empresariais com valores maiores
- **Kixikila Temático**: Ex: "Grupo Motos" (motoqueiros), "Grupo Costura", etc
- **Integração Marketplace**: Compra de equipamentos diretamente da plataforma
- **Crédito Rotativo**: Opção de receber adiantado com juros mínimos

#### Casos de Uso Prioritários

1. **Grupo Motoqueiros (50.000 AOA/mês)**
   - 20 membros
   - Contribuição: 50k AOA
   - Payout mensal: 1.000.000 AOA
   - Uso: Compra de moto nova ou manutenção pesada

2. **Grupo Quituteiras (30.000 AOA/mês)**
   - 15 membros
   - Contribuição: 30k AOA
   - Payout: 450.000 AOA
   - Uso: Stock inicial, equipamentos de cozinha

3. **Grupo Estudantes (10.000 AOA/mês)**
   - 10 membros
   - Contribuição: 10k AOA
   - Payout: 100.000 AOA
   - Uso: Livros, propinas, laptop

#### Modelo de Receita
- **Taxa de Plataforma**: 2-3% do payout mensal
- **Seguro Opcional**: 5% adicional para cobertura de inadimplência
- **Premium Features**: Dashboard avançado, prioridade em matching
- **Parcerias**: Comissões em compras via marketplace

#### Diferenciais Competitivos
- ✅ **Cultural**: Respeita tradição angolana
- ✅ **Acessível**: Sem burocracia bancária
- ✅ **Digital**: Pagamentos móveis, gestão online
- ✅ **Transparente**: Blockchain para auditoria
- ✅ **Seguro**: Proteções contra fraude
- ✅ **Escalável**: De 10 a 10.000 grupos

#### KPIs (2026)
- 🎯 **1.000 grupos ativos**
- 🎯 **15.000 membros** participando
- 🎯 **AOA 500M+ movimentados**
- 🎯 **<1% inadimplência**
- 🎯 **95% satisfação** dos membros

---

## 📅 Roadmap Trimestral Detalhado {#roadmap-trimestral}

### Q1 2026 (Jan-Mar): Fundações Estratégicas

#### Mês 1-2: Planejamento & Parcerias
- ✅ Formalização parceria INEFOB (assinatura de protocolo)
- ✅ Mapeamento de categorias profissionais prioritárias
- ✅ Definição de requisitos técnicos para certificação
- ✅ Contratação de equipa de desenvolvimento (2 backend, 2 frontend, 1 designer)
- ✅ Setup de infraestrutura cloud (AWS/Azure/DigitalOcean)
- ✅ Criação de backlog detalhado no Jira

#### Mês 3: Desenvolvimento Core
**Backend:**
- Módulo `certifications` (models, APIs, testes)
- Módulo `marketplace` (versão básica)
- Módulo `kixikila` (MVP)
- Integração com sistema de pagamentos (Multicaixa Express)

**Frontend:**
- Portal de Certificação (UI/UX)
- Marketplace - Listagens e Pesquisa
- Kixikila - Criação de Grupos

**Infraestrutura:**
- CI/CD pipeline (GitHub Actions)
- Staging environment
- Monitoring (Sentry, DataDog)

#### Entregas Q1
- 📦 **Portal de Certificação INEFOB**: 5 categorias piloto
- 📦 **Marketplace Beta**: 100 prestadores de teste
- 📦 **Kixikila MVP**: 10 grupos piloto
- 📊 **Documentação Técnica**: API docs, guias de uso

---

### Q2 2026 (Abr-Jun): Lançamento Público

#### Mês 4: Beta Testing
- 🧪 Teste com 500 utilizadores beta
- 🧪 3 grupos Kixikila reais (motoqueiros, quituteiras, estudantes)
- 🧪 50 prestadores marketplace em 3 províncias
- 🧪 Feedback loops e ajustes

#### Mês 5: Marketing & Onboarding
- 📢 Campanha de lançamento (rádio, TV, redes sociais)
- 📢 Workshops presenciais em Luanda, Benguela, Huambo
- 📢 Parcerias com associações de classe
- 📢 Programa de embaixadores (influencers locais)

#### Mês 6: Scale-Up
- 🚀 Lançamento público em 5 províncias
- 🚀 Integração de mais parceiros de formação
- 🚀 Expansão de categorias marketplace
- 🚀 Onboarding de 50+ grupos Kixikila

#### Entregas Q2
- 📦 **5.000 utilizadores** registados
- 📦 **20 categorias profissionais** disponíveis
- 📦 **1.000 serviços** listados no marketplace
- 📦 **100 grupos Kixikila** ativos
- 📦 **500 certificações** emitidas

---

### Q3 2026 (Jul-Set): Consolidação & Expansão

#### Funcionalidades Avançadas
**Certificação:**
- Sistema de avaliação presencial (parceria com centros regionais)
- Blockchain para certificados (verificação imutável)
- Integração com LinkedIn e CVs digitais
- Portal de empregadores (busca de certificados)

**Marketplace:**
- Pagamentos em escrow (segurança)
- Sistema de entregas (integração transportadoras)
- Chat em tempo real
- Faturação automática
- Seguros para transações

**Kixikila:**
- Matching inteligente (IA)
- Sistema de leilão de posições
- Seguros de inadimplência
- Integração com marketplace (compras diretas)
- WhatsApp Bot para gestão de grupos

#### Expansão Geográfica
- Luanda ✅
- Benguela ✅
- Huambo ✅
- Huíla 🆕
- Cabinda 🆕
- Kwanza Norte 🆕
- Kwanza Sul 🆕

#### Entregas Q3
- 📦 **25.000 utilizadores**
- 📦 **50 categorias profissionais**
- 📦 **10.000 serviços** no marketplace
- 📦 **500 grupos Kixikila**
- 📦 **2.000 certificações**
- 📦 **AOA 200M GMV**

---

### Q4 2026 (Out-Dez): Escala Nacional & Sustentabilidade

#### Objetivos
- Presença nacional (18 províncias)
- Sustentabilidade financeira (break-even)
- Preparação para investimento Series A

#### Novas Funcionalidades
**Formalização Assistida:**
- Portal de registo de empresas (integração INAGBE)
- Consultoria fiscal automatizada
- Templates de contratos
- Resolução de disputas (mediação)

**Kixikila Empresarial:**
- Grupos corporativos (valores maiores)
- Crédito rotativo para negócios
- Parcerias com fornecedores (descontos)

**Analytics & BI:**
- Dashboard para parceiros INEFOB
- Relatórios de impacto social
- Previsões de demanda (ML)

#### Parcerias Estratégicas
- 🏦 Bancos (para financiamento adicional)
- 📱 Operadoras (Unitel, Africell - pagamentos móveis)
- 🚚 Logísticas (Fedex Angola, DHL)
- 🏢 Empresas (recrutamento de certificados)

#### Entregas Q4
- 📦 **100.000 utilizadores**
- 📦 **100+ categorias profissionais**
- 📦 **50.000 serviços** marketplace
- 📦 **2.000 grupos Kixikila**
- 📦 **10.000 certificações**
- 📦 **AOA 800M GMV**
- 📦 **30% formalização** de prestadores

---

## 🏗️ Arquitetura Técnica Expandida {#arquitetura-técnica}

### Stack Tecnológico

#### Backend
```
- Django 5.0.6 (Python 3.14)
- Django REST Framework (APIs)
- PostgreSQL 15 (Database principal)
- Redis 7 (Cache, Celery, WebSockets)
- Celery (Tarefas assíncronas)
- Channels (WebSockets para chat)
- Elasticsearch (Pesquisa avançada)
- Blockchain (Hyperledger Fabric para certificados)
```

#### Frontend
```
- React 18 + TypeScript
- Next.js 14 (SSR, SEO)
- Tailwind CSS (Design system)
- Redux Toolkit (State management)
- Socket.io (Real-time)
- React Query (Data fetching)
- Chart.js (Analytics)
```

#### Infraestrutura
```
- AWS/Azure/DigitalOcean
- Docker + Kubernetes
- Nginx (Load balancer)
- CloudFlare (CDN, DDoS protection)
- GitHub Actions (CI/CD)
- Sentry (Error tracking)
- Grafana + Prometheus (Monitoring)
```

#### Pagamentos & Integrações
```
- Multicaixa Express API
- Unitel Money API
- PayPal (internacional)
- SMS Gateway (Twilio/Nexmo)
- WhatsApp Business API
- Email (SendGrid)
```

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│  React PWA + Next.js (Web) | React Native (Mobile)      │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │   Load Balancer    │
         │   (Nginx/CloudFlare)│
         └─────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼               ▼
┌─────────┐  ┌─────────┐   ┌─────────┐
│ Django  │  │ Django  │   │ Django  │
│ Server  │  │ Server  │   │ Server  │
│    1    │  │    2    │   │    3    │
└────┬────┘  └────┬────┘   └────┬────┘
     │            │              │
     └────────────┼──────────────┘
                  │
       ┌──────────┼──────────────┬──────────────┐
       ▼          ▼              ▼              ▼
  ┌────────┐  ┌────────┐   ┌─────────┐   ┌─────────┐
  │Postgres│  │ Redis  │   │Elastic  │   │Blockchain│
  │   DB   │  │ Cache  │   │ Search  │   │  Fabric │
  └────────┘  └────────┘   └─────────┘   └─────────┘
       │
       ▼
  ┌────────────┐
  │   Celery   │
  │  Workers   │ → (Emails, Notificações, Reports)
  └────────────┘
       │
       ▼
  ┌─────────────────────────────────┐
  │   Integrações Externas          │
  │ - Multicaixa / Unitel Money     │
  │ - INEFOB APIs                   │
  │ - WhatsApp Business             │
  │ - SMS Gateway                   │
  └─────────────────────────────────┘
```

### Módulos Django (Apps)

```
backend/
├── accounts/          # Utilizadores e autenticação
├── participants/      # Candidatos do reality show
├── seasons/           # Temporadas e episódios
├── voting/            # Sistema de votação
├── donations/         # Doações tradicionais
├── store/             # Loja online básica
├── blog/              # Blog e notícias
├── content/           # Conteúdos educativos
├── games/             # Jogos educativos
├── ads/               # Anúncios
│
├── certifications/    # 🆕 Sistema INEFOB
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── admin.py
│   └── tasks.py       # Celery tasks
│
├── marketplace/       # 🆕 Marketplace
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── filters.py
│   ├── search.py      # Elasticsearch
│   └── payments.py
│
├── kixikila/          # 🆕 Sistema Kixikila
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── engine.py      # Lógica de rotação
│   ├── matching.py    # Algoritmo de matching
│   └── notifications.py
│
└── payments/          # 🆕 Gateway unificado
    ├── multicaixa.py
    ├── unitel_money.py
    ├── paypal.py
    └── escrow.py
```

### Segurança & Compliance

#### Autenticação & Autorização
- JWT com refresh tokens
- Rate limiting (Django REST Framework Throttle)
- 2FA opcional (SMS/Email)
- Permissões granulares (RBAC)

#### Proteção de Dados (GDPR-like)
- Encriptação de dados sensíveis (AES-256)
- Anonimização de dados para analytics
- Direito ao esquecimento
- Auditoria de acessos

#### Pagamentos
- PCI-DSS compliance
- Tokenização de cartões
- 3D Secure (quando disponível)
- Escrow para proteção de transações

#### Blockchain (Certificados)
- Hyperledger Fabric (permissionado)
- Smart contracts para emissão de certificados
- Verificação pública via QR Code
- Imutabilidade e auditoria

---

## 📊 Métricas e KPIs {#métricas-kpis}

### KPIs Globais (2026)

#### Utilizadores & Engagement
- 🎯 **100.000 utilizadores** registados (EOY 2026)
- 🎯 **40% MAU/MAU** (Monthly Active Users)
- 🎯 **60% retention** (mês 1)
- 🎯 **25% retention** (mês 6)
- 🎯 **30min sessão média**

#### Certificação INEFOB
- 🎯 **10.000 certificados** emitidos
- 🎯 **50 categorias** profissionais
- 🎯 **80% aprovação** em avaliações
- 🎯 **70% empregabilidade** pós-certificação
- 🎯 **50+ parceiros** de formação

#### Marketplace
- 🎯 **50.000 prestadores** ativos
- 🎯 **500.000 transações** (ano)
- 🎯 **AOA 1B GMV** (Gross Merchandise Value)
- 🎯 **4.5+ estrelas** rating médio
- 🎯 **30% formalização** (obtenção de NIF)
- 🎯 **20% take rate** (comissão média)

#### Kixikila
- 🎯 **2.000 grupos** ativos
- 🎯 **30.000 membros** participantes
- 🎯 **AOA 800M** movimentados
- 🎯 **<2% inadimplência**
- 🎯 **95% satisfação**
- 🎯 **12 meses** ciclo médio completo

#### Financeiro
- 🎯 **AOA 200M receita** anual
- 🎯 **Break-even** em Q4 2026
- 🎯 **35% margem bruta**
- 🎯 **US$ 2M ARR** (Annual Recurring Revenue)

### Dashboards de Monitoramento

#### Dashboard Executivo (CEO)
- Utilizadores ativos (DAU/MAU/WAU)
- Receita mensal (MRR)
- GMV marketplace
- Taxa de crescimento (MoM, YoY)
- Burn rate & runway

#### Dashboard Produto
- Feature adoption rate
- Bounce rate por página
- Funnel de conversão
- NPS (Net Promoter Score)
- CSAT (Customer Satisfaction)

#### Dashboard Operacional
- Uptime (99.9% SLA)
- Latência API (<200ms p95)
- Error rate (<0.1%)
- Transações processadas
- Suporte (tickets abertos/resolvidos)

#### Dashboard Impacto Social
- Empregos criados/facilitados
- Renda média gerada
- Formalização (informal → formal)
- Inclusão financeira (acesso a crédito)
- Capacitação (horas de formação)

---

## ⚠️ Riscos e Mitigação {#riscos-mitigação}

### Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Escalabilidade** | Média | Alto | Arquitetura cloud-native, load balancing, caching agressivo |
| **Segurança (fraude)** | Alta | Crítico | 2FA, KYC, limites de transação, ML para detecção de fraude |
| **Downtime** | Baixa | Alto | Multi-region deployment, backups diários, DR plan |
| **Integração pagamentos** | Média | Alto | Múltiplos gateways, fallback automático, testes rigorosos |

### Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Adoção lenta** | Média | Alto | Marketing agressivo, programas de incentivo, workshops presenciais |
| **Competição** | Alta | Médio | Diferenciação cultural (Kixikila), parcerias exclusivas (INEFOB) |
| **Inadimplência Kixikila** | Média | Alto | Scoring, garantidores, seguro, fundo de reserva |
| **Regulação** | Baixa | Médio | Compliance proativo, lobbing, parceria com governo |
| **Crise económica** | Média | Alto | Diversificação de receita, foco em valor real, pivot ágil |

### Riscos Sociais/Culturais

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Desconfiança digital** | Alta | Alto | Educação do utilizador, prova social, embaixadores locais |
| **Literacia digital baixa** | Alta | Médio | UI simplificada, suporte em Português, tutoriais em vídeo |
| **Resistência à formalização** | Média | Médio | Benefícios claros, processo simplificado, incentivos fiscais |
| **Disputas entre membros Kixikila** | Média | Alto | Termos claros, mediação, resolução de conflitos, tribunal arbitral |

### Riscos Financeiros

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Burn rate alto** | Alta | Crítico | Budget rigoroso, MVP lean, fundraising antecipado |
| **Falta de liquidez** | Média | Alto | Reservas de capital, linhas de crédito, parcerias estratégicas |
| **Volatilidade AOA** | Alta | Médio | Preços em USD internamente, hedging, diversificação moeda |

---

## 🎯 Plano de Implementação (Próximos 30 Dias) {#plano-implementação}

### Sprint 1 (Semana 1-2): Setup & Parcerias

**Dia 1-3: Infraestrutura**
- [ ] Provisionar servidores AWS/DigitalOcean
- [ ] Configurar PostgreSQL + Redis
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Criar repositórios Git (backend-ext, frontend-ext)

**Dia 4-7: Modelos de Dados**
- [ ] Criar apps Django: `certifications`, `marketplace`, `kixikila`
- [ ] Implementar modelos base (ver secções acima)
- [ ] Criar migrations
- [ ] Seeds de dados de teste

**Dia 8-10: Parcerias**
- [ ] Reunião com INEFOB (apresentação técnica)
- [ ] Definir 5 categorias piloto
- [ ] Assinar protocolo de parceria
- [ ] Mapear requisitos de certificação

**Dia 11-14: APIs Core**
- [ ] Endpoints de certificação (CRUD)
- [ ] Endpoints marketplace (listagens, pesquisa)
- [ ] Endpoints Kixikila (grupos, contribuições)
- [ ] Documentação OpenAPI

### Sprint 2 (Semana 3-4): Frontend & Integrações

**Dia 15-18: UI Components**
- [ ] Portal de Certificação (páginas principais)
- [ ] Marketplace - Listagens e Busca
- [ ] Kixikila - Criação e Gestão de Grupos
- [ ] Dashboard unificado

**Dia 19-21: Pagamentos**
- [ ] Integrar Multicaixa Express
- [ ] Teste de pagamentos em sandbox
- [ ] Fluxo de checkout

**Dia 22-25: Testes**
- [ ] Testes unitários (backend)
- [ ] Testes E2E (frontend)
- [ ] Teste de carga (500 RPS)
- [ ] Security audit

**Dia 26-30: Beta Launch**
- [ ] Deploy em staging
- [ ] Onboarding de 50 beta testers
- [ ] 3 grupos Kixikila piloto
- [ ] Coleta de feedback
- [ ] Ajustes rápidos

---

## 💡 Conclusão

Este roadmap representa uma **transformação estratégica** do projeto Acredita, evoluindo de uma plataforma de reality show para um **ecossistema digital de inclusão económica** em Angola.

### Diferenciais Competitivos

1. **Culturalmente Relevante**: Kixikila é familiar, confiável e comprovado
2. **Certificação Oficial**: Parceria INEFOB valida competências e abre portas
3. **Economia Real**: Foco no informal (onde está 70% da força de trabalho)
4. **Tecnologia Acessível**: Mobile-first, pagamentos locais, UI em Português
5. **Impacto Social**: Mensurável e escalável

### Próximos Passos Imediatos

1. ✅ **Aprovar roadmap** com stakeholders
2. ✅ **Formalizar parceria INEFOB** (protocolo assinado)
3. ✅ **Contratar equipa** (4 devs + 1 designer)
4. ✅ **Fundraising**: Preparar pitch deck para Series A (US$ 2-3M)
5. ✅ **Kickoff técnico**: Sprint Planning (Jira)

### Visão 2030

**"Ser a plataforma de referência em África para transição do informal ao formal, capacitação profissional e microfinanciamento comunitário, gerando 1 milhão de empregos e movimentando US$ 1B em transações."**

---

**Documentado por:** GitHub Copilot + Equipa Acredita  
**Data:** 09 de Dezembro de 2025  
**Versão:** 2.0 - Roadmap Estratégico Expandido  
**Próxima Revisão:** Janeiro 2026

---

## 📎 Anexos

### A. Categorias Profissionais Prioritárias (INEFOB)
1. Transportes e Logística
2. Construção Civil
3. Beleza e Estética
4. Alimentação e Catering
5. Reparações Técnicas
6. Limpeza e Higiene
7. Educação e Formação
8. Tecnologia e Digital
9. Artesanato e Arte
10. Serviços Financeiros

### B. Tecnologias a Avaliar
- **Blockchain**: Algorand, Stellar (para micropagamentos)
- **ML/IA**: TensorFlow, Scikit-learn (matching, fraud detection)
- **Analytics**: Mixpanel, Amplitude
- **CRM**: HubSpot, Salesforce
- **Suporte**: Zendesk, Intercom

### C. Parcerias Estratégicas Potenciais
- **Governo**: INEFOB, INAPEM, INAGBE, Ministério da Juventude
- **Bancos**: BFA, BAI, BCI, Millennium Atlântico
- **Telcos**: Unitel, Africell, Movicel
- **Universidades**: ISPTEC, UAN, Universidade Metodista
- **ONGs**: ADRA, Oikos, Development Workshop
- **Empresas**: Refriango, Coca-Cola, Unilever (empregadores)

### D. Casos de Uso (User Stories)

**História 1: João, o Motoqueiro**
> João é motoqueiro há 5 anos em Luanda, mas nunca teve certificado. Usa a plataforma Acredita para:
> 1. Fazer curso de condução defensiva (certificado INEFOB)
> 2. Entrar num grupo Kixikila de 20 motoqueiros (50k AOA/mês)
> 3. Receber payout no 8º mês (1M AOA)
> 4. Comprar moto nova via marketplace
> 5. Formalizar negócio (obter NIF)
> 6. Ofertar serviços no marketplace com selo "Certificado"

**História 2: Maria, a Quituteira**
> Maria vende quitutes no bairro, mas quer expandir. Usa Acredita para:
> 1. Certificar-se em Manipulação de Alimentos (INEFOB)
> 2. Criar grupo Kixikila com 15 quituteiras (30k AOA/mês)
> 3. Usar payout para comprar freezer industrial
> 4. Vender produtos no marketplace
> 5. Receber encomendas online
> 6. Formalizar empresa (microempresa)

**História 3: Pedro, o Estudante**
> Pedro estuda Eng. Informática e precisa de laptop. Usa Acredita para:
> 1. Entrar em grupo Kixikila de 10 estudantes (10k AOA/mês)
> 2. Receber payout no 3º mês (100k AOA)
> 3. Comprar laptop usado no marketplace
> 4. Oferecer serviços de web design (marketplace)
> 5. Fazer curso de UI/UX (certificação)
> 6. Construir portfólio e conseguir estágio

---

**🎉 Este é o futuro do Acredita. Vamos construí-lo juntos! 🇦🇴**
