import { GenerateBriefUseCase } from '../core/use-cases/GenerateBriefUseCase';
import { CompetitorRepository } from '../core/ports/CompetitorRepository';
import { PageParser } from '../core/ports/PageParser';
import { AIService } from '../core/ports/AIService';
import { Storage } from '../core/ports/Storage';
import { MockCompetitorRepository } from '../adapters/mocks/MockCompetitorRepository';
import { JsDomParser } from '../adapters/parser/JsDomParser';
import { PolzaAIClient } from '../adapters/http/PolzaAIClient';
import { SQLiteStorage } from '../adapters/storage/SQLiteStorage';
import { FetchClient } from '../adapters/http/FetchClient';

export class DIContainer {
  private static instance: DIContainer;
  private useCase: GenerateBriefUseCase;

  private constructor() {
    const apiKey = process.env.POLZA_API_KEY;
    if (!apiKey) {
      throw new Error('❌ Укажите POLZA_API_KEY в .env');
    }

    const fetchClient = new FetchClient();
    const competitorRepo: CompetitorRepository = new MockCompetitorRepository();
    const pageParser: PageParser = new JsDomParser(fetchClient);
    const aiService: AIService = new PolzaAIClient(apiKey);
    const storage: Storage = new SQLiteStorage();

    this.useCase = new GenerateBriefUseCase(
      competitorRepo,
      pageParser,
      aiService,
      storage
    );
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  public getUseCase(): GenerateBriefUseCase {
    return this.useCase;
  }
}
