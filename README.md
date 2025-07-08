# 🇦🇴 Acredita em Ti, Acredita em Angola

> **Sistema Web Completo para o Programa Social Angolano**

Sistema robusto e escalável desenvolvido em Django + React com integração MCP (Model Context Protocol) para o programa "Acredita em Ti, Acredita em Angola".

## 🎯 Objectivos

- **Inscrição e Gestão de Participantes**: Sistema completo para candidaturas
- **Apresentação do Programa**: Portal informativo sobre temporadas e episódios  
- **Votação Pública**: Sistema seguro de votação online
- **Crowdfunding**: Plataforma de doações e contribuições
- **Loja Online**: Venda de produtos oficiais do programa
- **Conteúdos Educativos**: Vídeos, cursos e podcasts

## 🏗️ Arquitectura Técnica

### Backend
- **Framework**: Django 5.0.6 + Django REST Framework
- **Autenticação**: JWT (JSON Web Tokens)
- **Base de Dados**: PostgreSQL (produção) / SQLite (desenvolvimento)
- **Protocolo Central**: MCP (Model Context Protocol)
- **Idioma**: Português formal de Angola

### Funcionalidades Principais
- ✅ **Autenticação e Utilizadores** - Sistema completo com MCP
- ⏳ **Gestão de Participantes** - Em desenvolvimento
- ⏳ **Sistema de Temporadas** - Em desenvolvimento  
- ⏳ **Votação Pública** - Em desenvolvimento
- ⏳ **Crowdfunding** - Em desenvolvimento
- ⏳ **Loja Online** - Em desenvolvimento
- ⏳ **Blog e Conteúdos** - Em desenvolvimento

### Integração MCP
O sistema utiliza o **Model Context Protocol (MCP)** como núcleo central da comunicação:

- **Middleware Automático**: Todas as requisições processadas via MCP
- **Comunicação Formal**: Mensagens em português formal angolano
- **Rastreamento Completo**: Metadados de todas as acções
- **Gestão de Erros**: Sistema centralizado de tratamento

## 🚀 Instalação e Configuração

### Pré-requisitos
- Python 3.13+
- PostgreSQL (para produção)
- Git

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd Acredita
```

### 2. Configurar Ambiente Virtual
```bash
# Windows PowerShell
python -m venv venv
.\\venv\\Scripts\\Activate.ps1

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 4. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas configurações
```

### 5. Executar Migrações
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Criar Superutilizador
```bash
python manage.py createsuperuser
```

### 7. Executar Servidor
```bash
python manage.py runserver
```

O sistema estará disponível em: `http://127.0.0.1:8000/`

## 📁 Estrutura do Projecto

```
Acredita/
├── 📁 acredita_backend/     # Configurações Django
├── 📁 mcp_core/            # Núcleo MCP (Model Context Protocol)
├── 📁 accounts/            # Autenticação e utilizadores
├── 📁 participants/        # Gestão de participantes
├── 📁 seasons/            # Temporadas e episódios
├── 📁 voting/             # Sistema de votação
├── 📁 donations/          # Crowdfunding e doações
├── 📁 store/              # Loja online
├── 📁 blog/               # Blog e notícias
├── 📁 content/            # Conteúdos educativos
├── 📁 logs/               # Ficheiros de log
├── 📁 static/             # Ficheiros estáticos
├── 📁 media/              # Uploads de utilizadores
├── 📄 requirements.txt     # Dependências Python
├── 📄 .env.example        # Exemplo de variáveis
└── 📄 manage.py           # Gestor Django
```

## 🔧 Configurações Específicas

### Comunicação Formal Angola
```python
ACREDITA_COMMUNICATION = {
    'FORMAL_LANGUAGE': True,
    'COUNTRY_CODE': 'AO',
    'TIMEZONE': 'Africa/Luanda',
    'CURRENCY': 'AOA',
    'PHONE_PREFIX': '+244',
}
```

### MCP (Model Context Protocol)
```python
MCP_CONFIG = {
    'PROTOCOL_VERSION': '2024-11-05',
    'IMPLEMENTATION_NAME': 'acredita-mcp-server',
    'LANGUAGE': 'pt-AO',
    'FORMAL_COMMUNICATION': True,
}
```

## 🌐 APIs Disponíveis

### Autenticação
- `POST /api/accounts/register/` - Registo de utilizador
- `POST /api/accounts/login/` - Login
- `GET /api/accounts/dashboard/` - Dashboard do utilizador
- `POST /api/accounts/logout/` - Logout

### Utilizadores
- `GET /api/accounts/me/` - Perfil actual
- `PATCH /api/accounts/me/` - Actualizar perfil

## 🔒 Segurança

- **JWT Authentication**: Tokens seguros para autenticação
- **CORS**: Configurado para produção
- **CSRF Protection**: Protecção contra ataques CSRF
- **Input Validation**: Validação rigorosa de dados
- **MCP Logging**: Registo completo de actividades

## 🌍 Localização Angola

- **Idioma**: Português formal de Angola (pt-AO)
- **Fuso Horário**: Africa/Luanda
- **Moeda**: Kwanza Angolano (AOA)
- **Telefones**: Formato +244 XXX XXX XXX
- **Províncias**: Todas as 18 províncias angolanas

## 📊 Estado de Desenvolvimento

| Módulo | Estado | Descrição |
|--------|--------|-----------|
| 🔐 Autenticação | ✅ Completo | Sistema de login/registo com MCP |
| 👥 Utilizadores | ✅ Completo | Gestão de perfis e dashboard |
| 🎭 Participantes | ⏳ Desenvolvimento | Inscrições e candidaturas |
| 📺 Temporadas | ⏳ Planeado | Gestão de episódios |
| 🗳️ Votação | ⏳ Planeado | Sistema de votação pública |
| 💰 Doações | ⏳ Planeado | Crowdfunding |
| 🛒 Loja | ⏳ Planeado | E-commerce |
| 📝 Blog | ⏳ Planeado | Notícias e conteúdos |

## 🤝 Contribuição

1. Faça fork do projecto
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projecto:
- 📧 Email: [suporte@acredita.ao](mailto:suporte@acredita.ao)
- 🌐 Website: [www.acredita.ao](https://www.acredita.ao)

## 📄 Licença

Este projecto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para Angola 🇦🇴**

> *"Acredita em Ti, Acredita em Angola - Transformando sonhos em realidade através da tecnologia"*
