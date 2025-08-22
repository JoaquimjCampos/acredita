# Integração Backend/Frontend - Projeto Acredita

## O que já está pronto

### Backend (Django + FastAPI)
- APIs REST completas para: usuários, participantes, seasons, votação, doações, loja, blog, conteúdo, games/quiz.
- Middleware MCP para contexto adaptativo (headers X-MCP-Context).
- Autenticação JWT pronta para uso.
- FastAPI disponível para endpoints de alta performance/IA.

### Frontend (React)
- Estrutura de páginas para Home, Dashboard, Login, Participantes, Ranking, Seasons, Voting, etc.
- Client MCP para consumir APIs do backend com contexto.
- Build e configuração corrigidos (Tailwind, TS, etc).

### Sincronia
- Frontend pode consumir qualquer endpoint do backend usando o client MCP.
- Backend responde com dados/contexto, permitindo UI adaptativa.
- Pronto para expansão: basta implementar o conteúdo real das páginas e consumir as APIs já disponíveis.

---

## Como expandir (próximos passos)
1. Implemente o conteúdo real das páginas em `src/pages/` (ex: HomePage, DashboardPage, LoginPage, etc).
2. Configure o React Router em `App.tsx` para navegação entre páginas.
3. Consuma as APIs do backend usando o client MCP.
4. Adicione componentes visuais e lógica de negócio conforme necessário.

---

## Exemplo de chamada MCP no frontend
```typescript
import { mcpFetch } from './mcpClient';
const { data, mcpMeta } = await mcpFetch('/api/participants/', {}, { user: '123', session: 'abc' });
```

---

## Exemplo de endpoint MCP no backend
```python
class SomeAPIView(APIView):
    def get(self, request, *args, **kwargs):
        mcp_context = getattr(request, 'mcp_context', {})
        return Response({"msg": "ok", "context": mcp_context})
```

---

## Recomendações
- Implemente cada página consumindo os dados reais do backend.
- Use autenticação JWT para proteger rotas privadas.
- Expanda o client MCP conforme novas necessidades de contexto.
- Use o microserviço FastAPI para IA ou tarefas assíncronas.

---

Dúvidas ou próximos passos? Peça exemplos práticos de integração para qualquer página ou funcionalidade!
