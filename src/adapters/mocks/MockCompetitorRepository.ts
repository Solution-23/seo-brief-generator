import { CompetitorRepository } from '../../core/ports/CompetitorRepository';

export class MockCompetitorRepository implements CompetitorRepository {
  async getTopUrls(keyword: string): Promise<string[]> {
    // URL, которые не блокируют парсинг
    return [
      'https://habr.com',
      'https://ru.wikipedia.org/wiki/IPhone'
    ];
  }
}
