import { JSDOM } from 'jsdom';
import { PageParser } from '../../core/ports/PageParser';
import { CompetitorPage } from '../../core/entities/CompetitorPage';
import { FetchClient } from '../http/FetchClient';

export class CheerioParser implements PageParser {
  constructor(private readonly fetchClient: FetchClient) {}

  async parse(url: string): Promise<CompetitorPage> {
    const html = await this.fetchClient.get(url);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Извлекаем текст из параграфов (p, li, span и т.д.)
    const paragraphs = Array.from(document.querySelectorAll('p, li, span'))
      .map(el => el.textContent?.trim() || '')
      .filter(text => text.length > 20); // Фильтруем короткие строки

    return {
      url,
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim() || ''),
      h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim() || ''),
      paragraphs,
      wordCount: this.countWords(document.body.textContent || ''),
      topKeywords: [] // TODO: Добавить логику извлечения ключевых слов
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }
}
