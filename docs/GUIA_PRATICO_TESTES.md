# Guia Prático de Testes - Backend-Frontend

**Data:** 9 de dezembro de 2025  
**Objetivo:** Validar integração completa dos 3 módulos

---

## 🚀 Setup Inicial

### Pré-requisitos

```bash
# Backend
- Python 3.9+
- Django 5.0
- Django REST Framework
- djangorestframework-simplejwt

# Frontend  
- Node.js 16+
- npm ou yarn
- React 18
- TypeScript
```

### Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd C:\apps\Acredita
# Ativar venv
venv\Scripts\activate

# Migrations
python manage.py migrate

# Criar superuser (se necessário)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
# Acesso: http://localhost:8000
# Admin: http://localhost:8000/admin
```

**Terminal 2 - Frontend:**
```bash
cd C:\apps\Acredita\frontend
npm install  # Se primeira vez
npm start
# Acesso: http://localhost:3000
```

---

## 📋 Checklist de Testes

### 1️⃣ TESTES DE AUTENTICAÇÃO

#### Teste 1.1: Login Válido
```gherkin
Given: Usuário acessa http://localhost:3000/login
When: Preenche credenciais válidas e clica "Login"
Then: Redirecionado para /dashboard
And: Token JWT armazenado em localStorage
And: Usuário autenticado em requisições subsequentes
```

**Passos:**
1. Acessar http://localhost:3000/login
2. Email: `testuser@example.com` (ajuste conforme seu backend)
3. Password: `password123`
4. Clicar "Entrar"
5. Verificar redirecionamento para /dashboard
6. Abrir DevTools > Application > localStorage
7. Confirmar presença de `accessToken`

**Resultado esperado:** ✅ Login bem-sucedido, token armazenado

---

#### Teste 1.2: Rota Protegida Sem Autenticação
```gherkin
Given: Usuário NÃO está autenticado
When: Acessa /certifications diretamente
Then: Redirecionado para /login
```

**Passos:**
1. Limpar localStorage: `localStorage.clear()`
2. Acessar http://localhost:3000/certifications
3. Verificar redirecionamento para /login

**Resultado esperado:** ✅ Redirecionado para login

---

### 2️⃣ TESTES DO MÓDULO CERTIFICATIONS

#### Teste 2.1: Listar Programas de Certificação
```gherkin
Given: Usuário está autenticado
When: Acessa http://localhost:3000/certifications
Then: Listagem de programas é carregada
And: Cards mostram título, categoria, duração, preço
And: Loading state aparece/desaparece
```

**Passos:**
1. Fazer login
2. Navegar para /certifications
3. Aguardar carregamento
4. Verificar listagem de programas

**Verificações:**
- [ ] Programas aparecem em cards
- [ ] Cada card mostra: título, categoria, duração, preço
- [ ] Barra de busca funciona (teste digitando "Python")
- [ ] Filtro por categoria funciona
- [ ] Paginação funciona (se aplicável)

**Resultado esperado:** ✅ Listagem completa e funcional

---

#### Teste 2.2: Acessar Detalhes de Programa
```gherkin
Given: Usuário vê listagem de programas
When: Clica em um programa
Then: Navega para /certifications/{id}
And: Detalhes são carregados
And: Informações são exibidas em grid
```

**Passos:**
1. Na página de certifications, clicar em um programa
2. Aguardar carregamento
3. Verificar detalhes exibidos

**Verificações:**
- [ ] URL muda para /certifications/{id}
- [ ] Título do programa aparece no header
- [ ] Grid mostra: Categoria, Duração, Vagas, Preço
- [ ] Descrição é exibida
- [ ] Loading state desaparece

**Resultado esperado:** ✅ Detalhes carregados com sucesso

---

#### Teste 2.3: Inscrição em Programa
```gherkin
Given: Usuário está na página de detalhes de um programa
When: Preenche formulário de inscrição
And: Clica "Confirmar Inscrição"
Then: Inscrição é enviada ao backend
And: Mensagem de sucesso aparece
And: Usuário pode navegar para /my-enrollments
```

**Passos:**
1. Na página de detalhes, rolar para o formulário de inscrição
2. Verificar que Nome e Email estão pré-preenchidos
3. Adicionar observações (opcional)
4. Clicar "Confirmar Inscrição"
5. Aguardar resposta

**Verificações:**
- [ ] Campos validados (required)
- [ ] Botão mostra loading durante envio
- [ ] Toast de sucesso aparece
- [ ] Formulário é limpo (ou redireciona)
- [ ] DevTools > Network mostra POST para /api/certifications/programs/{id}/enroll/
- [ ] Response status é 201 (Created)

**Resultado esperado:** ✅ Inscrição criada com sucesso

---

#### Teste 2.4: Listar Minhas Inscrições
```gherkin
Given: Usuário se inscreveu em um programa
When: Acessa /my-enrollments
Then: Programas em que se inscreveu aparecem
And: Cada item mostra: título, categoria, duração
```

**Passos:**
1. Após teste 2.3 (inscrição realizada)
2. Navegar para /my-enrollments
3. Verificar que programa aparece na lista

**Verificações:**
- [ ] Página carrega corretamente
- [ ] Lista mostra inscrições
- [ ] Cada item tem botão "Ver Detalhes"
- [ ] Se clicar "Ver Detalhes", navega para detalhes do programa

**Resultado esperado:** ✅ Minhas inscrições aparecem corretamente

---

### 3️⃣ TESTES DO MÓDULO MARKETPLACE

#### Teste 3.1: Listar Serviços
```gherkin
Given: Usuário está autenticado
When: Acessa http://localhost:3000/marketplace
Then: Listagem de serviços é carregada
And: Cards mostram título, localização, preço
```

**Passos:**
1. Fazer login
2. Navegar para /marketplace
3. Aguardar carregamento

**Verificações:**
- [ ] Serviços aparecem em cards
- [ ] Cada card mostra: título, localização, preço, tipo
- [ ] Barra de busca funciona
- [ ] Filtro por categoria funciona
- [ ] Filtro por preço (range) funciona

**Resultado esperado:** ✅ Listagem de serviços funcional

---

#### Teste 3.2: Acessar Detalhes de Serviço
```gherkin
Given: Usuário vê listagem de serviços
When: Clica em um serviço
Then: Navega para /marketplace/{id}
And: Detalhes são carregados
```

**Passos:**
1. Na página marketplace, clicar em um serviço
2. Aguardar carregamento

**Verificações:**
- [ ] URL muda para /marketplace/{id}
- [ ] Grid mostra: Localização, Preço, Tipo de Preço, Visualizações
- [ ] Descrição é exibida
- [ ] Informações do provedor aparecem

**Resultado esperado:** ✅ Detalhes do serviço exibidos

---

#### Teste 3.3: Solicitar Serviço
```gherkin
Given: Usuário está na página de detalhes de um serviço
When: Preenche formulário de solicitação
And: Clica "Enviar Solicitação"
Then: Solicitação é enviada ao backend
And: Mensagem de sucesso aparece
```

**Passos:**
1. Na página de detalhes, rolar para o formulário
2. Adicionar observações
3. Clicar "Enviar Solicitação"
4. Aguardar resposta

**Verificações:**
- [ ] Formulário valida campos
- [ ] Botão mostra loading durante envio
- [ ] Toast de sucesso aparece
- [ ] DevTools > Network mostra POST para /api/marketplace/orders/
- [ ] Response status é 201

**Resultado esperado:** ✅ Solicitação criada

---

#### Teste 3.4: Listar Minhas Solicitações
```gherkin
Given: Usuário fez uma solicitação
When: Acessa /my-orders
Then: Solicitações aparecem na lista
```

**Passos:**
1. Após teste 3.3
2. Navegar para /my-orders
3. Verificar que serviço solicitado aparece

**Verificações:**
- [ ] Página carrega
- [ ] Solicitações aparecem em lista
- [ ] Cada item mostra: título, localização, preço
- [ ] Botão "Ver Detalhes" funciona

**Resultado esperado:** ✅ Minhas solicitações aparecem

---

### 4️⃣ TESTES DO MÓDULO KIXIKILA

#### Teste 4.1: Listar Grupos Kixikila
```gherkin
Given: Usuário está autenticado
When: Acessa http://localhost:3000/kixikila
Then: Listagem de grupos é carregada
And: Cards mostram nome, tipo, membros
```

**Passos:**
1. Fazer login
2. Navegar para /kixikila
3. Aguardar carregamento

**Verificações:**
- [ ] Grupos aparecem em cards
- [ ] Cada card mostra: nome, tipo, número de membros, contribuição mensal
- [ ] Barra de busca funciona
- [ ] Abas "Explorar" e "Meus Grupos" funcionam

**Resultado esperado:** ✅ Listagem de grupos funcional

---

#### Teste 4.2: Acessar Detalhes de Grupo
```gherkin
Given: Usuário vê listagem de grupos
When: Clica em um grupo
Then: Navega para /kixikila/{id}
And: Detalhes são carregados
```

**Passos:**
1. Na página kixikila, clicar em um grupo
2. Aguardar carregamento

**Verificações:**
- [ ] URL muda para /kixikila/{id}
- [ ] Grid mostra: Administrador, Tipo, Contribuição, Membros, Status, Data
- [ ] Descrição é exibida
- [ ] Status aparece formatado (verde se ativo)

**Resultado esperado:** ✅ Detalhes do grupo exibidos

---

#### Teste 4.3: Solicitar Participação
```gherkin
Given: Usuário está na página de detalhes de um grupo
When: Preenche formulário de solicitação
And: Clica "Enviar Solicitação"
Then: Solicitação é enviada ao backend
And: Mensagem de sucesso aparece
```

**Passos:**
1. Na página de detalhes, rolar para o formulário
2. Adicionar mensagem (opcional)
3. Clicar "Enviar Solicitação"
4. Aguardar resposta

**Verificações:**
- [ ] Formulário aparece com gradient verde
- [ ] Botão mostra loading durante envio
- [ ] Toast de sucesso aparece
- [ ] DevTools > Network mostra POST para /api/kixikila/groups/{id}/join/
- [ ] Response status é 201

**Resultado esperado:** ✅ Solicitação de participação criada

---

#### Teste 4.4: Listar Meus Grupos
```gherkin
Given: Usuário solicitou participação em um grupo
When: Acessa /my-groups
Then: Grupos aparecem na lista
```

**Passos:**
1. Após teste 4.3
2. Navegar para /my-groups
3. Verificar que grupo solicitado aparece

**Verificações:**
- [ ] Página carrega
- [ ] Grupos aparecem em lista
- [ ] Cada item mostra: nome, tipo, membros, contribuição
- [ ] Botão "Ver Detalhes" funciona

**Resultado esperado:** ✅ Meus grupos aparecem

---

### 5️⃣ TESTES DE UX/UI

#### Teste 5.1: Responsividade
```gherkin
Given: Qualquer página do app
When: Redimensiona a janela do browser
Then: Layout se adapta corretamente
```

**Passos:**
1. Usar DevTools > Toggle Device Toolbar
2. Testar em: Mobile (375px), Tablet (768px), Desktop (1920px)
3. Verificar se layouts são responsivos

**Resultado esperado:** ✅ Layout responsivo em todos os tamanhos

---

#### Teste 5.2: Loading States
```gherkin
Given: Qualquer página que carrega dados
When: Página está carregando
Then: Loading spinner aparece
And: Conteúdo não é renderizado
```

**Passos:**
1. Abrir DevTools > Network
2. Throttle para "Slow 3G"
3. Navegar para /certifications
4. Observar loading state

**Verificações:**
- [ ] Spinner aparece enquanto carrega
- [ ] Conteúdo não renderiza até pronto
- [ ] Spinner desaparece quando conteúdo está pronto

**Resultado esperado:** ✅ Loading states funcionam

---

#### Teste 5.3: Tratamento de Erros
```gherkin
Given: Requisiçao com erro no backend
When: Frontend tenta fazer requisição
Then: Mensagem de erro é exibida
```

**Passos:**
1. Parar o servidor backend
2. Tentar fazer requisição no frontend
3. Observar tratamento de erro

**Verificações:**
- [ ] Toast de erro aparece
- [ ] Mensagem é legível
- [ ] User pode tentar novamente

**Resultado esperado:** ✅ Erros tratados com elegância

---

#### Teste 5.4: Feedback Visual de Ações
```gherkin
Given: Usuário interage com formulário
When: Clica em botão de envio
Then: Botão mostra loading
And: Toast confirma sucesso ou erro
```

**Passos:**
1. Preencher um formulário qualquer
2. Clicar enviar
3. Observar feedback visual

**Verificações:**
- [ ] Botão desabilita durante envio
- [ ] Spinner aparece no botão
- [ ] Toast de sucesso/erro aparece
- [ ] Feedback é imediato

**Resultado esperado:** ✅ Feedback visual claro

---

### 6️⃣ TESTES DE PERFORMANCE

#### Teste 6.1: Tempo de Carregamento
```bash
# Abrir DevTools > Performance
# Fazer reload da página /certifications
# Verificar:
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
```

**Resultado esperado:** ✅ Métricas Core Web Vitals aceitas

---

#### Teste 6.2: Bundle Size
```bash
# Terminal frontend
npm run build
# Verificar tamanho do build

