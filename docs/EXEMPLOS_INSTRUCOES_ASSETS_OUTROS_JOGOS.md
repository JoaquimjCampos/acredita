# Exemplos de Uso dos Campos `instructions` e `assets` em Outros Modelos/Jogos

## 1. Quiz (Quiz Game)
- **instructions:** "Escolha a alternativa correta para cada pergunta. Cada acerto vale 10 pontos."
- **assets:** ["/static/games/quiz_bg.png", "/static/games/quiz_sound.mp3"]

## 2. Simulador Financeiro (Simulator Game)
- **instructions:** "Gerencie sua empresa virtual ajustando preços, estoque e promoções. O objetivo é maximizar o lucro em 5 rodadas."
- **assets:** ["/static/games/simulator_bg.png", "/static/games/simulator_chart.svg"]

## 3. Associação de Palavras (Association Game)
- **instructions:** "Associe corretamente os pares de palavras relacionadas. Arraste e solte para formar as conexões."
- **assets:** ["/static/games/association_bg.jpg", "/static/games/association_hint.png"]

## 4. Palavras Cruzadas (Crossword Game)
- **instructions:** "Preencha o quadro com as palavras corretas usando as dicas fornecidas. Clique em uma célula para digitar."
- **assets:** ["/static/games/crossword_grid.png", "/static/games/crossword_music.mp3"]

## 5. Jogo de Memória (Memory Game)
- **instructions:** "Encontre todos os pares de cartas iguais no menor tempo possível. Clique para virar as cartas."
- **assets:** ["/static/games/memory_cards.png", "/static/games/memory_flip.mp3"]

## 6. Exemplo de Criação via Shell para Association Game
```python
from backend.games.models import Game

Game.objects.create(
    title="Associação de Palavras",
    description="Associe pares de palavras relacionadas.",
    type="association",
    instructions="Associe corretamente os pares de palavras.",
    assets=["/static/games/association_bg.jpg", "/static/games/association_hint.png"]
)
```

## 7. Exemplo de Criação via Shell para Crossword Game
```python
Game.objects.create(
    title="Palavras Cruzadas",
    description="Complete o quadro com as palavras corretas.",
    type="crossword",
    instructions="Preencha o quadro usando as dicas.",
    assets=["/static/games/crossword_grid.png"]
)
```

---
Esses exemplos podem ser adaptados para qualquer novo tipo de jogo, bastando preencher os campos `instructions` e `assets` conforme a necessidade pedagógica e visual de cada atividade.

Última atualização: 12/08/2025
