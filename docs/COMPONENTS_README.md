# Componentes Originais Restaurados

Este projeto utiliza uma biblioteca de componentes React restaurada do código original, garantindo consistência visual e funcionalidade avançada em toda a aplicação.

## Componentes Disponíveis

- **Card**: Container flexível com suporte a título, subtítulo, rodapé e conteúdo customizado.
- **Button**: Botão estilizado com variantes (`primary`, `secondary`, `outline`, `ghost`, `danger`) e tamanhos (`sm`, `md`, `lg`).
- **Input**: Campo de entrada com label, validação e estados de erro.
- **TextArea**: Campo de texto multilinha com label e validação.
- **Select**: Dropdown customizado com label, placeholder e validação.
- **LoadingSpinner**: Indicador de carregamento animado, com tamanhos e texto opcional.
- **Badge**: Selo de status com variantes de cor e tamanhos.
- **Modal**: Modal acessível e responsivo, com título, tamanhos e callback de fechamento.

## Convenções de Uso

- Todos os componentes aceitam `className` para customização adicional.
- Utilize o utilitário `cn` (`utils/index.original.ts`) para composição de classes Tailwind.
- Prefira sempre importar componentes de `components/common` para garantir consistência.

## Exemplo de Uso

```tsx
import { Card, Button, Input, Modal } from '../components/common';

<Card title="Título" subtitle="Subtítulo" footer={<Button>OK</Button>}>
  Conteúdo do card
</Card>

<Button variant="primary" size="md">Salvar</Button>
<Input label="Nome" placeholder="Digite seu nome" />
<Modal isOpen={modalOpen} onClose={closeModal} title="Detalhes">Conteúdo</Modal>
```

## Integração Backend/Frontend

- Todas as chamadas de API devem ser feitas via `mcpFetch` para garantir contexto MCP e headers corretos.
- O backend deve expor endpoints RESTful, preferencialmente via Django REST Framework, e retornar dados já prontos para consumo pelos componentes.
- Utilize autenticação JWT e propague contexto de usuário via MCP.

## Boas Práticas

- Centralize lógica de UI em componentes reutilizáveis.
- Documente novos componentes e mantenha exemplos de uso.
- Prefira tipagem explícita para todas as props.
- Mantenha a documentação atualizada conforme novos módulos forem implementados.

---

Para dúvidas ou contribuições, consulte também a documentação dos endpoints backend e o guia de integração MCP.
