import { CompetitorPage, SEOBrief } from './entity.js';
import OpenAI from 'openai';

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
    const html = await response.text();
    // Простейшее извлечение данных (можешь улучшить регулярками)
    // Пока отдадим пустые значения, основную работу сделает ИИ
    return {
      url,
      title: '',
      metaDescription: '',
      h1: '',
      headings: [],
      wordCount: 0,
      topKeywords: []
    };
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
    const systemPrompt = 'Ты — SEO-эксперт. Верни строго JSON с полями: title, metaDescription, h1, wordCount (число), topKeywords (массив строк), headings (массив h2), hasCanonical (boolean).)';
    const userPrompt = `Ключевая фраза: "${keyword}". Данные конкурентов: ${JSON.stringify(pages)}. Верни JSON с полями: recommendedVolume, structure, topics, keywords.`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    });
    const jsonText = completion.choices[0]?.message?.content || '';
    return JSON.parse(jsonText);
  }
}

// Репозиторий для хранения истории
export class BriefRepository {
  async save(brief: SEOBrief): Promise<void> {
    const fs = await import('fs/promises');
    const filename = `brief-${brief.targetKeyword}.json`;
    await fs.writeFile(filename, JSON.stringify(brief, null, 2));
  }
}