import { SearchRepository, PageParserRepository, AIRepository, BriefRepository } from './repository';
import { SEOBrief } from './entities';

export class GenerateBriefUseCase {
  constructor(
    private readonly searchRepo: SearchRepository,
    private readonly parserRepo: PageParserRepository,
    private readonly aiRepo: AIRepository,
    private readonly briefRepo: BriefRepository,
    private readonly apiKey: string
  ) {}

  async execute(keyword: string): Promise<SEOBrief> {
    // 1. Получаем топовые URL по ключевому слову
    const topUrls = await this.searchRepo.getTopUrls(keyword);
    if (topUrls.length === 0) {
      throw new Error(`Не удалось найти URL для ключевого слова: ${keyword}`);
    }

    // 2. Парсим каждую страницу
    const pages = await Promise.all(
      topUrls.map(async (url) => await this.parserRepo.parse(url))
    );

    // 3. Генерируем бриф с помощью ИИ
    const brief = await this.aiRepo.generateBrief(pages, keyword);

    // 4. Сохраняем бриф
    await this.briefRepo.save(brief);

    return brief;
  }
}
