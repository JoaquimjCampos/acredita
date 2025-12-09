# 🚀 Ativar Marketplace em Staging

## Status Atual (09/12/2025)

- ✅ Módulo marketplace implementado em DEV
- ✅ 10 categorias populadas
- ✅ CRUD listings protegido por feature flag
- ✅ Filtros, busca e ordenação funcionais
- ⏳ Pronto para staging

## Como Ativar em Staging

### Opção 1: Variável de Ambiente (Recomendado)

```bash
# Em staging/.env ou docker-compose staging
FEATURE_MARKETPLACE=True
DEBUG=False  # IMPORTANTE: produção segura
```

### Opção 2: settings.py Override

```python
# backend/acredita_backend/settings.py
ACTIVE_FEATURES = {
    'certifications': True,  # já em prod
    'marketplace': True,  # ATIVAR em staging
    'kixikila': False,
    'advanced_payments': False,
}
```

## Endpoints Disponíveis em Staging

### Read-Only (Público)
```
GET /api/v2/marketplace/status/           # Health check
GET /api/v2/marketplace/categories/       # Listar categorias
GET /api/v2/marketplace/providers/        # Listar prestadores
GET /api/v2/marketplace/listings/         # Listar serviços
```

### Filtrados/Paginados
```
GET /api/v2/marketplace/listings/?category=1&available=true&search=moto&ordering=-created_at
```

### Write (Autenticado + Service Provider)
```
POST /api/v2/marketplace/listings/        # Criar serviço
PUT /api/v2/marketplace/listings/{id}/    # Atualizar serviço
DELETE /api/v2/marketplace/listings/{id}/ # Deletar serviço
POST /api/v2/marketplace/listings/{id}/mark_featured/ # Admin only
```

## Testing em Staging

### 1. Verificar Flag
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://staging.acredita.ao/api/v2/marketplace/status/
```

### 2. Listar Categorias
```bash
curl https://staging.acredita.ao/api/v2/marketplace/categories/
```

### 3. Buscar com Filtro
```bash
curl "https://staging.acredita.ao/api/v2/marketplace/listings/?category=1&search=motor&ordering=-created_at"
```

### 4. Criar Listing (requer auth + provider profile)
```bash
TOKEN="seu_token_jwt"
curl -X POST https://staging.acredita.ao/api/v2/marketplace/listings/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Motonista experiente",
    "description": "Transporto encomendas e passageiros...",
    "category_id": 1,
    "price_type": "negotiable",
    "base_price": 50000,
    "available": true,
    "delivery_time": "24h"
  }'
```

## Rollback Rápido em Produção

Se algo falhar, desativar é imediato:

```bash
# Via flag: FEATURE_MARKETPLACE=False
# Via settings: ACTIVE_FEATURES['marketplace'] = False
# Server restart automático com zero downtime (via feature flag check)
```

## KPIs a Monitorar em Staging

- ✅ Latência p95 < 200ms
- ✅ Erro rate < 0.1%
- ✅ Paginação: 20 items por página
- ✅ Filtros: category, available, price_type
- ✅ Search: title, description, tags
- ✅ Ordering: created_at, views, featured, base_price

## Próximas Fases (Weeks 5-6 Jan 2026)

1. **Transações de Serviços**: POST orders com escrow
2. **Chat em Tempo Real**: WebSocket para comunicação
3. **Pagamentos**: Integração Multicaixa + Unitel Money
4. **Faturação**: Geração automática de recibos
5. **Seguros**: Proteção para transações > 500k AOA

---

**Pronto para staging?** ✅ SIM

**Responsável**: [Seu Team Lead]  
**Data**: 09/12/2025  
**Próxima Review**: 16/12/2025 (antes de prod)
