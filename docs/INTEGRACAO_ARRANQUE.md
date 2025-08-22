# Guia de Arranque para Integração Backend/Frontend

## 1. Estrutura do Projeto
- **Backend:** Django REST Framework + FastAPI (microserviços), endpoints RESTful, autenticação JWT, MCP Middleware.
- **Frontend:** React com UI/UX completo, React Router, Context API, client MCP para consumo de APIs.

## 2. Fluxo de Integração
- Todas as páginas React consomem dados do backend via client MCP (`mcpFetch`).
- O backend responde com dados e contexto, permitindo UI adaptativa.
- Autenticação JWT protege rotas e dados sensíveis.

## 3. Passos para Expansão
1. **Mapeie cada página React aos endpoints do backend:**
   - Exemplo: DashboardPage → `/api/participants/dashboard/`, `/api/voting/votes/`, etc.
2. **Substitua dados mockados por chamadas reais:**
   - Use sempre o client MCP para garantir contexto e metadados.
3. **Garanta loading, erro e feedback visual:**
   - Use spinners, mensagens de erro e estados vazios amigáveis.
4. **Proteja rotas sensíveis:**
   - Use Context API e JWT para autenticação e autorização.
5. **Documente endpoints e fluxo de dados:**
   - Mantenha um README com endpoints usados por cada página.

## 4. Exemplo de Integração (DashboardPage)
```tsx
import { mcpFetch } from '../mcpClient';
...
const { data } = await mcpFetch('/api/participants/dashboard/');
setStats(data);
```

## 5. Boas Práticas
- Componentização e reutilização de UI.
- Separação de lógica de dados e apresentação.
- Tratamento de erros e loading em todas as páginas.
- Consistência visual e acessibilidade.
- Testes de integração frontend/backend.

## 6. Como rodar o projeto
- **Backend:**
  ```bash
  python manage.py runserver
  # ou para FastAPI
  uvicorn backend.fastapi_app.main:app --reload --port 8001
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm install
  npm start
  ```

---

Dúvidas ou próximos passos? Consulte este guia ou peça exemplos práticos de integração para qualquer página ou funcionalidade!
