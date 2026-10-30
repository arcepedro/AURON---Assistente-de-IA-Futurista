import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  processAuronChat,
  getServerMemories,
  addServerMemory,
  deleteServerMemory,
  getServerTasks,
  addServerTask,
  updateServerTask,
  executeLocalTool,
} from './src/server/gemini.ts';
import { AURON_TOOLS_CATALOG, formatSystemTime } from './src/utils/tools.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  const startTime = Date.now();

  // API Endpoints

  // 1. Chat endpoint with AURON Gemini
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, model, userName, userHonorific } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Mensagem inválida ou ausente.' });
        return;
      }

      const response = await processAuronChat({
        message,
        model,
        userName,
        userHonorific,
      });

      res.json(response);
    } catch (err: any) {
      console.error('Erro na rota /api/chat:', err);
      res.status(500).json({
        error: 'Erro interno ao processar conversa com AURON.',
        details: err?.message || String(err),
      });
    }
  });

  // 2. Memory endpoints
  app.get('/api/memory', (req, res) => {
    try {
      const memories = getServerMemories();
      res.json({ success: true, count: memories.length, items: memories });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao recuperar memórias.' });
    }
  });

  app.post('/api/memory', (req, res) => {
    try {
      const { category, title, content, priority, tags } = req.body;
      if (!title || !content) {
        res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
        return;
      }
      const newMem = addServerMemory({
        category: category || 'historico',
        title,
        content,
        priority: priority || 'media',
        tags: tags || [],
      });
      res.status(201).json({ success: true, item: newMem });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao salvar memória.' });
    }
  });

  app.delete('/api/memory/:id', (req, res) => {
    try {
      const { id } = req.params;
      const success = deleteServerMemory(id);
      if (success) {
        res.json({ success: true, message: `Memória ${id} removida com sucesso.` });
      } else {
        res.status(404).json({ error: 'Memória não encontrada.' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao excluir memória.' });
    }
  });

  // 3. Tasks endpoints
  app.get('/api/tasks', (req, res) => {
    try {
      const tasks = getServerTasks();
      res.json({ success: true, count: tasks.length, items: tasks });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao recuperar tarefas.' });
    }
  });

  app.post('/api/tasks', (req, res) => {
    try {
      const { title, category, priority, details, status, progress } = req.body;
      if (!title) {
        res.status(400).json({ error: 'Título da tarefa é obrigatório.' });
        return;
      }
      const newTask = addServerTask({
        title,
        category: category || 'Geral',
        status: status || 'em_andamento',
        progress: typeof progress === 'number' ? progress : 0,
        priority: priority || 'media',
        details: details || '',
      });
      res.status(201).json({ success: true, item: newTask });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao criar tarefa.' });
    }
  });

  app.patch('/api/tasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updated = updateServerTask(id, req.body);
      if (updated) {
        res.json({ success: true, item: updated });
      } else {
        res.status(404).json({ error: 'Tarefa não encontrada.' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao atualizar tarefa.' });
    }
  });

  // 4. Tools catalog & Direct tool execution
  app.get('/api/tools', (req, res) => {
    res.json({ success: true, tools: AURON_TOOLS_CATALOG });
  });

  app.post('/api/tools/execute', (req, res) => {
    try {
      const { toolName, args } = req.body;
      if (!toolName) {
        res.status(400).json({ error: 'Nome da ferramenta ausente.' });
        return;
      }
      const result = executeLocalTool(toolName, args || {});
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao executar ferramenta.', details: err?.message });
    }
  });

  // 5. System status and telemetry
  app.get('/api/system/status', (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
    const memories = getServerMemories();
    const tasks = getServerTasks();
    const time = formatSystemTime();

    res.json({
      status: 'nominal',
      name: 'AURON Quantum OS',
      version: '1.0.4',
      modelEngine: hasApiKey ? 'Gemini 3.1 Flash-Lite (Ultra-Responsivo)' : 'Núcleo Neural Local (Standby)',
      hasApiKey,
      uptimeSeconds: uptime,
      latencyMs: 12,
      memoryCount: memories.length,
      activeTasksCount: tasks.filter((t) => t.status === 'em_andamento').length,
      activeToolsCount: AURON_TOOLS_CATALOG.filter((t) => t.isAvailable).length,
      totalToolsCount: AURON_TOOLS_CATALOG.length,
      systemTime: time,
      persistenceMode: 'Armazenamento de Memória Ativo (Servidor & Navegador)',
    });
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AURON OS iniciado com sucesso na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor AURON:', err);
  process.exit(1);
});
