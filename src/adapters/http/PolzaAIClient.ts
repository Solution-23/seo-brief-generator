import { AIService } from '../../core/ports/AIService';
import { SEOBrief, CompetitorPage } from '../../core/entities'; // через index.ts
import { validateBrief } from '../../core/entities/functions';

export class PolzaAIClient implements AIService {
  private apiKey: string;
  private baseUrl = 'https://api.polza.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Меняем порядок параметров: сначала pages, потом keyword
  async generateBrief(pages: CompetitorPage[], keyword: string): Promise<SEOBrief> {
    // Формируем данные конкурентов для промпта
    const competitorData = pages.map(c => {
      return `URL: ${c.url}
Title: ${c.title}
H1: ${c.h1}
H2: ${c.h2.join(', ')}
H3: ${c.h3.join(', ')}
Keywords: ${c.topKeywords.join(', ')}`;
    }).join('\n\n');

    const prompt = `Ты — эксперт по SEO. На основе анализа страниц конкурентов по ключевому слову "${keyword}", создай структурированный SEO-бриф.

Анализ конкурентов:
${competitorData}

Верни строго JSON в следующем формате:
{
  "targetKeyword": "${keyword}",
  "recommendedVolume": число (рекомендуемый объем текста в словах),
  "structure": {
    "h1": "предлагаемый заголовок H1",
    "h2": ["предлагаемый H2", "еще H2", ...],
    "h3": ["предлагаемый H3", ...]
  },
  "topics": ["тема 1", "тема 2", ...],
  "keywords": ["ключевое слово 1", "ключевое слово 2", ...]
}

Не добавляй лишний текст, только JSON.`;

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Ошибка API Polza: ${response.status} ${response.statusText}${errorBody ? ` — ${errorBody}` : ''}`);
    }

    const data = await response.json();
    const jsonText = data.choices[0].message.content;

    let aiBrief: any;
    try {
      aiBrief = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`Не удалось распарсить JSON от AI: ${error}`);
    }

    // Собираем полный SEOBrief
    const brief: SEOBrief = {
      targetKeyword: aiBrief.targetKeyword || keyword,
      recommendedVolume: aiBrief.recommendedVolume || 1000,
      structure: {
        h1: aiBrief.structure?.h1 || '',
        h2: aiBrief.structure?.h2 || [],
        h3: aiBrief.structure?.h3 || [],
      },
      topics: aiBrief.topics || [],
      keywords: aiBrief.keywords || [],
      competitorsAnalysis: pages, // просто передаём все страницы конкурентов
      generatedAt: new Date().toISOString(),
    };

    // Валидация
    if (!validateBrief(brief)) {
      throw new Error('AI вернул невалидный бриф: отсутствуют обязательные поля');
    }

    return brief;
  }
}
