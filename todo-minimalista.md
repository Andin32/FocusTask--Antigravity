# Plano de Execução: To-Do Minimalista & Ultra-Rápido (Opção A)

## 📌 Overview
Desenvolvimento de uma aplicação web de gerenciamento de tarefas focada em simplicidade, agilidade e alta usabilidade ("Focus View"). A aplicação será construída exclusivamente com **HTML5 semântico, CSS3 moderno e JavaScript Vanilla (ES6+)**, garantindo carregamento instantâneo, persistência de dados local (`localStorage`) e suporte a lembretes e categorias.

---

## 🎯 Project Type & Constraints
- **Tipo de Projeto:** Full-Stack (Node.js + SQLite Nativo + Vanilla Frontend)
- **Stack Tecnológico:**
  - **Backend:** Node.js (v24 nativo, `node:http`, `node:crypto` com hashing seguro scrypt)
  - **Banco de Dados:** SQLite nativo (`node:sqlite` DatabaseSync) com persistência em arquivo (`database.sqlite`)
  - **Autenticação:** Sessões seguras com Bearer Token e isolamento total por `user_id`
  - **HTML5:** Estrutura semântica (telas de autenticação e modais)
  - **CSS3:** Variáveis CSS (Design Tokens), layout responsivo, Dark/Light Mode
  - **JavaScript (ES6+):** Cliente SPA reativo conectado à API REST

---

## 🏆 Critérios de Sucesso (Done When)
- [x] Sistema de login e registro com e-mail e senha.
- [x] Senhas armazenadas com salt e hash criptográfico (`scrypt`) no banco de dados SQLite.
- [x] Isolamento de dados: cada pessoa visualiza exclusivamente o seu próprio painel de tarefas e categorias.
- [x] Categorias personalizadas salvas e associadas ao usuário no SQLite.
- [x] Criação, edição, conclusão e exclusão de tarefas persistidas no SQLite.
- [x] Perfil do usuário (Nome, E-mail, Foto em Base64) persistido no SQLite.
- [x] Lembretes interativos com Web Audio e notificações nativas.
- [x] Alternador de tema Claro / Escuro (Dark/Light Mode) com seletor segmentado e ícones SVG.
- [x] Interface 100% responsiva (mobile e desktop).

---

## 📁 Estrutura de Arquivos
```
c:\Users\01706332173\Documents\Projeto2\
├── server.js            # Servidor HTTP nativo e rotas da API REST
├── database.js          # Camada de banco de dados SQLite (node:sqlite)
├── database.sqlite      # Arquivo do banco de dados SQLite
├── package.json         # Configuração de scripts (npm start)
├── index.html           # Tela de autenticação e layout do painel
├── styles.css           # Estilização completa e temas Dark/Light
├── app.js               # Cliente JavaScript conectado à API REST
└── todo-minimalista.md  # Plano de execução e documentação
```

---

## 📋 Task Breakdown

### Tarefa 1: Estrutura HTML5 Semântica (`index.html`)
- **Agente:** `frontend-specialist` | **Skill:** `clean-code`
- **Prioridade:** P0
- **Dependências:** Nenhuma
- **Input:** Requisitos dos campos (título, descrição, data/hora, prioridade, categoria, lembrete)
- **Output:** `index.html` contendo header (título, alternador dark mode, resumo de tarefas), barra de controle (busca instantânea e abas de categorias), container da lista de tarefas e modal/formulário acessível de cadastro.
- **Verify:** Abrir `index.html` no navegador e verificar se todos os elementos de formulário e containers estão presentes estruturalmente.

### Tarefa 2: Design System e Estilização Responsiva (`styles.css`)
- **Agente:** `frontend-specialist` | **Skill:** `frontend-design`
- **Prioridade:** P1
- **Dependências:** Tarefa 1
- **Input:** Estrutura de classes e tags de `index.html`
- **Output:** `styles.css` com variáveis de cor para temas claro e escuro, tipografia limpa, badges com cores distintas para cada categoria (Trabalho = azul petróleo, Casa = verde sálvia, Escola = âmbar/laranja, Compras = coral/rosa), badges de prioridade (Alta = vermelho suave, Média = amarelo/mostarda, Baixa = cinza/verde) e layout mobile-first.
- **Verify:** Checar visual no navegador; validar contraste de cores e responsividade ao redimensionar a tela.

