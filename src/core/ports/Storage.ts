import { SEOBriefExport } from '../entities/SEOBrief';

export interface Storage {
  save(brief: SEOBriefExport): Promise<void>;
  getHistory(keyword: string): Promise<SEOBriefExport[]>;
}
