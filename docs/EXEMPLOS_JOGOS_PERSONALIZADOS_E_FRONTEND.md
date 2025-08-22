# Exemplos para Jogos Personalizados e Integração Frontend

## 1. Jogos Personalizados

### a) Jogo de Decisão (Decision Game)
- **instructions:** "Tome decisões estratégicas em cada etapa. Suas escolhas afetam o resultado final."
- **assets:** ["/static/games/decision_bg.png", "/static/games/decision_icon.svg"]

#### Criação via Shell
```python
Game.objects.create(
    title="Jogo de Decisão",
    description="Simule decisões empresariais e veja os resultados.",
    type="decision",
    instructions="Tome decisões estratégicas em cada etapa.",
    assets=["/static/games/decision_bg.png"]
)
```

### b) Jogo de Arrastar e Soltar (Drag & Drop Game)
- **instructions:** "Arraste os itens para as áreas corretas para completar o desafio."
- **assets:** ["/static/games/dragdrop_items.png", "/static/games/dragdrop_bg.jpg"]

#### Criação via Shell
```python
Game.objects.create(
    title="Arraste e Solte",
    description="Arraste os itens para os locais corretos.",
    type="dragdrop",
    instructions="Arraste os itens para as áreas corretas.",
    assets=["/static/games/dragdrop_items.png", "/static/games/dragdrop_bg.jpg"]
)
```

## 2. Integração Frontend

### a) Consumo dos Campos no Frontend (React/TypeScript)

```tsx
// Exemplo de uso em um componente de jogo personalizado
import React, { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';

interface Game {
  id: number;
  title: string;
  description: string;
  type: string;
  instructions: string;
  assets: string[];
}

const CustomGamePage: React.FC<{ gameId: string }> = ({ gameId }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mcpFetch(`/api/games/${gameId}/`).then(({ data }) => {
      setGame(data);
      setLoading(false);
    });
  }, [gameId]);

  if (loading || !game) return <div>Carregando...</div>;

  return (
    <div>
      <h1>{game.title}</h1>
      <p>{game.instructions}</p>
      {game.assets && game.assets.map((asset, idx) => (
        <img key={idx} src={asset} alt={`Asset ${idx}`} style={{ maxWidth: 200 }} />
      ))}
      {/* Lógica do jogo aqui */}
    </div>
  );
};

export default CustomGamePage;
```

### b) Dicas para Integração
- Utilize o campo `instructions` para exibir orientações dinâmicas ao usuário.
- Use o array `assets` para carregar imagens, áudios ou outros recursos visuais/sonoros.
- Adapte a lógica do componente conforme o tipo de jogo (`type`).
- Para jogos interativos (drag & drop, quizzes, etc.), utilize bibliotecas React adequadas (ex: `react-dnd`, `react-beautiful-dnd`).

---
Esses exemplos facilitam a criação de novos jogos e a integração dinâmica dos campos personalizados no frontend React.

Última atualização: 12/08/2025
