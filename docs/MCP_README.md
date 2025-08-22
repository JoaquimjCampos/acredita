# MCP (Model Context Protocol) - Integração Backend/Frontend

## O que é MCP?
O MCP é um protocolo de contexto que permite que backend e frontend troquem informações contextuais (usuário, sessão, device, preferências, etc) em cada requisição, tornando o sistema adaptativo e rastreável.

---

## Como funciona no Backend (Django)
- O middleware MCP processa o header `X-MCP-Context` de cada requisição.
- O contexto é injetado em `request.mcp_context` e pode ser usado em qualquer view/viewset.
- O backend pode responder com contexto adicional no header `X-MCP-Meta`.

### Exemplo de uso em uma view Django:
```python
class SomeAPIView(APIView):
    def get(self, request, *args, **kwargs):
        mcp_context = getattr(request, 'mcp_context', {})
        # Use o contexto para lógica adaptativa
        return Response({"msg": "ok"})
```

---

## Como funciona no Frontend (React)
- Use o client MCP (`src/mcpClient.ts`) para todas as chamadas à API.
- Sempre envie contexto relevante no header `X-MCP-Context`.
- Interprete o header `X-MCP-Meta` da resposta para adaptar a UI.

### Exemplo de uso no React:
```typescript
import { mcpFetch } from './mcpClient';
const { data, mcpMeta } = await mcpFetch('/api/games/quiz/questions/', {}, { user: '123', session: 'abc' });
```

---

## Boas práticas
- Padronize o formato do contexto (JSON serializável).
- Documente os campos obrigatórios e opcionais do contexto.
- Use autenticação JWT junto com MCP para segurança.
- Teste endpoints e client MCP com diferentes contextos.

---

## Expansão
- Para microserviços/IA, use FastAPI e siga o mesmo padrão de headers/contexto.
- O frontend pode consumir múltiplos backends, sempre usando MCP para contexto.

---

## Resumo
- Backend: Middleware MCP processa contexto e responde com metadados.
- Frontend: Client MCP envia contexto e adapta UI conforme resposta.
- Toda a stack fala o mesmo "idioma contextual".

---

Dúvidas ou exemplos práticos? Consulte este README ou peça exemplos de uso para endpoints específicos.
