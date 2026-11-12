/**
 * FocusTask — SQLite Database Layer
 * Utiliza o módulo nativo node:sqlite (Node.js 22.5+) e node:crypto
 * Zero dependências externas
 */

const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');

// Caminho do arquivo SQLite
const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new DatabaseSync(DB_PATH);

// Ativar chaves estrangeiras e modo WAL para alta performance
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Inicialização das Tabelas
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      desc TEXT DEFAULT '',
      category_id TEXT NOT NULL,
      priority TEXT NOT NULL,
      due_date TEXT DEFAULT '',
      reminder INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      notified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  `);
}

initDatabase();

// ============================================================
// Utilitários de Criptografia e Senha
// ============================================================
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  // Utiliza scrypt com parâmetros seguros
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password, salt, storedHash) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

// ============================================================
// Métodos de Usuário & Sessão
// ============================================================
function registerUser(name, email, password) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw new Error('E-mail já cadastrado no sistema.');
  }

  const userId = 'usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  // Inserir usuário
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, salt, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, '', ?)
  `);
  insertUser.run(userId, name, email, hash, salt, now);

  // Criar categorias iniciais para o novo usuário
  const defaultCategories = [
    { id: 'cat_trab_' + userId, name: 'Trabalho', color: '#0284c7', icon: 'briefcase' },
    { id: 'cat_casa_' + userId, name: 'Casa', color: '#059669', icon: 'home' },
    { id: 'cat_esco_' + userId, name: 'Escola', color: '#d97706', icon: 'book' },
    { id: 'cat_comp_' + userId, name: 'Compras', color: '#e11d48', icon: 'cart' }
  ];

  const insertCat = db.prepare(`
    INSERT INTO categories (id, user_id, name, color, icon, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const cat of defaultCategories) {
    insertCat.run(cat.id, userId, cat.name, cat.color, cat.icon, now);
  }

  // Criar 2 tarefas acolhedoras de exemplo para o novo painel
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, user_id, title, desc, category_id, priority, due_date, reminder, completed, notified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const todayEvening = new Date(Date.now() + 6 * 3600000).toISOString().slice(0, 16);
  insertTask.run(
    'tsk_welcome_' + userId,
    userId,
    'Bem-vindo ao FocusTask! 🎉',
    'Explore seus recursos: crie tarefas, personalize categorias e ative lembretes com som.',
    defaultCategories[0].id,
    'high',
    todayEvening,
    1,
    0,
    0,
    now
  );

  // Criar sessão de autenticação
  const token = createSession(userId);

  return {
    token,
    user: { id: userId, name, email, avatar: '' }
  };
}

function loginUser(email, password) {
  const user = db.prepare('SELECT id, name, email, password_hash, salt, avatar FROM users WHERE email = ?').get(email);
  if (!user) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const isValid = verifyPassword(password, user.salt, user.password_hash);
  if (!isValid) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const token = createSession(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || ''
    }
  };
}

function createSession(userId) {
  const token = 'tok_' + crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 dias

  const insertSession = db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `);
  insertSession.run(token, userId, now.toISOString(), expiresAt);

  return token;
}

function getUserByToken(token) {
  if (!token) return null;

  const session = db.prepare(`
    SELECT s.user_id, s.expires_at, u.name, u.email, u.avatar
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
  `).get(token);

  if (!session) return null;

  // Verificar se a sessão expirou
  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return {
    id: session.user_id,
    name: session.name,
    email: session.email,
    avatar: session.avatar || ''
  };
}

function logoutSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

function updateUserProfile(userId, name, email, avatar = null) {
  if (avatar !== null) {
    db.prepare('UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?')
      .run(name, email, avatar, userId);
  } else {
    db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
      .run(name, email, userId);
  }

  return db.prepare('SELECT id, name, email, avatar FROM users WHERE id = ?').get(userId);
}

// ============================================================
// Métodos de Categorias (Por Usuário)
// ============================================================
function getUserCategories(userId) {
  return db.prepare('SELECT id, name, color, icon FROM categories WHERE user_id = ? ORDER BY created_at ASC')
    .all(userId);
}

function createCategory(userId, name, color, icon) {
  const id = 'cat_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO categories (id, user_id, name, color, icon, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, name, color, icon, now);

  return { id, name, color, icon };
}

function deleteCategory(userId, categoryId) {
  // Evitar deletar se for a única categoria do usuário
  const total = db.prepare('SELECT COUNT(*) as count FROM categories WHERE user_id = ?').get(userId);
  if (total.count <= 1) {
    throw new Error('Você deve manter pelo menos uma categoria.');
  }

  db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(categoryId, userId);
}

// ============================================================
// Métodos de Tarefas (Por Usuário)
// ============================================================
function getUserTasks(userId) {
  const rows = db.prepare(`
    SELECT id, title, desc, category_id as category, priority, due_date as dueDate,
           reminder, completed, notified, created_at as createdAt
    FROM tasks
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);

  return rows.map(t => ({
    ...t,
    reminder: Boolean(t.reminder),
    completed: Boolean(t.completed),
    notified: Boolean(t.notified)
  }));
}

function createTask(userId, task) {
  const id = 'tsk_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO tasks (id, user_id, title, desc, category_id, priority, due_date, reminder, completed, notified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    task.title.trim(),
    (task.desc || '').trim(),
    task.category,
    task.priority || 'medium',
    task.dueDate || '',
    task.reminder ? 1 : 0,
    0,
    0,
    now
  );

  return {
    id,
    title: task.title.trim(),
    desc: (task.desc || '').trim(),
    category: task.category,
    priority: task.priority || 'medium',
    dueDate: task.dueDate || '',
    reminder: Boolean(task.reminder),
    completed: false,
    notified: false,
    createdAt: now
  };
}

function updateTask(userId, taskId, task) {
  db.prepare(`
    UPDATE tasks
    SET title = ?, desc = ?, category_id = ?, priority = ?, due_date = ?, reminder = ?, completed = ?, notified = ?
    WHERE id = ? AND user_id = ?
  `).run(
    task.title.trim(),
    (task.desc || '').trim(),
    task.category,
    task.priority,
    task.dueDate || '',
    task.reminder ? 1 : 0,
    task.completed ? 1 : 0,
    task.notified ? 1 : 0,
    taskId,
    userId
  );
}

function deleteTask(userId, taskId) {
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(taskId, userId);
}

module.exports = {
  registerUser,
  loginUser,
  getUserByToken,
  logoutSession,
  updateUserProfile,
  getUserCategories,
  createCategory,
  deleteCategory,
  getUserTasks,
  createTask,
  updateTask,
  deleteTask
};
