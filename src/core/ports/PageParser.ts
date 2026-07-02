import { CompetitorPage } from '../entities/CompetitorPage';

export interface PageParser {
  parse(url: string): Promise<CompetitorPage>;
}
