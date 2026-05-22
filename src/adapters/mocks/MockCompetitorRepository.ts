import { CompetitorRepository } from '../../core/ports/CompetitorRepository';

export class MockCompetitorRepository implements CompetitorRepository {
  async getTopUrls(keyword: string): Promise<string[]> {
    // Реальные рабочие URL для страниц смартфонов
    return [
      'https://www.dns-shop.ru/catalog/17a8a01d16404e77/smartfony/',
      'https://www.mvideo.ru/smartfony-i-svyaz-10/smartfony-205'
    ];
  }
}
