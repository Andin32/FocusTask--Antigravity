/**
 * FocusTask — HTTP Server & REST API
 * Desenvolvido em Node.js nativo (node:http, node:fs, node:path)
 * Banco de Dados SQLite integrado (database.js)
 * Zero dependências externas
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const db = require('./database.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Tipos MIME para arquivos estáticos
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// ============================================================
// Utilitários de Requisição & Resposta
// ============================================================
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Proteção contra payloads excessivamente grandes (ex: 5MB)
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload muito grande.'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(new Error('JSON inválido na requisição.'));
      }
    });
    req.on('error', reject);
  });
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return db.getUserByToken(token);
}

// ============================================================
// Servidor HTTP
// ============================================================
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Lidar com preflight OPTIONS (CORS)
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // ============================================================
  // ROTAS DE API (/api/...)
  // ============================================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Autenticação: Registrar
      if (pathname === '/api/auth/register' && method === 'POST') {
        const body = await parseJSONBody(req);
        if (!body.name || !body.email || !body.password) {
          return sendJSON(res, 400, { error: 'Nome, e-mail e senha são obrigatórios.' });
        }
        if (body.password.length < 6) {
          return sendJSON(res, 400, { error: 'A senha deve ter pelo menos 6 caracteres.' });
        }
        const result = db.registerUser(body.name.trim(), body.email.trim(), body.password);
        return sendJSON(res, 201, result);
      }

      // 2. Autenticação: Login
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseJSONBody(req);
        if (!body.email || !body.password) {
          return sendJSON(res, 400, { error: 'Informe e-mail e senha para entrar.' });
        }
        const result = db.loginUser(body.email.trim(), body.password);
        return sendJSON(res, 200, result);
      }

      // Middleware de Autenticação para todas as demais rotas da API
      const user = getAuthUser(req);
      if (!user) {
        return sendJSON(res, 401, { error: 'Sessão expirada ou não autenticado. Faça login novamente.' });
      }

      // 3. Autenticação: Obter Perfil Atual (Me)
      if (pathname === '/api/auth/me' && method === 'GET') {
        return sendJSON(res, 200, { user });
      }

      // 4. Autenticação: Logout
      if (pathname === '/api/auth/logout' && method === 'POST') {
        const token = req.headers['authorization'].slice(7).trim();
        db.logoutSession(token);
        return sendJSON(res, 200, { message: 'Desconectado com sucesso.' });
      }

      // 5. Autenticação: Atualizar Perfil
      if (pathname === '/api/auth/profile' && method === 'PUT') {
        const body = await parseJSONBody(req);
        if (!body.name || !body.email) {
          return sendJSON(res, 400, { error: 'Nome e e-mail são obrigatórios.' });
        }
        const updated = db.updateUserProfile(user.id, body.name.trim(), body.email.trim(), body.avatar);
        return sendJSON(res, 200, { user: updated });
      }

      // 6. Categorias: Listar
      if (pathname === '/api/categories' && method === 'GET') {
        const categories = db.getUserCategories(user.id);
        return sendJSON(res, 200, { categories });
      }

      // 7. Categorias: Criar
      if (pathname === '/api/categories' && method === 'POST') {
        const body = await parseJSONBody(req);
        if (!body.name || !body.color) {
          return sendJSON(res, 400, { error: 'Nome e cor da categoria são obrigatórios.' });
        }
        const newCat = db.createCategory(user.id, body.name.trim(), body.color, body.icon || 'tag');
        return sendJSON(res, 201, { category: newCat });
      }

      // 8. Categorias: Excluir
      if (pathname.startsWith('/api/categories/') && method === 'DELETE') {
        const categoryId = pathname.replace('/api/categories/', '');
        db.deleteCategory(user.id, categoryId);
        return sendJSON(res, 200, { message: 'Categoria excluída com sucesso.' });
      }

      // 9. Tarefas: Listar
      if (pathname === '/api/tasks' && method === 'GET') {
        const tasks = db.getUserTasks(user.id);
        return sendJSON(res, 200, { tasks });
      }

      // 10. Tarefas: Criar
      if (pathname === '/api/tasks' && method === 'POST') {
        const body = await parseJSONBody(req);
        if (!body.title || !body.title.trim()) {
          return sendJSON(res, 400, { error: 'O título da tarefa é obrigatório.' });
        }
        const newTask = db.createTask(user.id, body);
        return sendJSON(res, 201, { task: newTask });
      }

      // 11. Tarefas: Atualizar
      if (pathname.startsWith('/api/tasks/') && method === 'PUT') {
        const taskId = pathname.replace('/api/tasks/', '');
        const body = await parseJSONBody(req);
        if (!body.title || !body.title.trim()) {
          return sendJSON(res, 400, { error: 'O título da tarefa é obrigatório.' });
        }
        db.updateTask(user.id, taskId, body);
        return sendJSON(res, 200, { message: 'Tarefa atualizada com sucesso.' });
      }

      // 12. Tarefas: Excluir
      if (pathname.startsWith('/api/tasks/') && method === 'DELETE') {
        const taskId = pathname.replace('/api/tasks/', '');
        db.deleteTask(user.id, taskId);
        return sendJSON(res, 200, { message: 'Tarefa excluída com sucesso.' });
      }

      // Rota de API não encontrada
      return sendJSON(res, 404, { error: 'Endpoint da API não encontrado.' });
    } catch (err) {
      console.error('Erro na requisição da API:', err.message);
      return sendJSON(res, 400, { error: err.message || 'Erro interno do servidor.' });
    }
  }

  // ============================================================
  // SERVIR ARQUIVOS ESTÁTICOS (HTML, CSS, JS)
  // ============================================================
  let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);

  // Prevenção contra Directory Traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Acesso Negado');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback para index.html para SPA
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (errHtml, htmlContent) => {
          if (errHtml) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Não Encontrado');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(htmlContent);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Erro no Servidor');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`⚡ FocusTask rodando em http://localhost:${PORT}`);
  console.log(`📁 Banco de Dados SQLite: ${path.join(__dirname, 'database.sqlite')}`);
});