### Tarefa 3: Camada de Estado e Persistência Local (`app.js` - Core CRUD)
- **Agente:** `frontend-specialist` | **Skill:** `clean-code`
- **Prioridade:** P1
- **Dependências:** Tarefas 1 e 2
- **Input:** Eventos de submissão do formulário e manipulação do DOM
- **Output:** Funções em `app.js` para:
  - Gerenciar a lista de tarefas no estado em memória
  - Salvar e carregar dados do `localStorage` com tratamento de fallback
  - Criar tarefa com ID único (timestamp)
  - Alternar status (Pendente / Concluída)
  - Excluir tarefa e Editar tarefa
- **Verify:** Adicionar uma tarefa, recarregar a página (`F5`) e constatar que a tarefa continua renderizada na lista.

### Tarefa 4: Filtros por Categoria, Status e Busca em Tempo Real
- **Agente:** `frontend-specialist` | **Skill:** `clean-code`
- **Prioridade:** P2
- **Dependências:** Tarefa 3
- **Input:** Inputs de filtro e campo de busca
- **Output:** Lógica reativa que filtra a lista exibida instantaneamente ao digitar no campo de busca ou ao clicar nas abas de categoria (Trabalho, Casa, Escola, Compras, Todas) e no seletor de status.
- **Verify:** Cadastrar tarefas em diferentes categorias e digitar no campo de busca para verificar a filtragem instantânea sem recarregar a página.

### Tarefa 5: Lembretes, Indicadores de Urgência e Notificações
- **Agente:** `frontend-specialist` | **Skill:** `clean-code`
- **Prioridade:** P2
- **Dependências:** Tarefas 3 e 4
- **Input:** Campo de data/hora e flag de lembrete das tarefas
- **Output:**
  - Checagem periódica (`setInterval`) de prazos de vencimento
  - Sinalizadores visuais no cartão: "Vence hoje", "Atrasada", "Vence em breve"
  - Notificação nativa via `Notification API` quando o lembrete estiver ativo e o horário for atingido (solicitando permissão com elegância ao usuário)
- **Verify:** Criar tarefa com horário para 1 minuto à frente e observar o alerta visual/notificação.

### Tarefa 6: Alternância de Tema (Dark/Light) e Atalhos de Teclado
- **Agente:** `frontend-specialist` | **Skill:** `frontend-design`
- **Prioridade:** P3
- **Dependências:** Tarefas 2 e 3
- **Input:** Botão de tema e escuta de eventos de teclado (`keydown`)
- **Output:** Alternador suave de tema com gravação da escolha no `localStorage`; suporte a atalhos: tecla `N` para abrir nova tarefa, `/` para focar na pesquisa e `Esc` para fechar modais.
- **Verify:** Clicar no alternador de tema e verificar persistência ao recarregar a página; testar os atalhos de teclado.

---

## 🧪 Fase X: Verificação Final
- [x] **Autenticação:** Registro e Login com validação de e-mail e senha no SQLite.
- [x] **Criptografia:** Senhas com salt aleatório de 16 bytes e hash scrypt de 64 bytes.
- [x] **Isolamento de Dados:** Cada usuário visualiza apenas suas próprias tarefas e categorias (`user_id`).
- [x] **Banco de Dados SQLite:** Tabelas `users`, `sessions`, `categories` e `tasks` com chaves estrangeiras.
- [x] **Servidor HTTP:** Endpoints REST em Node.js com zero dependências externas.
- [x] **Design & Acessibilidade:** Interface moderna, Dark/Light mode e navegação responsiva.

## ✅ PHASE X COMPLETE
- Sintaxe Backend: ✅ Pass (`node --check server.js` e `node --check database.js`)
- Teste Funcional SQLite: ✅ Pass (Registro, Login, Hashing scrypt e Isolamento confirmados)
- Sintaxe Frontend: ✅ Pass (`node --check app.js`)
- Data: 12/11/2026
