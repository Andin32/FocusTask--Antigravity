/**
 * FocusTask — Frontend Client conectado à API SQLite
 * Vanilla JavaScript (ES6+) sem frameworks
 * Autenticação por Sessão, Isolamento de Dados por Usuário e Banco SQLite
 */

(() => {
  'use strict';

  // Chaves de armazenamento LocalStorage
  const TOKEN_KEY = 'focustask_token';
  const THEME_KEY = 'focustask_theme';

  // Paleta de Cores Pré-definidas para Novas Categorias (Sem Tons Roxos Proibidos)
  const CATEGORY_COLORS = [
    '#0284c7', // Sky Blue
    '#059669', // Emerald
    '#d97706', // Warm Amber
    '#e11d48', // Coral Rose
    '#0f766e', // Deep Teal
    '#ea580c', // Sunset Orange
    '#2563eb', // Royal Blue
    '#475569'  // Slate Gray
  ];

  // Coleção de Ícones SVG Reutilizáveis
  const SVGS = {
    all: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    briefcase: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    home: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    book: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
    cart: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    fitness: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11"></path><path d="M6.5 17.5h11"></path><path d="M4 10h16"></path><path d="M4 14h16"></path><path d="M2 8v8"></path><path d="M22 8v8"></path></svg>`,
    star: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    heart: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    target: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    tag: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,

    priorityHigh: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    priorityMedium: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    priorityLow: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline></svg>`,

    calendar: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    bell: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    edit: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    trash: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    checkCircle: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
  };

  // Estado do Cliente
  const state = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    currentUser: null,
    categories: [],
    tasks: [],
    filterCategory: 'all',
    filterStatus: 'all',
    searchQuery: '',
    sortBy: 'dueDateAsc',
    editingTaskId: null
  };

  // Elementos do DOM
  const elements = {
    // Telas Principais
    authView: document.getElementById('authView'),
    appLayout: document.getElementById('appLayout'),

    // Tela de Autenticação
    authSubtitle: document.getElementById('authSubtitle'),
    authErrorBanner: document.getElementById('authErrorBanner'),
    tabLoginBtn: document.getElementById('tabLoginBtn'),
    tabRegisterBtn: document.getElementById('tabRegisterBtn'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    registerName: document.getElementById('registerName'),
    registerEmail: document.getElementById('registerEmail'),
    registerPassword: document.getElementById('registerPassword'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),
    registerSubmitBtn: document.getElementById('registerSubmitBtn'),

    // Header & Tema
    themeLightBtn: document.getElementById('themeLightBtn'),
    themeDarkBtn: document.getElementById('themeDarkBtn'),
    openNewTaskModalBtn: document.getElementById('openNewTaskModalBtn'),
    progressCount: document.getElementById('progressCount'),
    progressBarFill: document.getElementById('progressBarFill'),

    // Menu do Usuário no Header
    userMenuBtn: document.getElementById('userMenuBtn'),
    headerUserAvatar: document.getElementById('headerUserAvatar'),
    headerUserInitials: document.getElementById('headerUserInitials'),
    headerUserName: document.getElementById('headerUserName'),
    userDropdown: document.getElementById('userDropdown'),
    dropdownUserAvatar: document.getElementById('dropdownUserAvatar'),
    dropdownUserInitials: document.getElementById('dropdownUserInitials'),
    dropdownUserName: document.getElementById('dropdownUserName'),
    dropdownUserEmail: document.getElementById('dropdownUserEmail'),
    openProfileModalBtn: document.getElementById('openProfileModalBtn'),
    openCategoriesModalBtn: document.getElementById('openCategoriesModalBtn'),
    logoutBtn: document.getElementById('logoutBtn'),

    // Controles & Filtros
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    statusPills: document.querySelectorAll('.status-pill'),
    categoryTabsContainer: document.getElementById('categoryTabsContainer'),
    sortBySelect: document.getElementById('sortBySelect'),
    activeFilterDesc: document.getElementById('activeFilterDesc'),

    // Lista & Empty State
    tasksContainer: document.getElementById('tasksContainer'),
    emptyState: document.getElementById('emptyState'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptySubtitle: document.getElementById('emptySubtitle'),
    emptyCreateBtn: document.getElementById('emptyCreateBtn'),

    // Modal: Tarefa
    taskModal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    taskForm: document.getElementById('taskForm'),
    taskIdInput: document.getElementById('taskIdInput'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    taskDescInput: document.getElementById('taskDescInput'),
    taskCategorySelect: document.getElementById('taskCategorySelect'),
    quickManageCatBtn: document.getElementById('quickManageCatBtn'),
    taskPrioritySelect: document.getElementById('taskPrioritySelect'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    taskReminderCheckbox: document.getElementById('taskReminderCheckbox'),

    // Modal: Perfil
    profileModal: document.getElementById('profileModal'),
    closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
    cancelProfileBtn: document.getElementById('cancelProfileBtn'),
    profileForm: document.getElementById('profileForm'),
    profileAvatarPreview: document.getElementById('profileAvatarPreview'),
    profileAvatarInitials: document.getElementById('profileAvatarInitials'),
    profilePhotoInput: document.getElementById('profilePhotoInput'),
    removePhotoBtn: document.getElementById('removePhotoBtn'),
    profileNameInput: document.getElementById('profileNameInput'),
    profileEmailInput: document.getElementById('profileEmailInput'),

    // Modal: Categorias
    categoriesModal: document.getElementById('categoriesModal'),
    closeCategoriesModalBtn: document.getElementById('closeCategoriesModalBtn'),
    doneCategoriesBtn: document.getElementById('doneCategoriesBtn'),
    currentCategoriesList: document.getElementById('currentCategoriesList'),
    addCategoryForm: document.getElementById('addCategoryForm'),
    newCategoryNameInput: document.getElementById('newCategoryNameInput'),
    colorPickerContainer: document.getElementById('colorPickerContainer'),
    selectedCategoryColor: document.getElementById('selectedCategoryColor'),
    iconPickerContainer: document.getElementById('iconPickerContainer'),
    selectedCategoryIcon: document.getElementById('selectedCategoryIcon'),

    // Notificações & Toasts
    notificationBanner: document.getElementById('notificationBanner'),
    enableNotificationsBtn: document.getElementById('enableNotificationsBtn'),
    dismissNotificationsBtn: document.getElementById('dismissNotificationsBtn'),
    toastContainer: document.getElementById('toastContainer')
  };

  let tempAvatarBase64 = null;

  // ============================================================
  // Cliente de API HTTP (com Bearer Token)
  // ============================================================
  async function apiRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && state.token) {
          handleLogout();
        }
        throw new Error(data.error || 'Erro na comunicação com o servidor.');
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  // ============================================================
  // Inicialização
  // ============================================================
  async function init() {
    initTheme();
    buildCategoryPickers();
    bindEvents();
    initNotificationPermissionUI();

    // Checar se já existe uma sessão salva
    if (state.token) {
      try {
        const data = await apiRequest('/api/auth/me');
        onLoginSuccess(data.user, state.token);
      } catch (err) {
        handleLogout();
      }
    } else {
      showAuthView();
    }

    startReminderTicker();
  }

  // ============================================================
  // Gerenciamento de Autenticação (Login / Registro / Logout)
  // ============================================================
  function showAuthView() {
    state.token = null;
    state.currentUser = null;
    localStorage.removeItem(TOKEN_KEY);

    elements.appLayout.classList.add('hidden');
    elements.authView.classList.remove('hidden');
    switchAuthTab('login');
  }

  function showAppView() {
    elements.authView.classList.add('hidden');
    elements.appLayout.classList.remove('hidden');
  }

  function switchAuthTab(tab) {
    clearAuthError();
    if (tab === 'login') {
      elements.tabLoginBtn.classList.add('active');
      elements.tabLoginBtn.setAttribute('aria-selected', 'true');
      elements.tabRegisterBtn.classList.remove('active');
      elements.tabRegisterBtn.setAttribute('aria-selected', 'false');

      elements.loginForm.classList.remove('hidden');
      elements.registerForm.classList.add('hidden');
      elements.authSubtitle.textContent = 'Acesse o seu painel exclusivo de tarefas';
      setTimeout(() => elements.loginEmail.focus(), 50);
    } else {
      elements.tabRegisterBtn.classList.add('active');
      elements.tabRegisterBtn.setAttribute('aria-selected', 'true');
      elements.tabLoginBtn.classList.remove('active');
      elements.tabLoginBtn.setAttribute('aria-selected', 'false');

      elements.registerForm.classList.remove('hidden');
      elements.loginForm.classList.add('hidden');
      elements.authSubtitle.textContent = 'Cadastre-se para criar seu painel seguro no SQLite';
      setTimeout(() => elements.registerName.focus(), 50);
    }
  }

  function showAuthError(msg) {
    elements.authErrorBanner.textContent = msg;
    elements.authErrorBanner.classList.remove('hidden');
  }

  function clearAuthError() {
    elements.authErrorBanner.textContent = '';
    elements.authErrorBanner.classList.add('hidden');
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    clearAuthError();

    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;

    elements.loginSubmitBtn.disabled = true;
    elements.loginSubmitBtn.innerHTML = '<span>Verificando credenciais...</span>';

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      onLoginSuccess(data.user, data.token);
      showToast(`Bem-vindo de volta, ${data.user.name}!`);
    } catch (err) {
      showAuthError(err.message);
    } finally {
      elements.loginSubmitBtn.disabled = false;
      elements.loginSubmitBtn.innerHTML = `
        <span>Acessar Meu Painel</span>
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    clearAuthError();

    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;

    if (password.length < 6) {
      showAuthError('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    elements.registerSubmitBtn.disabled = true;
    elements.registerSubmitBtn.innerHTML = '<span>Criando conta no SQLite...</span>';

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      onLoginSuccess(data.user, data.token);
      showToast(`Conta criada com sucesso! Olá, ${data.user.name}!`);
    } catch (err) {
      showAuthError(err.message);
    } finally {
      elements.registerSubmitBtn.disabled = false;
      elements.registerSubmitBtn.innerHTML = `
        <span>Criar Conta e Começar</span>
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    }
  }

  async function onLoginSuccess(user, token) {
    state.currentUser = user;
    state.token = token;
    localStorage.setItem(TOKEN_KEY, token);

    showAppView();
    renderHeaderProfile();

    // Carregar categorias e tarefas do banco SQLite para o usuário autenticado
    await Promise.all([
      fetchCategories(),
      fetchTasks()
    ]);

    render();
  }

  async function handleLogout() {
    if (state.token) {
      try {
        await apiRequest('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
    }

    showAuthView();
    showToast('Você saiu da sua conta.');
  }

  // ============================================================
  // Dados do Usuário (SQLite API)
  // ============================================================
  async function fetchCategories() {
    try {
      const data = await apiRequest('/api/categories');
      state.categories = data.categories || [];
      renderCategoryTabs();
      populateTaskModalCategories();
    } catch (err) {
      console.error('Falha ao carregar categorias:', err);
    }
  }

  async function fetchTasks() {
    try {
      const data = await apiRequest('/api/tasks');
      state.tasks = data.tasks || [];
      renderDailyProgress();
      renderFilterDescription();
    } catch (err) {
      console.error('Falha ao carregar tarefas:', err);
    }
  }

  // ============================================================
  // Tema (Dark / Light)
  // ============================================================
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(activeTheme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    if (elements.themeLightBtn && elements.themeDarkBtn) {
      if (theme === 'dark') {
        elements.themeDarkBtn.classList.add('active');
        elements.themeLightBtn.classList.remove('active');
      } else {
        elements.themeLightBtn.classList.add('active');
        elements.themeDarkBtn.classList.remove('active');
      }
    }
  }

  // ============================================================
  // Perfil do Usuário
  // ============================================================
  function renderHeaderProfile() {
    if (!state.currentUser) return;
    const user = state.currentUser;

    elements.headerUserName.textContent = user.name;
    elements.dropdownUserName.textContent = user.name;
    elements.dropdownUserEmail.textContent = user.email;

    if (user.avatar) {
      elements.headerUserAvatar.style.backgroundImage = `url("${user.avatar}")`;
      elements.headerUserInitials.textContent = '';
      elements.dropdownUserAvatar.style.backgroundImage = `url("${user.avatar}")`;
      elements.dropdownUserInitials.textContent = '';
    } else {
      elements.headerUserAvatar.style.backgroundImage = 'none';
      elements.headerUserInitials.textContent = getInitials(user.name);
      elements.dropdownUserAvatar.style.backgroundImage = 'none';
      elements.dropdownUserInitials.textContent = getInitials(user.name);
    }
  }

  function openProfileModal() {
    closeUserDropdown();
    const user = state.currentUser;
    tempAvatarBase64 = user.avatar || '';

    elements.profileNameInput.value = user.name;
    elements.profileEmailInput.value = user.email;
    updateAvatarPreview(user.name, tempAvatarBase64);

    elements.profileModal.showModal();
  }

  function updateAvatarPreview(name, photoBase64) {
    if (photoBase64) {
      elements.profileAvatarPreview.style.backgroundImage = `url("${photoBase64}")`;
      elements.profileAvatarInitials.textContent = '';
      elements.removePhotoBtn.classList.remove('hidden');
    } else {
      elements.profileAvatarPreview.style.backgroundImage = 'none';
      elements.profileAvatarInitials.textContent = getInitials(name);
      elements.removePhotoBtn.classList.add('hidden');
    }
  }

  function handleProfilePhotoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      tempAvatarBase64 = event.target.result;
      updateAvatarPreview(elements.profileNameInput.value || 'U', tempAvatarBase64);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveProfilePhoto() {
    tempAvatarBase64 = '';
    elements.profilePhotoInput.value = '';
    updateAvatarPreview(elements.profileNameInput.value || 'U', '');
  }

  async function handleProfileFormSubmit(e) {
    e.preventDefault();
    const newName = elements.profileNameInput.value.trim();
    const newEmail = elements.profileEmailInput.value.trim();

    if (!newName || !newEmail) {
      showToast('Nome e e-mail são obrigatórios.', 'error');
      return;
    }

    try {
      const data = await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          avatar: tempAvatarBase64
        })
      });

      state.currentUser = data.user;
      renderHeaderProfile();
      elements.profileModal.close();
      showToast('Perfil atualizado com sucesso no SQLite!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function toggleUserDropdown() {
    elements.userDropdown.classList.toggle('hidden');
    const isExpanded = !elements.userDropdown.classList.contains('hidden');
    elements.userMenuBtn.setAttribute('aria-expanded', isExpanded);
  }

  function closeUserDropdown() {
    elements.userDropdown.classList.add('hidden');
    elements.userMenuBtn.setAttribute('aria-expanded', 'false');
  }

  // ============================================================
  // Categorias (SQLite API)
  // ============================================================
  function buildCategoryPickers() {
    // Cores
    elements.colorPickerContainer.innerHTML = '';
    CATEGORY_COLORS.forEach((color, index) => {
      const chip = document.createElement('div');
      chip.className = `color-chip ${index === 0 ? 'selected' : ''}`;
      chip.style.backgroundColor = color;
      chip.dataset.color = color;
      chip.title = `Cor ${color}`;
      chip.addEventListener('click', () => {
        elements.colorPickerContainer.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        elements.selectedCategoryColor.value = color;
      });
      elements.colorPickerContainer.appendChild(chip);
    });

    // Ícones
    const iconKeys = ['tag', 'briefcase', 'home', 'book', 'cart', 'fitness', 'star', 'heart', 'target'];
    elements.iconPickerContainer.innerHTML = '';
    iconKeys.forEach((key, index) => {
      const chip = document.createElement('div');
      chip.className = `icon-chip ${index === 0 ? 'selected' : ''}`;
      chip.dataset.icon = key;
      chip.innerHTML = SVGS[key] || SVGS.tag;
      chip.title = key;
      chip.addEventListener('click', () => {
        elements.iconPickerContainer.querySelectorAll('.icon-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        elements.selectedCategoryIcon.value = key;
      });
      elements.iconPickerContainer.appendChild(chip);
    });
  }

  function openCategoriesModal() {
    closeUserDropdown();
    renderCurrentCategoriesList();
    elements.addCategoryForm.reset();
    elements.selectedCategoryColor.value = CATEGORY_COLORS[0];
    elements.selectedCategoryIcon.value = 'tag';
    buildCategoryPickers();
    elements.categoriesModal.showModal();
  }

  function renderCurrentCategoriesList() {
    elements.currentCategoriesList.innerHTML = '';

    state.categories.forEach(cat => {
      const row = document.createElement('div');
      row.className = 'category-item-row';
      const catIcon = SVGS[cat.icon] || SVGS.tag;

      row.innerHTML = `
        <div class="cat-item-left">
          <span class="cat-dot-preview" style="background-color: ${cat.color};"></span>
          <span style="color: ${cat.color}; display: flex; align-items: center;">${catIcon}</span>
          <span class="cat-item-name">${escapeHtml(cat.name)}</span>
        </div>
        <button type="button" class="delete-cat-btn" title="Excluir categoria" data-id="${cat.id}">
          ${SVGS.trash}
        </button>
      `;

      const deleteBtn = row.querySelector('.delete-cat-btn');
      deleteBtn.addEventListener('click', () => deleteCategory(cat.id));

      elements.currentCategoriesList.appendChild(row);
    });
  }

  async function handleAddCategorySubmit(e) {
    e.preventDefault();
    const name = elements.newCategoryNameInput.value.trim();
    const color = elements.selectedCategoryColor.value;
    const icon = elements.selectedCategoryIcon.value;

    if (!name) return;

    try {
      const data = await apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name, color, icon })
      });

      state.categories.push(data.category);
      renderCurrentCategoriesList();
      renderCategoryTabs();
      populateTaskModalCategories();
      elements.addCategoryForm.reset();
      buildCategoryPickers();
      showToast(`Categoria "${name}" criada no SQLite!`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function deleteCategory(catId) {
    if (state.categories.length <= 1) {
      showToast('Você deve manter pelo menos uma categoria.', 'error');
      return;
    }

    const cat = state.categories.find(c => c.id === catId);
    if (!cat) return;

    if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
      try {
        await apiRequest(`/api/categories/${catId}`, { method: 'DELETE' });
        state.categories = state.categories.filter(c => c.id !== catId);

        if (state.filterCategory === catId) {
          state.filterCategory = 'all';
        }

        renderCurrentCategoriesList();
        renderCategoryTabs();
        populateTaskModalCategories();
        render();
        showToast('Categoria removida com sucesso.');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }

  function renderCategoryTabs() {
    elements.categoryTabsContainer.innerHTML = '';

    // Aba Todas
    const allTab = document.createElement('button');
    allTab.className = `cat-tab ${state.filterCategory === 'all' ? 'active' : ''}`;
    allTab.dataset.category = 'all';
    allTab.innerHTML = `
      <span style="color: var(--text-muted);">${SVGS.all}</span>
      <span>Todas</span>
      <span class="cat-counter" id="count-all">${state.tasks.length}</span>
    `;
    allTab.addEventListener('click', () => {
      elements.categoryTabsContainer.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      allTab.classList.add('active');
      state.filterCategory = 'all';
      render();
    });
    elements.categoryTabsContainer.appendChild(allTab);

    // Abas Dinâmicas do SQLite
    state.categories.forEach(cat => {
      const tab = document.createElement('button');
      tab.className = `cat-tab ${state.filterCategory === cat.id ? 'active' : ''}`;
      tab.dataset.category = cat.id;

      const catIcon = SVGS[cat.icon] || SVGS.tag;
      const count = state.tasks.filter(t => t.category === cat.id).length;

      tab.innerHTML = `
        <span style="color: ${cat.color}; display: flex; align-items: center;">${catIcon}</span>
        <span>${escapeHtml(cat.name)}</span>
        <span class="cat-counter">${count}</span>
      `;

      tab.addEventListener('click', () => {
        elements.categoryTabsContainer.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.filterCategory = cat.id;
        render();
      });

      elements.categoryTabsContainer.appendChild(tab);
    });
  }

  function populateTaskModalCategories() {
    elements.taskCategorySelect.innerHTML = '';

    state.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      elements.taskCategorySelect.appendChild(option);
    });
  }

  // ============================================================
  // Tarefas (CRUD com SQLite API)
  // ============================================================
  async function createTask(taskData) {
    try {
      const data = await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });

      state.tasks.unshift(data.task);
      render();
      renderCategoryTabs();
      showToast('Tarefa salva no SQLite!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function updateTask(id, taskData) {
    try {
      await apiRequest(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
      });

      const index = state.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...taskData };
      }

      render();
      renderCategoryTabs();
      showToast('Tarefa atualizada com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function toggleTaskCompletion(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    try {
      await apiRequest(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...task,
          completed: newCompleted
        })
      });

      task.completed = newCompleted;
      render();
      renderCategoryTabs();

      if (newCompleted) {
        playChime(660, 0.1);
        showToast('Tarefa concluída! Parabéns 🎉');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function deleteTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    if (confirm(`Deseja excluir a tarefa "${task.title}" do banco de dados?`)) {
      try {
        await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
        state.tasks = state.tasks.filter(t => t.id !== id);
        render();
        renderCategoryTabs();
        showToast('Tarefa excluída.', 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }

  function openCreateModal() {
    state.editingTaskId = null;
    elements.modalTitle.textContent = 'Nova Tarefa';
    elements.taskIdInput.value = '';
    elements.taskForm.reset();

    populateTaskModalCategories();

    if (state.filterCategory !== 'all') {
      elements.taskCategorySelect.value = state.filterCategory;
    }

    elements.taskPrioritySelect.value = 'medium';
    elements.taskReminderCheckbox.checked = true;

    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
    elements.taskDueDateInput.value = localISOTime;

    elements.taskModal.showModal();
    setTimeout(() => elements.taskTitleInput.focus(), 50);
  }

  function openEditModal(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    state.editingTaskId = id;
    elements.modalTitle.textContent = 'Editar Tarefa';
    elements.taskIdInput.value = task.id;
    elements.taskTitleInput.value = task.title;
    elements.taskDescInput.value = task.desc || '';

    populateTaskModalCategories();
    elements.taskCategorySelect.value = task.category;
    elements.taskPrioritySelect.value = task.priority;
    elements.taskDueDateInput.value = task.dueDate || '';
    elements.taskReminderCheckbox.checked = Boolean(task.reminder);

    elements.taskModal.showModal();
    setTimeout(() => elements.taskTitleInput.focus(), 50);
  }

  function closeModal() {
    elements.taskModal.close();
    state.editingTaskId = null;
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const taskData = {
      title: elements.taskTitleInput.value,
      desc: elements.taskDescInput.value,
      category: elements.taskCategorySelect.value,
      priority: elements.taskPrioritySelect.value,
      dueDate: elements.taskDueDateInput.value,
      reminder: elements.taskReminderCheckbox.checked
    };

    if (!taskData.title.trim()) {
      showToast('O título da tarefa é obrigatório.', 'error');
      elements.taskTitleInput.focus();
      return;
    }

    if (state.editingTaskId) {
      updateTask(state.editingTaskId, taskData);
    } else {
      createTask(taskData);
    }

    closeModal();
  }

  // ============================================================
  // Filtros e Renderização da Lista
  // ============================================================
  function getFilteredAndSortedTasks() {
    let result = [...state.tasks];

    if (state.filterCategory !== 'all') {
      result = result.filter(t => t.category === state.filterCategory);
    }

    if (state.filterStatus === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (state.filterStatus === 'completed') {
      result = result.filter(t => t.completed);
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.desc && t.desc.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (state.sortBy) {
        case 'dueDateAsc': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        case 'priorityDesc': {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }
        case 'createdDesc': {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        case 'titleAsc': {
          return a.title.localeCompare(b.title, 'pt-BR');
        }
        default:
          return 0;
      }
    });

    return result;
  }

  function render() {
    renderDailyProgress();
    renderFilterDescription();

    const filteredTasks = getFilteredAndSortedTasks();
    elements.tasksContainer.innerHTML = '';

    if (filteredTasks.length === 0) {
      elements.emptyState.classList.remove('hidden');
      const currentCat = state.categories.find(c => c.id === state.filterCategory);

      if (state.searchQuery) {
        elements.emptyTitle.textContent = 'Nenhuma tarefa encontrada';
        elements.emptySubtitle.textContent = `Nenhum resultado para a busca "${state.searchQuery}".`;
      } else if (currentCat) {
        elements.emptyTitle.textContent = `Nenhuma tarefa em "${currentCat.name}"`;
        elements.emptySubtitle.textContent = 'Adicione uma nova tarefa nesta categoria clicando no botão abaixo.';
      } else if (state.filterStatus === 'completed') {
        elements.emptyTitle.textContent = 'Nenhuma tarefa concluída ainda';
        elements.emptySubtitle.textContent = 'Marque suas tarefas concluídas na lista para vê-las aqui.';
      } else {
        elements.emptyTitle.textContent = 'Tudo limpo por aqui!';
        elements.emptySubtitle.textContent = `${state.currentUser ? state.currentUser.name : 'Você'} não possui tarefas pendentes.`;
      }
    } else {
      elements.emptyState.classList.add('hidden');
      filteredTasks.forEach(task => {
        const card = createTaskCardElement(task);
        elements.tasksContainer.appendChild(card);
      });
    }
  }

  function createTaskCardElement(task) {
    const card = document.createElement('article');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.setAttribute('data-id', task.id);

    const dueInfo = formatDueDateInfo(task.dueDate);

    // Mapeamento dinâmico da categoria no SQLite
    const cat = state.categories.find(c => c.id === task.category) || {
      name: 'Geral',
      color: '#64748b',
      icon: 'tag'
    };
    const catSvg = SVGS[cat.icon] || SVGS.tag;

    // Prioridade
    const priorityConfigs = {
      high: { label: 'Alta', icon: SVGS.priorityHigh },
      medium: { label: 'Média', icon: SVGS.priorityMedium },
      low: { label: 'Baixa', icon: SVGS.priorityLow }
    };
    const prioConf = priorityConfigs[task.priority] || { label: task.priority, icon: SVGS.priorityMedium };

    card.innerHTML = `
      <div class="task-check-wrapper">
        <input 
          type="checkbox" 
          class="custom-checkbox" 
          ${task.completed ? 'checked' : ''} 
          aria-label="Marcar tarefa ${escapeHtml(task.title)} como ${task.completed ? 'pendente' : 'concluída'}"
        >
      </div>

      <div class="task-content">
        <div class="task-header-row">
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          <div class="task-actions">
            <button class="task-action-btn edit-btn" title="Editar tarefa" aria-label="Editar">
              ${SVGS.edit}
            </button>
            <button class="task-action-btn delete-btn" title="Excluir tarefa" aria-label="Excluir">
              ${SVGS.trash}
            </button>
          </div>
        </div>

        ${task.desc ? `<p class="task-desc">${escapeHtml(task.desc)}</p>` : ''}

        <div class="task-badges">
          <span class="badge" style="background-color: ${cat.color}22; color: ${cat.color};" title="Categoria: ${escapeHtml(cat.name)}">
            ${catSvg}
            <span>${escapeHtml(cat.name)}</span>
          </span>
          
          <span class="badge badge-priority-${task.priority}" title="Prioridade: ${prioConf.label}">
            ${prioConf.icon}
            <span>Prioridade ${prioConf.label}</span>
          </span>

          ${dueInfo ? `
            <span class="badge badge-due ${dueInfo.statusClass}" title="Data de Vencimento">
              ${SVGS.calendar}
              <span>${dueInfo.text}</span>
            </span>
          ` : ''}

          ${task.reminder ? `
            <span class="badge badge-reminder" title="Lembrete ativado para esta tarefa">
              ${SVGS.bell}
              <span>Lembrete</span>
            </span>
          ` : ''}
        </div>
      </div>
    `;

    const checkbox = card.querySelector('.custom-checkbox');
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => openEditModal(task.id));

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return card;
  }

  function formatDueDateInfo(dueDateString) {
    if (!dueDateString) return null;

    const dueDate = new Date(dueDateString);
    if (isNaN(dueDate.getTime())) return null;

    const now = new Date();
    const diffMs = dueDate - now;

    const isToday = dueDate.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toDateString() === dueDate.toDateString();

    const timeString = dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateString = dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    let text = '';
    let statusClass = '';

    if (diffMs < 0) {
      statusClass = 'due-overdue';
      text = `Atrasada (${isToday ? 'Hoje ' + timeString : dateString + ' ' + timeString})`;
    } else if (isToday) {
      statusClass = 'due-today';
      text = `Hoje às ${timeString}`;
    } else if (isTomorrow) {
      text = `Amanhã às ${timeString}`;
    } else {
      text = `${dateString} às ${timeString}`;
    }

    return { text, statusClass };
  }

  function renderDailyProgress() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;

    elements.progressCount.textContent = `${completed}/${total}`;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    elements.progressBarFill.style.width = `${percentage}%`;
  }

  function renderFilterDescription() {
    const totalFiltered = getFilteredAndSortedTasks().length;
    let desc = `Exibindo ${totalFiltered} ${totalFiltered === 1 ? 'tarefa' : 'tarefas'}`;

    if (state.filterCategory !== 'all') {
      const currentCat = state.categories.find(c => c.id === state.filterCategory);
      if (currentCat) {
        desc += ` em "${currentCat.name}"`;
      }
    }

    if (state.filterStatus === 'pending') {
      desc += ' (pendentes)';
    } else if (state.filterStatus === 'completed') {
      desc += ' (concluídas)';
    }

    if (state.searchQuery) {
      desc += ` para "${state.searchQuery}"`;
    }

    elements.activeFilterDesc.textContent = desc;
  }

  // ============================================================
  // Lembretes e Sintetizador Web Audio
  // ============================================================
  function initNotificationPermissionUI() {
    if (!('Notification' in window)) {
      elements.notificationBanner.classList.add('hidden');
      return;
    }

    if (Notification.permission === 'default') {
      elements.notificationBanner.classList.remove('hidden');
    } else {
      elements.notificationBanner.classList.add('hidden');
    }
  }

  function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('Seu navegador não suporta notificações nativas.', 'info');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('Notificações ativadas com sucesso!');
        elements.notificationBanner.classList.add('hidden');
      } else {
        showToast('Notificações não autorizadas.', 'info');
        elements.notificationBanner.classList.add('hidden');
      }
    });
  }

  function startReminderTicker() {
    checkDueReminders();
    setInterval(checkDueReminders, 30000);
  }

  function checkDueReminders() {
    if (!state.currentUser) return;
    const now = new Date();

    state.tasks.forEach(task => {
      if (!task.completed && task.reminder && task.dueDate && !task.notified) {
        const dueDate = new Date(task.dueDate);
        if (dueDate <= now) {
          triggerTaskReminder(task);
          task.notified = true;
          // Salvar status notificado no SQLite
          apiRequest(`/api/tasks/${task.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...task, notified: 1 })
          }).catch(() => {});
        }
      }
    });
  }

  function triggerTaskReminder(task) {
    playChime(880, 0.2);

    showToast(`⏰ Lembrete: "${task.title}" atingiu o horário programado!`, 'reminder');

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`⏰ Lembrete: ${task.title}`, {
          body: task.desc || 'Sua tarefa está agendada para agora.',
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230284c7%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polygon points=%2213 2 3 14 12 14 11 22 21 10 12 10 13 2%22/></svg>'
        });
        notif.onclick = () => window.focus();
      } catch (err) {}
    }
  }

  function playChime(freq = 587.33, duration = 0.15) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'reminder' ? 'toast-reminder' : ''}`;
    
    let icon = SVGS.checkCircle;
    if (type === 'reminder') icon = SVGS.bell;
    if (type === 'error') icon = SVGS.priorityHigh;

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 260);
    }, 3500);
  }

  // ============================================================
  // Event Listeners
  // ============================================================
  function bindEvents() {
    // Autenticação: Abas
    elements.tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
    elements.tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));

    // Autenticação: Alternar visualização da senha
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
          if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
          } else {
            input.type = 'password';
            btn.textContent = '👁️';
          }
        }
      });
    });

    // Submissão dos Formulários de Autenticação
    elements.loginForm.addEventListener('submit', handleLoginSubmit);
    elements.registerForm.addEventListener('submit', handleRegisterSubmit);

    // Logout
    elements.logoutBtn.addEventListener('click', () => {
      closeUserDropdown();
      handleLogout();
    });

    // Tema
    if (elements.themeLightBtn) {
      elements.themeLightBtn.addEventListener('click', () => applyTheme('light'));
    }
    if (elements.themeDarkBtn) {
      elements.themeDarkBtn.addEventListener('click', () => applyTheme('dark'));
    }

    // Menu do Usuário
    elements.userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleUserDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!elements.userMenuBtn.contains(e.target) && !elements.userDropdown.contains(e.target)) {
        closeUserDropdown();
      }
    });

    // Modais de Perfil
    elements.openProfileModalBtn.addEventListener('click', openProfileModal);
    elements.closeProfileModalBtn.addEventListener('click', () => elements.profileModal.close());
    elements.cancelProfileBtn.addEventListener('click', () => elements.profileModal.close());
    elements.profilePhotoInput.addEventListener('change', handleProfilePhotoUpload);
    elements.removePhotoBtn.addEventListener('click', handleRemoveProfilePhoto);
    elements.profileForm.addEventListener('submit', handleProfileFormSubmit);

    // Modal de Categorias
    elements.openCategoriesModalBtn.addEventListener('click', openCategoriesModal);
    elements.quickManageCatBtn.addEventListener('click', openCategoriesModal);
    elements.closeCategoriesModalBtn.addEventListener('click', () => elements.categoriesModal.close());
    elements.doneCategoriesBtn.addEventListener('click', () => elements.categoriesModal.close());
    elements.addCategoryForm.addEventListener('submit', handleAddCategorySubmit);

    // Modal de Tarefa
    elements.openNewTaskModalBtn.addEventListener('click', openCreateModal);
    elements.emptyCreateBtn.addEventListener('click', openCreateModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelModalBtn.addEventListener('click', closeModal);
    elements.taskForm.addEventListener('submit', handleFormSubmit);

    // Fechar modais com clique fora
    [elements.taskModal, elements.profileModal, elements.categoriesModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
      });
    });

    // Filtros de Status
    elements.statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.statusPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterStatus = pill.dataset.status;
        render();
      });
    });

    // Busca
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      if (state.searchQuery) {
        elements.clearSearchBtn.classList.remove('hidden');
      } else {
        elements.clearSearchBtn.classList.add('hidden');
      }
      render();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      elements.clearSearchBtn.classList.add('hidden');
      elements.searchInput.focus();
      render();
    });

    // Ordenação
    elements.sortBySelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      render();
    });

    // Permissão de Notificações
    elements.enableNotificationsBtn.addEventListener('click', requestNotificationPermission);
    elements.dismissNotificationsBtn.addEventListener('click', () => {
      elements.notificationBanner.classList.add('hidden');
    });

    // Atalhos Globais
    document.addEventListener('keydown', (e) => {
      if (!state.currentUser) return; // Apenas atalhos se logado
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isTyping = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      const anyModalOpen = [elements.taskModal, elements.profileModal, elements.categoriesModal].some(m => m.open);

      if ((e.key === 'n' || e.key === 'N') && !isTyping && !anyModalOpen) {
        e.preventDefault();
        openCreateModal();
        return;
      }

      if (e.key === '/' && !isTyping && !anyModalOpen) {
        e.preventDefault();
        elements.searchInput.focus();
        return;
      }

      if (e.key === 'Escape') {
        closeUserDropdown();
        if (elements.taskModal.open) elements.taskModal.close();
        if (elements.profileModal.open) elements.profileModal.close();
        if (elements.categoriesModal.open) elements.categoriesModal.close();
        if (document.activeElement === elements.searchInput) elements.searchInput.blur();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
