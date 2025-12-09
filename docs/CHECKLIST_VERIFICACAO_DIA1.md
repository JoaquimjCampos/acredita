# ✅ CHECKLIST DE VERIFICAÇÃO - DIA 1 COMPLETO

**Use este checklist para validar que tudo foi implementado corretamente**

---

## 🔍 VERIFICAÇÃO RÁPIDA

### 1. Arquivos Criados
```bash
# Verificar que todos os arquivos existem
ls -la backend/core/
ls -la backend/certifications/
ls -la docs/DIA1_*
ls -la run_populate_certifications.py
ls -la test_certifications_apis.py
```

✅ Esperado: Todos os arquivos existem

---

### 2. Banco de Dados
```bash
# Verificar que tabelas foram criadas
python manage.py dbshell
sqlite> .tables
# Deve incluir:
#  - certifications_professionalcategory
#  - certifications_trainingprogram
#  - certifications_candidateenrollment
#  - certifications_skillassessment
#  - certifications_assessmentresult
```

✅ Esperado: 5 tabelas de certificações

---

### 3. Dados Iniciais
```bash
python manage.py shell
>>> from backend.certifications.models import *
>>> ProfessionalCategory.objects.count()
5  ✅
>>> TrainingProgram.objects.count()
5  ✅
```

✅ Esperado: 5 categorias + 5 programas populados

---

### 4. Django Check
```bash
python manage.py check
# System check identified no issues (0 silenced)
```

✅ Esperado: No issues

---

### 5. Settings Atualizados
```bash
# Verificar settings.py tem novos apps e feature flags
grep "certifications" backend/acredita_backend/settings.py
grep "core" backend/acredita_backend/settings.py
grep "ACTIVE_FEATURES" backend/acredita_backend/settings.py
```

✅ Esperado: Todas as linhas encontradas

---

### 6. URLs Configuradas
```bash
# Verificar que URLs estão registadas
grep "v2/certifications" backend/acredita_backend/urls.py
```

✅ Esperado: Linha encontrada

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Admin Interface
```
1. Ir para http://127.0.0.1:8000/admin/
2. Login com seu user
3. Procurar "Certificações" no menu esquerdo
4. Clicar em "Professional Categories"
```

✅ Esperado: Ver 5 categorias com Motoqueiro, Pedreiro, etc.

---

### Teste 2: API - Listar Categorias
```bash
# Obter token
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"seu_user","password":"sua_senha"}' | jq -r '.access')

# Listar categorias
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/categories/ | jq '.count'
```

✅ Esperado: `count: 5`

---

### Teste 3: API - Inscrever em Programa
```bash
curl -X POST http://127.0.0.1:8000/api/v2/certifications/enrollments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"program": 1}' | jq '.status'
```

✅ Esperado: `"enrolled"`

---

### Teste 4: API - Ver Estatísticas
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/enrollments/my_stats/ | jq '.total_enrolled'
```

✅ Esperado: `1` (ou número de inscrições)

---

### Teste 5: Feature Flag Ativada
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/status/ | jq '.certifications_enabled'
```

✅ Esperado: `true` (em DEBUG mode)

---

## 📊 ESTRUTURA DE PASTA

Executar este comando para verificar:
```bash
tree backend/certifications/ -I "__pycache__"
```

Esperado:
```
backend/certifications/
├── migrations/
│   ├── 0001_initial.py
│   └── __init__.py
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── populate_data.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py
```

✅ Todos os 10 arquivos presentes

---

## 🧪 RODAR TESTES AUTOMATIZADOS

```bash
# Rodar testes do módulo certifications
python -m pytest backend/certifications/tests.py -v

# OU com Django test runner
python manage.py test backend.certifications

# Esperado: 15+ testes passarem
```

✅ Esperado: Todos os testes passam (15/15)

---

## 📝 VERIFICAÇÃO DE DOCUMENTAÇÃO

```bash
# Verificar que todos os docs foram criados
ls -la docs/ | grep -i "dia1\|resumo\|roadmap\|testando\|plano\|guia"
```

✅ Esperado: 6+ documentos

---

## 🔐 VALIDAÇÃO DE SEGURANÇA

### Teste 1: Sem Autenticação
```bash
curl http://127.0.0.1:8000/api/v2/certifications/categories/
# Esperado: 401 Unauthorized
```

✅ Resposta: 401

---

### Teste 2: Feature Flag Desativada
```bash
# Modificar settings.py: ACTIVE_FEATURES['certifications'] = False
# Rodar API novamente
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/categories/
# Esperado: 403 Forbidden
```

✅ Resposta: 403

---

### Teste 3: Inscrição Duplicada
```bash
# Inscrever duas vezes no mesmo programa
curl -X POST /api/v2/certifications/enrollments/ -d '{"program": 1}'
curl -X POST /api/v2/certifications/enrollments/ -d '{"program": 1}'
# Segunda: Esperado 400 Bad Request
```

