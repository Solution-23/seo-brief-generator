import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DIContainer } from './di/container';

dotenv.config();

// Папка для SQLite/JSON хранилища — та же, что использует CLI-режим (src/index.ts)
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const app = express();

// Разрешаем запросы с фронта (Next.js обычно крутится на localhost:3000)
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 1234;

// Проверка живости сервера
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Основной эндпоинт: генерация SEO-брифа по ключевому слову
// POST /zapros  { "keyword": "купить телефон" }
app.post('/zapros', async (req: Request, res: Response) => {
  const { keyword } = req.body ?? {};

  if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
    return res.status(400).json({ error: 'Параметр "keyword" обязателен и должен быть непустой строкой' });
  }

  try {
    const container = DIContainer.getInstance();
    const useCase = container.getUseCase();

    const brief = await useCase.execute(keyword.trim());

    return res.status(200).json(brief);
  } catch (error) {
    console.error('❌ Ошибка генерации брифа:', error);
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return res.status(500).json({ error: message });
  }
});

// 404 для незнакомых маршрутов
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Эндпоинт не найден' });
});

// Общий обработчик ошибок (на случай синхронных исключений в middleware)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Необработанная ошибка:', err);
  const message = err instanceof Error ? err.message : 'Внутренняя ошибка сервера';
  res.status(500).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`🚀 REST API запущен: http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/zapros  { "keyword": "..." }`);
});
