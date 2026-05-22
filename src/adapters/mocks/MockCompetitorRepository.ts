import { CompetitorRepository } from '../../core/ports/CompetitorRepository';

export class MockCompetitorRepository implements CompetitorRepository {
  async getTopUrls(keyword: string): Promise<string[]> {
    // Моковые данные
    return [
      'https://example.com/seo',
      'https://example2.com/seo-tips'
    ];
  }
}
