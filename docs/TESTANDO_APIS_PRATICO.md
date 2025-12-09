# 🧪 Testando APIs de Certificações - Guia Prático

**Data:** 09/12/2025  
**Servidor:** http://127.0.0.1:8000  
**Admin:** http://127.0.0.1:8000/admin

---

## 1️⃣ Acessar Admin Panel

```
URL: http://127.0.0.1:8000/admin/
Username: seu_user (criado durante setup)
Password: sua_senha

Menu:
├── Certificações
│   ├── Professional Categories
│   ├── Training Programs
│   ├── Candidate Enrollments
│   ├── Skill Assessments
│   └── Assessment Results
```

### O Que Ver:
- ✅ 5 categorias profissionais
- ✅ 5 programas de formação
- ✅ Interface colorida com status visual
- ✅ Ações em bulk (marcar como certificado)

---

## 2️⃣ Testar APIs com cURL

### Pré-requisito: Gerar Token JWT

```bash
# 1. Obter token
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"seu_user","password":"sua_senha"}'

# Resposta:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# 2. Guardar o token
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### Testar Endpoints

#### A) Listar Categorias
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/categories/

# Resposta:
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Motoqueiro",
      "inefob_code": "MTQ001",
      "description": "Condutor profissional...",
      "programs_count": 1,
      "active_programs_count": 1
    },
    ...
  ]
}
```

#### B) Listar Programas
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/programs/

# Resposta:
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "title": "Formação em Segurança de Transportes Motorizados",
      "category": 1,
      "category_name": "Motoqueiro",
      "provider": "Instituto de Transportes Angola",
      "duration_hours": 40,
      "cost": "5000.00",
      "is_inefob_certified": true,
      "current_participants": 0,
      "is_full": false
    },
    ...
  ]
}
```

#### C) Inscrever em Programa
```bash
curl -X POST http://127.0.0.1:8000/api/v2/certifications/enrollments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"program": 1}'

# Resposta (201 Created):
{
  "id": 1,
  "candidate": 123,
  "candidate_username": "seu_user",
  "program": 1,
  "program_title": "Formação em Segurança...",
  "status": "enrolled",
  "enrollment_date": "2025-12-09T13:45:00.000Z"
}
```

#### D) Ver Minhas Inscrições
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/enrollments/

# Resposta:
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "candidate": 123,
      "program": 1,
      "program_title": "Formação em Segurança...",
      "status": "enrolled",
      "enrollment_date": "2025-12-09T13:45:00Z"
    }
  ]
}
```

#### E) Iniciar Programa
```bash
curl -X POST http://127.0.0.1:8000/api/v2/certifications/enrollments/1/start/ \
  -H "Authorization: Bearer $TOKEN"

# Resposta (200 OK):
{
  "status": "Programa iniciado"
}

# Verificar status
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/enrollments/1/

# Status agora é "in_progress"
```

#### F) Completar Programa
```bash
curl -X POST http://127.0.0.1:8000/api/v2/certifications/enrollments/1/complete/ \
  -H "Authorization: Bearer $TOKEN"

# Resposta (200 OK):
{
  "status": "Programa marcado como concluído"
}
```

#### G) Ver Estatísticas
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/enrollments/my_stats/

# Resposta:
{
  "total_enrolled": 1,
  "in_progress": 0,
  "completed": 1,
  "certified": 0,
  "failed": 0,
  "by_category": {
    "Motoqueiro": {
      "count": 1,
      "certified": 0
    }
  }
}
```

---

## 3️⃣ Testar com Postman/Insomnia

### 1. Criar Collection "Acredita Certifications"

#### Request 1: Login
```
Method: POST
URL: http://127.0.0.1:8000/api/auth/login/
Headers:
  Content-Type: application/json
Body:
{
  "username": "seu_user",
  "password": "sua_senha"
}
```

Resposta salva como variável: `{{ access_token }}`

#### Request 2: List Categories
```
Method: GET
URL: http://127.0.0.1:8000/api/v2/certifications/categories/
Headers:
  Authorization: Bearer {{ access_token }}
```

#### Request 3: List Programs
```
Method: GET
URL: http://127.0.0.1:8000/api/v2/certifications/programs/
Headers:
  Authorization: Bearer {{ access_token }}
```

#### Request 4: Enroll
```
Method: POST
URL: http://127.0.0.1:8000/api/v2/certifications/enrollments/
Headers:
  Authorization: Bearer {{ access_token }}
  Content-Type: application/json
Body:
{
  "program": 1
}
```

Salvar `enrollment_id` da resposta

#### Request 5: Start Program
```
Method: POST
URL: http://127.0.0.1:8000/api/v2/certifications/enrollments/{{ enrollment_id }}/start/
Headers:
  Authorization: Bearer {{ access_token }}
```

#### Request 6: Complete Program
```
Method: POST
URL: http://127.0.0.1:8000/api/v2/certifications/enrollments/{{ enrollment_id }}/complete/
Headers:
  Authorization: Bearer {{ access_token }}
```

#### Request 7: My Stats
```
Method: GET
URL: http://127.0.0.1:8000/api/v2/certifications/enrollments/my_stats/
Headers:
  Authorization: Bearer {{ access_token }}
```

---

## 4️⃣ Testar Validações

### Erro 401 - Sem Autenticação
```bash
curl http://127.0.0.1:8000/api/v2/certifications/categories/

