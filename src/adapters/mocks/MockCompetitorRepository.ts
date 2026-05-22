import { CompetitorRepository } from '../../core/ports/CompetitorRepository';

export class MockCompetitorRepository implements CompetitorRepository {
  async getTopUrls(keyword: string): Promise<string[]> {
    // Реальные рабочие URL для страниц смартфонов
    return [
      'https://www.wildberries.ru',
      'https://www.ozon.ru'
    ];
  }
}
