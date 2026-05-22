import OpenAI from 'openai';
import { AIService } from '../../core/ports/AIService';
import { CompetitorPage, SEOBrief } from '../../core/entities';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export class PolzaAIClient implements AIService {
  private client: OpenAI;

  constructor(private readonly apiKey: string) {
    this.client = new OpenAI({
      baseURL: 'https://api.polza.ai/v1',
      apiKey: apiKey,
    });
  }

  async generateBrief(
    pages: CompetitorPage[],
    keyword: string
  ): Promise<SEOBrief> {
    const systemPrompt = `
      Ты — SEO-эксперт. Верни строго JSON с полями:
      - targetKeyword: строка
      - recommendedVolume: число
      - structure: {
          h1: строка,
          h2: массив строк,
          h3: массив строк
        }
      - topics: массив строк
      - keywords: массив строк
      - competitorsAnalysis: массив объектов CompetitorPage
      - generatedAt: строка (дата в ISO)
    `;

    const userPrompt = `
      Ключевая фраза: "${keyword}".
      Данные конкурентов: ${JSON.stringify(pages)}.
      Верни JSON с полями, указанными выше.
    `;

    const completion = await this.client.chat.completions.create({
      model: 'deepseek/deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    });

    const jsonText = completion.choices[0]?.message?.content || '';
    try {
      const brief = JSON.parse(jsonText) as SEOBrief;
      brief.generatedAt = new Date().toISOString();

      // Сохраняем бриф в файл
      await this.saveBriefToMarkdown(brief);

      return brief;
    } catch (e) {
      console.error('Ошибка парсинга ответа AI:', jsonText);
      throw new Error('AI вернул невалидный JSON');
    }
  }

  private async saveBriefToMarkdown(brief: SEOBrief): Promise<void> {
    const dir = 'briefs';
    await mkdir(dir, { recursive: true });

    const filename = join(dir, `${brief.targetKeyword}.md`);
    const markdown = this.formatBriefToMarkdown(brief);

    await writeFile(filename, markdown);
    console.log(`📄 Бриф сохранён в файл: ${filename}`);
  }

  private formatBriefToMarkdown(brief: SEOBrief): string {
    return `# SEO Бриф для "${brief.targetKeyword}"\n\n` +
      `## Дата генерации\n${new Date(brief.generatedAt).toLocaleString('ru-RU')}\n\n` +
      `## Рекомендуемый объём\n${brief.recommendedVolume} слов\n\n` +
      `## Структура страницы\n\n### H1\n${brief.structure.h1}\n\n### H2\n${brief.structure.h2.map(h2 => `- ${h2}`).join('\n')}\n\n### H3\n${brief.structure.h3.map(h3 => `  - ${h3}`).join('\n')}\n\n## Темы для статьи\n${brief.topics.map(topic => `- ${topic}`).join('\n')}\n\n## Ключевые слова\n${brief.keywords.map(keyword => `- ${keyword}`).join('\n')}\n\n## Анализ конкурентов\n${brief.competitorsAnalysis.map((page, i) =>
      `### Конкурент #${i + 1}\n- URL: ${page.url}\n- Длина текста: ${page.wordCount} слов\n- Заголовки: ${page.headings.join(', ')}`
    ).join('\n\n')}`;
  }
}