✅ Segunda resposta: 400

---

### Teste 4: Apenas Admin Pode Certificar
```bash
# User normal tenta certificar
curl -X POST /api/v2/certifications/enrollments/1/certify/
# Esperado: 403 Forbidden
```

✅ Resposta: 403

---

## 💾 VERIFICAÇÃO DE BANCO DE DADOS

```bash
python manage.py dbshell

# Contar registos
SELECT 'Categories' as table_name, COUNT(*) FROM certifications_professionalcategory
UNION ALL
SELECT 'Programs', COUNT(*) FROM certifications_trainingprogram
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM certifications_candidateenrollment;

# Esperado:
# Categories: 5
# Programs: 5
# Enrollments: 1+ (dependendo de testes)
```

✅ Registos encontrados como esperado

---

## 🚀 PERFORMANCE

```bash
# Testar latência de endpoint
curl -w "Response time: %{time_total}s\n" \
  -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/programs/
```

✅ Esperado: < 200ms

---

## 📱 ADMIN INTERFACE

Verificar manualmente:

### Professional Categories
- [ ] Listar 5 categorias
- [ ] Cada tem nome, código, descrição
- [ ] Pode editar
- [ ] Pode deletar (será prevenido por foreign key)

### Training Programs
- [ ] Listar 5 programas
- [ ] Ver categoria associada
- [ ] Ver custo em AOA
- [ ] Ver duração em horas
- [ ] Ação "Marcar como Certificado" disponível

### Candidate Enrollments
- [ ] Listar inscrições
- [ ] Status colorido (visual)
- [ ] Ações: Iniciar, Completar, Certificar
- [ ] Poder filtrar por status

---

## 📚 DOCUMENTAÇÃO

Verificar que cada doc tem:

### DIA1_IMPLEMENTACAO_COMPLETA.md
- [ ] ✅ O que foi implementado
- [ ] ✅ Models descritos
- [ ] ✅ Endpoints listados
- [ ] ✅ Testes explicados
- [ ] ✅ Admin descrito

### RESUMO_EXECUTIVO_DIA1.md
- [ ] ✅ Status completo
- [ ] ✅ Métricas
- [ ] ✅ Próximos passos

### TESTANDO_APIS_PRATICO.md
- [ ] ✅ Exemplos com cURL
- [ ] ✅ Postman collection
- [ ] ✅ Cenários de teste

### ROADMAP_ATUALIZADO_DIA1.md
- [ ] ✅ Timeline completa
- [ ] ✅ Marketplace descrito
- [ ] ✅ Kixikila descrito

---

## 🎯 FINAL CHECK

Responda SIM a todas:

```
[ ] Código compila sem erros
[ ] Migrations foram aplicadas
[ ] Dados foram populados
[ ] APIs funcionam (GET/POST)
[ ] Admin interface funciona
[ ] Testes passam
[ ] Feature flags funcionam
[ ] Documentação está completa
[ ] Zero breaking changes
[ ] Segurança validada
[ ] Performance OK
[ ] Pronto para code review
[ ] Pronto para staging
[ ] Pronto para produção
```

✅ Se TODOS os pontos estão checkados: **DIA 1 APROVADO**

---

## 🚀 PRÓXIMAS AÇÕES

Se tudo passou:

1. **Hoje:**
   - [ ] Criar branch para code review
   - [ ] Comunicar ao time sobre implementação

2. **Amanhã:**
   - [ ] Code review iniciado
   - [ ] Feedback coletado

3. **Próxima semana:**
   - [ ] Merge em develop
   - [ ] Deploy em staging
   - [ ] Beta testing

---

## 📞 SE ALGO FALHAR

### Erro: Migrations not applied
```bash
python manage.py migrate certifications
```

### Erro: Dados não populados
```bash
python run_populate_certifications.py
```

### Erro: Feature flag não ativa
```bash
# Verificar settings.py
grep -A 5 "ACTIVE_FEATURES" backend/acredita_backend/settings.py
# DEBUG deve estar True
```

### Erro: Admin não mostra certificações
```bash
# Reiniciar servidor
python manage.py runserver
# Verificar que apps estão em INSTALLED_APPS
```

---

## ✅ APROVAÇÃO FINAL

```
┌────────────────────────────┐
│                            │
│  DIA 1 - PRONTO PARA      │
│  CODE REVIEW              │
│                            │
│  Status: ✅ APROVADO       │
│  Data: 09/12/2025         │
│  Revisor: [seu nome]      │
│                            │
│  Próximo: Staging         │
│                            │
└────────────────────────────┘
```

---

**Use este checklist antes de mergear!**  
**Todos os ✅ devem estar verde.**  
**Se algo estiver ❌, não é pronto para merge.**

---

> Verificação completa? Sucesso! Próximo: Code Review e Staging 🚀