# Resposta (401):
{
  "detail": "Authentication credentials were not provided."
}
```

### Erro 403 - Feature Desativada
Se você desativar feature flag em settings:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/categories/

# Resposta (403):
{
  "error": "Certificações não estão disponíveis",
  "feature": "certifications"
}
```

### Erro 400 - Inscrição Duplicada
```bash
# Primeira inscrição funciona (201)
curl -X POST http://127.0.0.1:8000/api/v2/certifications/enrollments/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"program": 1}'

# Segunda inscrição falha (400)
curl -X POST http://127.0.0.1:8000/api/v2/certifications/enrollments/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"program": 1}'

# Resposta (400):
{
  "error": "Já está inscrito neste programa"
}
```

### Erro 403 - Apenas Admin Pode Certificar
```bash
# User normal tenta certificar
curl -X POST http://127.0.0.1:8000/api/v2/certifications/enrollments/1/certify/ \
  -H "Authorization: Bearer $TOKEN"

# Resposta (403):
{
  "error": "Apenas administradores podem emitir certificados"
}

# Admin consegue (200)
# (com token de admin)
{
  "status": "Certificado emitido",
  "certificate_code": "CERT-MTQ001-123-20251209"
}
```

---

## 5️⃣ Testar Admin Interface

### Acesso à Panel
```
http://127.0.0.1:8000/admin/

Seções:
├── Certificações
│   ├── Professional Categories
│   │   - Listar 5 categorias
│   │   - Ver número de programas
│   │   - Buscar por nome/código
│   │
│   ├── Training Programs
│   │   - Listar 5 programas
│   │   - Ver capacidade (participantes/máximo)
│   │   - Ação: "Marcar como Certificado"
│   │
│   ├── Candidate Enrollments
│   │   - Listar inscrições
│   │   - Ver status colorido
│   │   - Ações: Iniciar, Completar, Certificar
│   │
│   ├── Skill Assessments
│   │   - Listar avaliações por programa
│   │
│   └── Assessment Results
│       - Ver resultados individuais
│       - Editar score/notas
```

---

## 6️⃣ Cenário de Teste Completo

```
Passo 1: User faz login ✅
  - Recebe token JWT
  - Token válido por 1 hora

Passo 2: User lista categorias ✅
  - Vê 5 categorias
  - Vê descrição e código INEFOB

Passo 3: User filtra programas por categoria ✅
  - GET /api/v2/certifications/programs/?category=1
  - Vê programas da categoria Motoqueiro

Passo 4: User escolhe programa ✅
  - Lê detalhes
  - Vê custo, duração, se é certificado INEFOB

Passo 5: User se inscreve ✅
  - POST /enrollments/
  - Recebe ID da inscrição
  - Status começa como "enrolled"

Passo 6: User inicia programa ✅
  - POST /enrollments/{id}/start/
  - Status muda para "in_progress"
  - Data de início registada

Passo 7: User completa programa ✅
  - POST /enrollments/{id}/complete/
  - Status muda para "completed"
  - Data de conclusão registada

Passo 8: Admin emite certificado ✅
  - POST /enrollments/{id}/certify/ (admin)
  - Status muda para "certified"
  - Código único gerado

Passo 9: User vê estatísticas ✅
  - GET /enrollments/my_stats/
  - 1 programa concluído
  - 1 certificado emitido

Passo 10: Admin vê tudo no painel ✅
  - Acessa /admin/certifications/
  - Vê todas as inscrições
  - Pode fazer ações em bulk
```

---

## 📈 Comandos Úteis

```bash
# Ver logs de desenvolvimento
tail -f logs/acredita.log | grep "certifications"

# Contar inscrições
python manage.py dbshell
SELECT COUNT(*) FROM certifications_candidateenrollment;

# Ver dados em JSON
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v2/certifications/status/ | jq .

# Buscar com filtro
curl -H "Authorization: Bearer $TOKEN" \
  "http://127.0.0.1:8000/api/v2/certifications/programs/?category=1" | jq .
```

---

## ✅ Checklist de Teste

```
Funcionalidade:
  [ ] Listar categorias
  [ ] Listar programas
  [ ] Inscrever em programa
  [ ] Ver minhas inscrições
  [ ] Iniciar programa
  [ ] Completar programa
  [ ] Ver estatísticas
  [ ] Admin certifica programa

Validações:
  [ ] Autenticação obrigatória (401)
  [ ] Feature flag testada (403 se desativada)
  [ ] Inscrição duplicada bloqueada (400)
  [ ] Admin-only actions protegidas (403)

Admin:
  [ ] Ver categorias no admin
  [ ] Ver programas no admin
  [ ] Ver inscrições no admin
  [ ] Ações em bulk funcionam

Performance:
  [ ] Requests < 200ms
  [ ] Paginação automática
  [ ] Busca/filtro eficiente
```

---

## 🎉 Pronto Para Testar!

```bash
# 1. Terminal 1: Rodar servidor
.venv\Scripts\python.exe manage.py runserver

# 2. Terminal 2: Rodar testes
.venv\Scripts\python.exe test_certifications_apis.py

# 3. Browser: Admin panel
http://127.0.0.1:8000/admin/

# 4. Postman/Insomnia: APIs
GET /api/v2/certifications/categories/
```

---

> **"Tudo pronto para produção! Teste e aprove! 🚀"**
