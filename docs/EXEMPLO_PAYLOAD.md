# Exemplo de Payload para Publicidade (Ad)

## POST /api/ads/ads/
```json
{
  "title": "Participe do Concurso!",
  "image_url": "https://cdn.exemplo.com/banner1.png",
  "link": "https://acredita.ao/concurso",
  "page": "simuladores", // "all", "associacao", "jogos", "dashboard", "custom"
  "active": true
}
```

## Resposta (GET /api/ads/ads/active/?page=simuladores)
```json
[
  {
    "id": 1,
    "title": "Participe do Concurso!",
    "image_url": "https://cdn.exemplo.com/banner1.png",
    "link": "https://acredita.ao/concurso",
    "page": "simuladores",
    "active": true
  }
]
```
