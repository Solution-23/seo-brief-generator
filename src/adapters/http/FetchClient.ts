// src/adapters/http/FetchClient.ts
export class FetchClient {
  async get(url: string, timeoutMs: number = 10000): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getWithRetry(url: string, retries: number = 3): Promise<string> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await this.get(url);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }

  // Добавляем метод fetch для совместимости с JsDomParser
  async fetch(url: string): Promise<string> {
    return this.get(url);
  }
}
