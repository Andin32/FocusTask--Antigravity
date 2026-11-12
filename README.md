# ⚡ FocusTask — Gerenciador de Tarefas Ágil & Seguro

Uma aplicação web moderna, rápida e intuitiva para gerenciamento de tarefas pessoais e rotina, construída com **HTML5, CSS3, JavaScript Vanilla** no frontend e **Node.js com SQLite nativo** no backend.

---

## 🌟 Principais Recursos

- **🔐 Sistema de Autenticação Completo:**
  - Cadastro e Login com e-mail e senha.
  - Criptografia avançada de senhas utilizando `salt` aleatório de 16 bytes e hash derivado com **`scrypt`**.
  - Sessões gerenciadas por tokens com expiração configurada.
  
- **🛡️ Isolamento Rigoroso de Dados por Usuário:**
  - Cada usuário acessa e visualiza **exclusivamente seu próprio painel**.
  - Nenhuma tarefa ou categoria é compartilhada entre contas.

- **🗂️ Tarefas Detalhadas e Organizadas:**
  - Título, descrição detalhada, prazo de vencimento (data e hora), prioridade (Alta, Média, Baixa) e lembrete.
  - Indicadores visuais de prazo: *Atrasada*, *Hoje* e *Amanhã*.
  - Lembretes com som sintetizado (*Web Audio API*) e alertas nativos do navegador (*Web Notification API*).

- **🎨 Categorias 100% Personalizadas:**
  - Cada pessoa cria e gerencia suas próprias categorias.
  - Escolha de nome, cor exclusiva e ícone vetorial SVG (maleta, casa, livro, carrinho, fitness, estrela, etc.).

- **🌓 Alternador de Tema (Dark / Light Mode):**
  - Seletor segmentado no topo com transição suave.
  - Paleta limpa em ardósia neutra e acentos específicos por categoria (sem tons violetas clichês).
  - Preferência salva automaticamente no navegador.

- **⚡ Zero Dependências Externas no Backend:**
  - Utiliza o módulo nativo **`node:sqlite`** (`DatabaseSync`) integrado ao Node.js.
  - Servidor HTTP nativo em `node:http`.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) v22.5.0 ou superior (recomendado Node.js v24).
- [Git](https://git-scm.com/).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Andin32/FocusTask--Antigravity.git
   cd FocusTask--Antigravity
   ```

2. **Inicie o servidor:**
   ```bash
   npm start
   ```
   *(ou `node server.js`)*

3. **Acesse no navegador:**
   Abra no seu navegador:
   👉 **`http://localhost:3000`**

---

## 📁 Estrutura do Projeto

```
FocusTask/
├── server.js            # Servidor HTTP nativo e rotas da API REST
├── database.js          # Camada de banco de dados SQLite (node:sqlite)
├── database.sqlite      # Arquivo do banco de dados SQLite local
├── index.html           # Interface do usuário (Auth Screen e Dashboard)
├── styles.css           # Design tokens, temas claro/escuro e estilos responsivos
├── app.js               # Lógica cliente, estado SPA, chamadas REST e áudio
├── package.json         # Configurações do projeto e scripts npm
├── .gitignore           # Ignora banco local e arquivos temporários
└── README.md            # Documentação completa
```

---

## 📄 Licença
Distribuído sob a licença MIT.
