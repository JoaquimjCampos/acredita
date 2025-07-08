# Sistema Acredita em Ti, Acredita em Angola

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Contexto do Projecto

Este é um projecto Django + React para o programa social "Acredita em Ti, Acredita em Angola" com integração completa do **MCP (Model Context Protocol)** como elemento central da arquitectura.

## Características Técnicas

### Backend
- **Framework**: Django 5.0.6 com Django REST Framework
- **Autenticação**: JWT com django-rest-framework-simplejwt
- **Base de Dados**: PostgreSQL (produção) / SQLite (desenvolvimento)
- **Protocolo Central**: MCP (Model Context Protocol)

### Comunicação
- **Idioma**: Português formal de Angola (pt-AO)
- **Fuso Horário**: Africa/Luanda
- **Moeda**: AOA (Kwanza Angolano)
- **Formato de Telefone**: +244 XXX XXX XXX

### Estrutura MCP
- **Módulo Central**: `mcp_core/`
- **Middleware**: Processamento automático via MCP
- **Mensagens**: Comunicação formal estruturada
- **Metadados**: Rastreamento completo de acções

## Funcionalidades Principais

1. **Gestão de Utilizadores** (`accounts/`)
   - Registo com validação angolana
   - Autenticação JWT
   - Perfis personalizados
   - Comunicação formal

2. **Participantes** (`participants/`)
   - Inscrições no programa
   - Gestão de candidaturas
   - Dashboard de progresso

3. **Temporadas** (`seasons/`)
   - Gestão de episódios
   - Galeria multimédia
   - Cronograma

4. **Votação** (`voting/`)
   - Sistema de votação pública
   - Protecção anti-fraude
   - Resultados visuais

5. **Doações** (`donations/`)
   - Crowdfunding
   - Múltiplos métodos de pagamento
   - Histórico de contribuições

6. **Loja** (`store/`)
   - Produtos oficiais
   - Checkout integrado
   - Rastreamento de encomendas

7. **Blog** (`blog/`)
   - Notícias do programa
   - Histórias de impacto

8. **Conteúdos** (`content/`)
   - Vídeos educativos
   - Cursos online
   - Podcasts

## Convenções de Código

### Naming Convention
- **Português**: Utilizar nomes em português para campos de negócio
- **Inglês**: Utilizar inglês para campos técnicos
- **Formal**: Sempre usar comunicação formal nos templates

### MCP Integration
- Todas as views principais devem usar o decorador `@mcp_endpoint`
- Mensagens MCP devem ser criadas para acções importantes
- Metadados devem ser actualizados via `update_mcp_metadata()`

### Estrutura de Resposta API
```json
{
  "sucesso": true,
  "mensagem": "Mensagem formal em português",
  "dados": {},
  "mcp_message_id": "acredita_20250708_123456_789"
}
```

## Comandos Importantes

```bash
# Activar ambiente virtual
.\\venv\\Scripts\\Activate.ps1

# Instalar dependências
pip install -r requirements.txt

# Migrações
python manage.py makemigrations
python manage.py migrate

# Criar superutilizador
python manage.py createsuperuser

# Executar servidor
python manage.py runserver
```

## Configuração de Desenvolvimento

1. Copiar `.env.example` para `.env`
2. Configurar variáveis de ambiente
3. Executar migrações
4. Criar superutilizador
5. Iniciar servidor de desenvolvimento

## Notas Especiais

- **Comunicação formal**: Sempre usar tratamento formal nas mensagens
- **Localização**: Adaptar para contexto angolano
- **MCP Logging**: Todas as acções importantes são registadas via MCP
- **Segurança**: JWT + CORS configurados para produção
