# Acesso a Quizzes - Boas Práticas

## Visão Geral

O sistema de acesso a quizzes do Acredita foi projetado com as seguintes melhores práticas:

### 1. **Democratização do Acesso**
- Quizzes são **públicos por padrão** sem exigir autenticação
- Permite engajamento máximo da comunidade
- Reduz barreiras de entrada para novos usuários
- Relevante para o propósito educacional do Acredita

### 2. **Permissões Granulares**

#### Acesso Público (Anônimo)
- ✅ Leitura de quizzes ativos e públicos
- ✅ Visualização de questões
- ✅ Visualização de leaderboard
- ✅ Submissão de respostas (se `allow_anonymous_submission=True`)
- ❌ Criação/edição/deleção de quizzes

#### Acesso Autenticado
- ✅ Todas as permissões públicas
- ✅ Rastreamento automático de progresso
- ✅ Participação em competições com ranking
- ✅ Acesso a histórico de tentativas
- ⚠️ Criação/edição/deleção apenas se author ou admin

#### Acesso Administrativo
- ✅ Gerenciamento completo de quizzes
- ✅ Visualização de logs de acesso
- ✅ Análise de engajamento
- ✅ Moderação de conteúdo

### 3. **Rastreamento e Auditoria**

Cada acesso público é registrado em `QuizAccessLog` com:
- IP address
- User agent (browser, device)
- Referrer
- Tipo de acesso
- Timestamp

Útil para:
- Análise de engajamento
- Detecção de abuso/spam
- Identificação de bots
- Relatórios de uso público

### 4. **Segurança**

#### Proteção contra Abuso
- Rate limiting recomendado em nível de proxy/CDN
- Detecção automática de bots
- Bloqueio de IP em casos de abuso repetido

#### Proteção de Dados
- Questões de quizzes privados nunca são expostas
- Respostas corretas ocultas para usuários anônimos (em construção)
- Validação de submissão de respostas

#### Integridade
- Campos editáveis apenas para criadores/admins
- Histórico de alterações (via audit log)
- Soft deletes (marcação como inativo)

### 5. **Performance**

#### Cache
- Quizzes públicos podem ser cacheados (Redis/Memcached)
- Tempo de vida recomendado: 1 hora
- Invalidação: quando quiz é modificado

#### Paginação
- Limite padrão: 20 quizzes por página
- Implementada automáticamente pelo DRF

#### Índices de Banco de Dados
```python
# Quiz table indexes
- (season_number, is_active)
- (is_public, is_active)

# QuizAccessLog table indexes
- (quiz_id, -created_at)
- (user_id, -created_at)
- (ip_address, -created_at)
```

### 6. **Endpoints Disponíveis**

#### Públicos (sem autenticação)
```
GET  /api/games/quiz/quizzes/                    # Listar quizzes públicos
GET  /api/games/quiz/quizzes/{id}/               # Detalhe do quiz
GET  /api/games/quiz/quizzes/{id}/leaderboard/   # Ranking público
GET  /api/games/quiz/quizzes/{id}/analytics/     # Estatísticas públicas
GET  /api/games/quiz/questions/?quiz={id}        # Questões do quiz
GET  /api/games/quiz/answers/?question={id}      # Respostas da questão
```

#### Autenticados
```
POST   /api/games/quiz/quizzes/                   # Criar quiz (admin only)
PUT    /api/games/quiz/quizzes/{id}/              # Editar quiz (author/admin)
DELETE /api/games/quiz/quizzes/{id}/              # Deletar quiz (author/admin)
POST   /api/games/quiz/quizzes/{id}/submit-answers/ # Submeter respostas
```

### 7. **Configuração de Quiz**

Ao criar um quiz, considere:

```python
{
    "title": "Quiz de Empreendedorismo",
    "description": "Teste seus conhecimentos sobre empreendedorismo",
    "is_public": True,           # Permitir acesso público
    "is_active": True,           # Quiz disponível
    "allow_anonymous_submission": True,  # Permitir submissão sem login
    "start_date": "2025-12-14T00:00:00Z",
    "end_date": "2025-12-31T23:59:59Z",
    "season_number": 1,
    "category": "Empreendedorismo",
    "difficulty": "Intermediário",
    "time_limit": 600  # 10 minutos
}
```

### 8. **Métricas Importantes**

Monitorar via QuizAccessLog:
- `public_access_count`: Total de acessos públicos
- `authenticated_access_count`: Total de acessos autenticados
- Taxa de conclusão por quiz
- IPs únicos por quiz
- Horários de pico de acesso
- Detecção de padrões de bot

### 9. **Conformidade LGPD**

- ✅ Acessos públicos não armazenam dados pessoais
- ✅ IPs são anonimizados após 90 dias (recomendado)
- ✅ Consentimento não necessário para acesso público
- ✅ Dados de usuários autenticados possuem política clara
- ✅ Direito de exclusão respeitado

### 10. **Exemplo de Integração Frontend**

```typescript
// Acesso público - sem token necessário
const getPublicQuiz = async (quizId: number) => {
  const response = await fetch(`/api/games/quiz/quizzes/${quizId}/`);
  return response.json();
};

// Submissão anônima
const submitAnonymousAnswers = async (quizId: number, answers: any[]) => {
  const response = await fetch(`/api/games/quiz/quizzes/${quizId}/submit-answers/`, {
    method: 'POST',
    body: JSON.stringify({ answers })
  });
  return response.json();
};

// Submissão autenticada (com ranking)
const submitAuthenticatedAnswers = async (quizId: number, answers: any[]) => {
  const response = await fetch(`/api/games/quiz/quizzes/${quizId}/submit-answers/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });
  return response.json();
};
```

## Resumo

O sistema foi projetado para:
1. **Maximizar acesso** (democratização educacional)
2. **Manter segurança** (dados protegidos)
3. **Garantir integridade** (rastreamento completo)
4. **Respeitar privacidade** (LGPD compliant)
5. **Facilitar análise** (métricas detalhadas)

Todas as operações críticas são auditadas e o acesso público é transparente.
