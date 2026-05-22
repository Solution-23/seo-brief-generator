import { GenerateBriefUseCase } from './use-case.js';
import { SearchRepository, PageParserRepository, AIRepository, BriefRepository } from './repository.js';

// API-ключ — берём из переменной окружения
const POLZA_API_KEY = process.env.POLZA_API_KEY;
if (!POLZA_API_KEY) {
  throw new Error('❌ Не задан POLZA_API_KEY. Создай файл .env с ключом.');
}

// Создаём все репозитории
const searchRepo = new SearchRepository();
const parserRepo = new PageParserRepository();
const aiRepo = new AIRepository(POLZA_API_KEY);
const briefRepo = new BriefRepository();

// Создаём UseCase и передаём ему зависимости
export const di = {
  useCase: new GenerateBriefUseCase(
    searchRepo,
    parserRepo,
    aiRepo,
    briefRepo,
    POLZA_API_KEY
  )
};
