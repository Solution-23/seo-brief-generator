import { CompetitorPage, SEOBrief } from '../entities';

export interface AIService {
  generateBrief(
    pages: CompetitorPage[],
    keyword: string
  ): Promise<SEOBrief>;
}
