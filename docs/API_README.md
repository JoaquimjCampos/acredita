# Acredita API Documentation

## Main Endpoints

### Seasons
- `GET /api/seasons/` — List seasons
- `POST /api/seasons/` — Create season
- `GET /api/seasons/{id}/` — Retrieve season
- `PUT/PATCH /api/seasons/{id}/` — Update season
- `DELETE /api/seasons/{id}/` — Delete season

### Episodes
- `GET /api/episodes/` — List episodes (supports filtering, ordering, search)
  - Filter by: `season`, `status`, `voting_enabled`, `air_date`, `air_date__gte`, `air_date__lte`
  - Order by: `air_date`, `episode_number`, `view_count`, `like_count`
  - Search: `title`, `description`
- `POST /api/episodes/` — Create episode (bulk supported)
- `POST /api/episodes/bulk_soft_delete/` — Bulk soft delete (admin only)
- `POST /api/episodes/bulk_restore/` — Bulk restore (admin only)
- `GET /api/episodes/{id}/` — Retrieve episode
- `PUT/PATCH /api/episodes/{id}/` — Update episode
- `DELETE /api/episodes/{id}/` — Soft delete episode

### Voting
- `POST /api/seasons/global-vote/` — Vote for episode participant

### Other Modules
- Standard CRUD endpoints for participants, games, ads, blog, content, donations, store

## Features
- **Soft delete** for episodes (`is_deleted` flag)
- **Bulk operations** for episodes
- **Caching** for episode list (5 min)
- **Audit logging** for episode changes
- **Async tasks** for notifications (Celery)
- **OpenAPI/Swagger docs** at `/api/docs/`

## Frontend Integration Tips
- Use JWT authentication for all protected endpoints
- Use filtering, ordering, and search for episode lists
- Use bulk endpoints for admin operations
- Use `/api/docs/` for live API reference
- Handle `is_deleted` flag in episode lists
- Use `season` field in episode payloads

## Redundancy Review
- No duplicate router registrations
- No duplicate model fields
- No unnecessary code in viewsets or serializers
- All enhancements are additive and do not remove valuable code

## Next Steps
- Sync frontend API calls with updated endpoints and features
- Use OpenAPI docs for frontend development
- Monitor audit logs for admin actions
- Implement Celery tasks for notifications if needed
# Documentação de Integração Backend (Django REST + MCP)

## Estrutura Modular
- Cada domínio (ex: participantes, votação, temporadas) é um app Django independente.
- Endpoints RESTful expostos via Django REST Framework (DRF) e roteadores automáticos.
- Middleware MCP ativo para propagação de contexto entre frontend e backend.

## Padrão de Endpoints
- `/api/participants/` — Lista e detalhes de participantes.
- `/api/participants/dashboard/` — Estatísticas do dashboard.
- `/api/participants/activity/` — Atividades recentes.
- Todos endpoints aceitam e retornam contexto MCP via headers.

## Autenticação
- JWT obrigatório para endpoints protegidos.
- Contexto de usuário propagado via header MCP.

## Serialização
- Use serializers DRF para garantir dados limpos e tipados para o frontend.
- Sempre documente os campos esperados e retornados.

## Exemplo de Resposta
```json
{
  "results": [
    { "id": 1, "nome": "Maria", "idade": 25, "provincia": "Luanda" }
  ],
  "count": 1
}
```

## Boas Práticas
- Separe lógica de negócio em services ou métodos de modelo.
- Documente endpoints e exemplos de payloads.
- Use testes automatizados para garantir estabilidade.

## Integração com Frontend
- O frontend consome endpoints via `mcpFetch`, sempre enviando contexto MCP.
- Erros devem ser retornados em formato consistente para fácil exibição no frontend.

---

Para detalhes sobre novos módulos, siga o padrão de modularização e documentação acima. Atualize este arquivo conforme novas APIs forem implementadas.
