# Exemplos de Integração com Outros Frameworks e Lógica de Jogo

## 1. Integração com Vue.js

```js
<template>
  <div v-if="game">
    <h1>{{ game.title }}</h1>
    <p>{{ game.instructions }}</p>
    <img v-for="(asset, idx) in game.assets" :key="idx" :src="asset" :alt="`Asset ${idx}`" style="max-width:200px" />
    <!-- Lógica do jogo aqui -->
  </div>
  <div v-else>Carregando...</div>
</template>

<script>
export default {
  data() {
    return { game: null };
  },
  mounted() {
    fetch(`/api/games/${this.$route.params.id}/`)
      .then(res => res.json())
      .then(data => { this.game = data; });
  }
};
</script>
```

## 2. Integração com Angular

```typescript
// game.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit {
  game: any;
  constructor(private route: ActivatedRoute, private http: HttpClient) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`/api/games/${id}/`).subscribe(data => this.game = data);
  }
}
```

```html
<!-- game.component.html -->
<div *ngIf="game">
  <h1>{{ game.title }}</h1>
  <p>{{ game.instructions }}</p>
  <img *ngFor="let asset of game.assets; let i = index" [src]="asset" [alt]="'Asset ' + i" style="max-width:200px" />
  <!-- Lógica do jogo aqui -->
</div>
<div *ngIf="!game">Carregando...</div>
```

## 3. Lógica de Jogo: Exemplo de Drag & Drop (React)

```tsx
import React, { useState } from 'react';
// Exemplo simples sem biblioteca externa
const items = ['Item 1', 'Item 2', 'Item 3'];
const targets = ['Alvo 1', 'Alvo 2', 'Alvo 3'];

const DragDropGame: React.FC = () => {
  const [dropped, setDropped] = useState<{[key: string]: string}>({});
  const onDrop = (item: string, target: string) => {
    setDropped({ ...dropped, [item]: target });
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 20 }}>
        {items.map(item => (
          <div key={item} draggable onDragStart={e => e.dataTransfer.setData('item', item)} style={{ border: '1px solid #ccc', padding: 10 }}>{item}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        {targets.map(target => (
          <div key={target} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e.dataTransfer.getData('item'), target)} style={{ border: '2px dashed #888', padding: 20, minWidth: 80 }}>
            {target}
            <div style={{ color: 'green' }}>{Object.entries(dropped).filter(([item, t]) => t === target).map(([item]) => item).join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DragDropGame;
```

## 4. Lógica de Jogo: Exemplo de Quiz (Vue.js)

```js
<template>
  <div v-if="question">
    <h2>{{ question.text }}</h2>
    <button v-for="(opt, idx) in question.options" :key="idx" @click="answer(idx)">{{ opt }}</button>
  </div>
  <div v-else>Quiz finalizado!</div>
</template>

<script>
export default {
  data() {
    return {
      questions: [],
      current: 0
    };
  },
  computed: {
    question() { return this.questions[this.current]; }
  },
  methods: {
    answer(idx) {
      // lógica de resposta
      this.current++;
    }
  },
  mounted() {
    fetch('/api/games/quiz/1/questions/').then(res => res.json()).then(data => { this.questions = data; });
  }
};
</script>
```

---
Esses exemplos mostram como consumir os campos personalizados e implementar lógica de jogos em diferentes frameworks frontend.

Última atualização: 12/08/2025
