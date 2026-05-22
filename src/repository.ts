import { CompetitorPage, SEOBrief } from './entities.js';
import OpenAI from 'openai';
import { JSDOM } from 'jsdom'; // Для парсинга HTML

// Пока будет мок для поиска (позже Яндекс API)
export class SearchRepository {
  async getTopUrls(keyword: string): Promise<string[]> {
    // Заглушка: возвращаем несколько тестовых URL
    return [
      'https://example.com/seo',
      'https://example2.com/seo-tips'
    ];
  }
}

// Парсер страниц (скачивает HTML и отдаёт сырые данные)
export class PageParserRepository {
  async parse(url: string): Promise<CompetitorPage> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Не удалось загрузить страницу: ${response.statusText}`);
    }
    const html = await response.text();

    // Парсим HTML с помощью JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    return {
      url,
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      h1: document.querySelector('h1')?.textContent || '',
      headings: Array.from(document.querySelectorAll('h2')).map(h => h.textContent || ''),
      wordCount: this.countWords(document.body.textContent || ''),
      topKeywords: [] // TODO: Добавить логику извлечения ключевых слов
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }
}

// Репозиторий для работы с ИИ (используем OpenAI)
export class AIRepository {
  private client: OpenAI;
  constructor(apiKey: string) {
    this.client = new OpenAI({
      baseURL: 'https://api.polza.ai/v1',
      apiKey: apiKey,
    });
  }

  async generateBrief(pages: CompetitorPage[], keyword: string): Promise<SEOBrief> {
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
      model: 'gpt-4o-mini',
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
      return brief;
    } catch (e) {
      console.error('Не удалось распарсить ответ нейросети:', jsonText);
      throw new Error('Нейросеть вернула невалидный JSON');
    }
  }
}

// Репозиторий для хранения истории
export class BriefRepository {
  async save(brief: SEOBrief): Promise<void> {
    const fs = await import('fs/promises');
    const filename = `brief-${brief.targetKeyword}.json`;
    await fs.writeFile(filename, JSON.stringify(brief, null, 2));
    console.log(`💾 Бриф сохранён в файл: ${filename}`);
  }
}
