# Documentação e Plano de Implementação dos Jogos Educativos

## 1. Estrutura do Projeto

- Separar o backend em uma pasta dedicada (`backend/`), seguindo o padrão já usado para o frontend.
- Organizar os apps Django dentro de `backend/`, facilitando manutenção e escalabilidade.

## 2. Tipos de Jogos Prioritários

1. **Quiz de Conhecimento**
   - MVP: Perguntas de múltipla escolha sobre empreendedorismo, finanças e cultura local.
   - Foco em ranking, fases eliminatórias e integração com sistema de doações.
2. **Palavras Cruzadas/Busca de Palavras**
   - MVP: Montagem de palavras relacionadas a negócios e cultura angolana.
3. **Simulador de Negócios Simplificado**
   - MVP: Decisões básicas de gestão de um negócio virtual.
4. **Jogos de Associação**
   - MVP: Relacionar termos, imagens e definições.

## 3. Plano de Implementação

### Fase 1: Organização e Preparação
- Criar pasta `backend/` e mover os apps Django para dentro dela.
- Atualizar configurações de paths e imports.
- Garantir que o projeto rode normalmente após a migração.

### Fase 2: MVP do Quiz
- Criar app Django `games` em `backend/`.
- Modelar entidades: Pergunta, Resposta, Partida, Pontuação.
- Criar APIs REST para jogos e ranking.
- Desenvolver componentes frontend para quiz.
- Integrar sistema de doações e ads.

### Fase 3: Novos Jogos e Gamificação
- Implementar palavras cruzadas, simulador e associação.
- Adicionar badges, conquistas e ranking público.
- Melhorar UI/UX com feedback visual e sonoro.

### Fase 4: Testes e Iteração
- Testar com usuários reais.
- Ajustar jogos e interface conforme feedback.

## 4. Melhores Práticas
- Estrutura modular: cada app Django em sua pasta.
- Separação clara entre backend e frontend.
- Uso de APIs RESTful.
- Documentação clara e atualizada.
- Testes automatizados.
- UI/UX acessível e responsiva.

---

## Resumo
- Prioridade: Quiz educativo como MVP.
- Estrutura: Backend organizado em `backend/`, frontend já separado.
- Práticas: Modularidade, documentação, APIs, testes e foco em experiência do usuário.

---

> Próximos passos: migrar apps Django para `backend/` e iniciar desenvolvimento do app `games`.
