import { CompetitorRepository } from '../ports/CompetitorRepository';
import { PageParser } from '../ports/PageParser';
import { AIService } from '../ports/AIService';
import { Storage } from '../ports/Storage';
import { SEOBriefExport, SEOBrief } from '../entities/SEOBrief';

export class GenerateBriefUseCase {
  constructor(
    private readonly competitorRepo: CompetitorRepository,
    private readonly pageParser: PageParser,
    private readonly aiService: AIService,
    private readonly storage: Storage
  ) {}

  async execute(keyword: string): Promise<SEOBriefExport> {
    // 1. Получаем топовые URL
    const urls = await this.competitorRepo.getTopUrls(keyword);
    if (urls.length === 0) {
      throw new Error(`Не найдены URL для ключевого слова: ${keyword}`);
    }

    // 2. Парсим страницы
    const pages = await Promise.all(
      urls.map(url => this.pageParser.parse(url))
    );

    // 3. Генерируем бриф через AI
    const brief = await this.aiService.generateBrief(pages, keyword);

    // 4. Экспортируем и сохраняем
    const exportData: SEOBriefExport = {
      markdown: this.toMarkdown(brief),
      json: brief
    };
    await this.storage.save(exportData);

    return exportData;
  }

  private toMarkdown(brief: SEOBrief): string {
    return `
# SEO-бриф для "${brief.targetKeyword}"

## Рекомендуемый объем: ${brief.recommendedVolume} слов

### Структура
- **H1**: ${brief.structure.h1}
- **H2**: ${brief.structure.h2.join(', ')}
- **H3**: ${brief.structure.h3.join(', ')}

### Темы
${brief.topics.map(t => `- ${t}`).join('\n')}

### Ключевые слова
${brief.keywords.map(k => `- ${k}`).join('\n')}

### Анализ конкурентов
${brief.competitorsAnalysis.map(c => `
#### ${c.title} (${c.url})
- **H1**: ${c.h1}
- **H2**: ${c.h2.join(', ')}
- **Слов**: ${c.wordCount}
`).join('\n')}
`.trim();
  }
}