# Esperado:
- main.js: < 500KB
- vendors.js: < 400KB
```

**Resultado esperado:** ✅ Bundle dentro dos limites

---

### 7️⃣ TESTES DE INTEGRAÇÃO API

#### Teste 7.1: Requisição com Token JWT
```bash
# Terminal (Usar curl ou Postman)
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8000/api/certifications/programs/

# Esperado:
# HTTP 200
# { "results": [...], "count": N, "next": null }
```

**Resultado esperado:** ✅ Token aceito, dados retornados

---

#### Teste 7.2: Requisição sem Token
```bash
curl http://localhost:8000/api/certifications/programs/

# Esperado:
# HTTP 401 Unauthorized
```

**Resultado esperado:** ✅ Endpoint protegido

---

#### Teste 7.3: Paginação
```bash
curl -H "Authorization: Bearer {TOKEN}" \
  "http://localhost:8000/api/certifications/programs/?page=1&page_size=10"

# Esperado:
# Retorna: count, next, previous, results
```

**Resultado esperado:** ✅ Paginação funciona

---

## 📊 Matriz de Testes

| # | Módulo | Funcionalidade | Status | Observações |
|---|--------|---|---|---|
| 1.1 | Auth | Login Válido | ⬜ | |
| 1.2 | Auth | Rota Protegida | ⬜ | |
| 2.1 | Cert | Listar Programas | ⬜ | |
| 2.2 | Cert | Detalhes Programa | ⬜ | |
| 2.3 | Cert | Inscrição | ⬜ | |
| 2.4 | Cert | Minhas Inscrições | ⬜ | |
| 3.1 | MKT | Listar Serviços | ⬜ | |
| 3.2 | MKT | Detalhes Serviço | ⬜ | |
| 3.3 | MKT | Solicitar Serviço | ⬜ | |
| 3.4 | MKT | Minhas Solicitações | ⬜ | |
| 4.1 | KIX | Listar Grupos | ⬜ | |
| 4.2 | KIX | Detalhes Grupo | ⬜ | |
| 4.3 | KIX | Solicitar Participação | ⬜ | |
| 4.4 | KIX | Meus Grupos | ⬜ | |
| 5.1 | UX | Responsividade | ⬜ | |
| 5.2 | UX | Loading States | ⬜ | |
| 5.3 | UX | Tratamento Erros | ⬜ | |
| 5.4 | UX | Feedback Visual | ⬜ | |
| 6.1 | Perf | Carregamento | ⬜ | |
| 6.2 | Perf | Bundle Size | ⬜ | |
| 7.1 | API | JWT Token | ⬜ | |
| 7.2 | API | Sem Token | ⬜ | |
| 7.3 | API | Paginação | ⬜ | |

---

## ✅ Conclusão de Testes

Quando todos os testes acima forem concluídos com sucesso (✅), a integração backend-frontend está **100% validada e pronta para produção**.

**Total de Testes:** 23  
**Testes Obrigatórios:** Todos os testes marcados

---

## 📞 Suporte

Se encontrar problemas durante os testes:

1. **Verificar console do browser** (DevTools > Console)
2. **Verificar logs do backend** (Terminal Django)
3. **Verificar Network tab** (DevTools > Network)
4. **Consultar documentação** de cada módulo em `/docs/`
5. **Checar TypeScript errors** (Terminal frontend)

**Última atualização:** 9 de dezembro de 2025
