import { CompetitorPage } from '../entities/CompetitorPage';

export interface CompetitorRepository {
  getTopUrls(keyword: string): Promise<string[]>;
}
