import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface Order {
  id: string;
  studentName: string;
  shirtName: string;
  number: number;
  size: string;
  createdAt: string;
}

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data folder and initial file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadOrders(): Order[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return [];
}

function saveOrders(orders: Order[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving orders file:', err);
    return false;
  }
}

// In-memory cache synced with disk
let orders: Order[] = loadOrders();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), totalOrders: orders.length });
});

// Database connection simulated ping
app.get('/api/db-connect', (req, res) => {
  // Simulates real database handshake & integrity check
  res.json({
    connected: true,
    dbName: 'interclasse_2026_db',
    class: '7° ano Japão (Coreia do Sul)',
    totalNumbers: 100,
    reservedCount: orders.length,
    availableCount: 100 - orders.length,
  });
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { studentName, shirtName, number, size } = req.body;

  if (!studentName || !shirtName || !number || !size) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const num = parseInt(number, 10);
  if (isNaN(num) || num < 1 || num > 100) {
    return res.status(400).json({ error: 'O número da camisa deve ser entre 1 e 100.' });
  }

  // Check if number is already taken
  const existing = orders.find((o) => o.number === num);
  if (existing) {
    return res.status(409).json({
      error: `O número ${num} já foi escolhido por outra pessoa e está bloqueado (proibido).`,
      takenBy: existing.shirtName,
    });
  }

  const newOrder: Order = {
    id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    studentName: studentName.trim(),
    shirtName: shirtName.trim().toUpperCase(),
    number: num,
    size: size.trim(),
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  saveOrders(orders);

  res.status(201).json({ success: true, order: newOrder });
});

// Admin Security Management
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'D23').trim();
const activeSessions = new Set<string>();

// Simple anti brute-force protection
const failedAttempts: { count: number; lockedUntil: number } = {
  count: 0,
  lockedUntil: 0,
};

function isAuthorized(key?: string | string[]): boolean {
  if (!key || typeof key !== 'string') return false;
  const cleaned = key.trim();
  return cleaned === ADMIN_PASSWORD || activeSessions.has(cleaned);
}

// Secure Login Endpoint (No secret exposed to client source code)
app.post('/api/admin/login', (req, res) => {
  const now = Date.now();

  if (now < failedAttempts.lockedUntil) {
    const remainingSeconds = Math.ceil((failedAttempts.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Muitas tentativas incorretas. Painel bloqueado temporariamente por segurança (${remainingSeconds}s).`,
      locked: true,
      remainingSeconds,
    });
  }

  const { password } = req.body || {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Senha não informada.' });
  }

  if (password.trim() === ADMIN_PASSWORD) {
    // Reset failed counter
    failedAttempts.count = 0;
    failedAttempts.lockedUntil = 0;

    // Generate random session token
    const token = 'adm_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    activeSessions.add(token);

    // Limit active sessions size to 50
    if (activeSessions.size > 50) {
      const first = activeSessions.values().next().value;
      if (first) activeSessions.delete(first);
    }

    return res.json({ success: true, token });
  }

  // Failed attempt
  failedAttempts.count += 1;
  if (failedAttempts.count >= 5) {
    failedAttempts.lockedUntil = now + 45000; // 45s lockout
    return res.status(429).json({
      error: '5 tentativas inválidas consecutivas. Painel bloqueado por 45 segundos para proteção contra invasão.',
      locked: true,
      remainingSeconds: 45,
    });
  }

  return res.status(401).json({
    error: `Senha incorreta! Tentativa ${failedAttempts.count} de 5 antes do bloqueio temporário.`,
    remainingAttempts: 5 - failedAttempts.count,
  });
});

// Admin deletion
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const adminKey = req.headers['x-admin-key'];

  if (!isAuthorized(adminKey)) {
    return res.status(401).json({ error: 'Acesso não autorizado. Chave de administrador inválida.' });
  }

  const initialLength = orders.length;
  orders = orders.filter((o) => o.id !== id);

  if (orders.length === initialLength) {
    return res.status(404).json({ error: 'Inscrição não encontrada.' });
  }

  saveOrders(orders);
  res.json({ success: true, message: 'Inscrição removida e número liberado.' });
});

// Admin reset all orders (release all 100 numbers)
app.post('/api/admin/reset', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!isAuthorized(adminKey)) {
    return res.status(401).json({ error: 'Acesso não autorizado. Chave de administrador inválida.' });
  }
  orders = [];
  saveOrders(orders);
  res.json({ success: true, message: 'Todos os 100 números foram liberados e o banco de dados foi resetado.' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
