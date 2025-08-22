# Exemplo de Uso dos Novos Campos (instructions, assets) no Modelo Game

## 1. Cadastro Manual via Django Admin
- Ao criar ou editar um jogo no admin, preencha:
  - **Instructions:** Texto explicativo para o usuário (ex: "Responda todas as perguntas corretamente para ganhar pontos.")
  - **Assets:** Lista JSON de URLs ou nomes de arquivos (ex: `["/static/games/quiz1.png", "/static/games/sound1.mp3"]`)

## 2. Exemplo de Criação via Shell
```python
from backend.games.models import Game

Game.objects.create(
    title="Quiz de Empreendedorismo",
    description="Teste seus conhecimentos sobre negócios.",
    type="quiz",
    instructions="Responda todas as perguntas. Cada acerto vale 10 pontos.",
    assets=["/static/games/quiz1.png", "/static/games/quiz1.mp3"]
)

Game.objects.create(
    title="Simulador Financeiro",
    description="Gerencie um negócio virtual.",
    type="simulator",
    instructions="Ajuste preços e estoque para maximizar o lucro.",
    assets=["/static/games/simulator_bg.png"]
)
```

## 3. Migração de Dados Existentes
Se já existem jogos cadastrados, rode uma migration para adicionar os campos:

### a) Criar migration
```
python manage.py makemigrations games
python manage.py migrate games
```

### b) Atualizar registros existentes (opcional)
```python
from backend.games.models import Game
for game in Game.objects.all():
    if not game.instructions:
        game.instructions = "Siga as instruções na tela para jogar."
    if not game.assets:
        game.assets = []
    game.save()
```

## 4. Consumo no Frontend
No frontend, basta acessar os campos `instructions` e `assets` do objeto retornado pelo endpoint para exibir instruções e recursos visuais/sonoros ao usuário.

---
Última atualização: 12/08/2025
