import OpenAI from 'openai';
import { AIService } from '../../core/ports/AIService';
import { CompetitorPage, SEOBrief } from '../../core/entities';

export class PolzaAIClient implements AIService {
  private client: OpenAI;

  constructor(apiKey: string) {
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
      return brief;
    } catch (e) {
      console.error('Ошибка парсинга ответа AI:', jsonText);
      throw new Error('AI вернул невалидный JSON');
    }
  }
}
