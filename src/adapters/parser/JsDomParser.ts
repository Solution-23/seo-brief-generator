import { JSDOM } from 'jsdom';
import { PageParser } from '../../core/ports/PageParser';
import { CompetitorPage } from '../../core/entities/CompetitorPage';
import { FetchClient } from '../http/FetchClient';

export class JsDomParser implements PageParser {
  private fetchClient: FetchClient;

  constructor(fetchClient: FetchClient) {
    this.fetchClient = fetchClient;
  }

  async parse(url: string): Promise<CompetitorPage> {
    const html = await this.fetchClient.fetch(url);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Заголовок страницы
    const title = document.querySelector('title')?.textContent || '';

    // Мета-описание
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Заголовки h1
    const h1 = document.querySelector('h1')?.textContent || '';

    // Заголовки h2
    const h2Elements = document.querySelectorAll('h2');
    const h2 = Array.from(h2Elements).map(el => el.textContent || '').filter(text => text.length > 0);

    // Заголовки h3
    const h3Elements = document.querySelectorAll('h3');
    const h3 = Array.from(h3Elements).map(el => el.textContent || '').filter(text => text.length > 0);

    // Абзацы
    const pElements = document.querySelectorAll('p');
    const paragraphs = Array.from(pElements).map(el => el.textContent || '').filter(text => text.length > 0);

    // Полный текст для подсчёта слов
    const fullText = document.body?.textContent || '';
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;

    // Извлечение ключевых слов
    const topKeywords = this.extractKeywords(fullText);

    return {
      url,
      title,
      metaDescription,
      h1,
      h2,
      h3,
      paragraphs,
      wordCount,
      topKeywords,
    };
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().match(/[а-яёa-z]{4,}/g) || [];
    const stopWords = [
      'это', 'также', 'который', 'может', 'быть', 'есть', 'всё',
      'всего', 'более', 'менее', 'такой', 'какой', 'очень', 'нужно',
      'можно', 'нельзя', 'однако', 'поэтому', 'потому', 'между',
      'через', 'после', 'before', 'after', 'with', 'that', 'this',
      'from', 'have', 'been', 'will', 'your', 'their', 'about',
    ];

    const filtered = words.filter(w => !stopWords.includes(w));
    const counts: Record<string, number> = {};

    filtered.forEach(word => {
      counts[word] = (counts[word] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
}
