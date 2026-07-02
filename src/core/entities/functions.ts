import { SEOBrief } from './SEOBrief';

export function validateBrief(brief: any): brief is SEOBrief {
  return (
    brief &&
    typeof brief.targetKeyword === 'string' &&
    typeof brief.recommendedVolume === 'number' &&
    brief.structure &&
    typeof brief.structure.h1 === 'string' &&
    Array.isArray(brief.structure.h2) &&
    Array.isArray(brief.structure.h3) &&
    Array.isArray(brief.topics) &&
    Array.isArray(brief.keywords) &&
    Array.isArray(brief.competitorsAnalysis) &&
    typeof brief.generatedAt === 'string'
  );
}

// Оставляем оригинальный интерфейс, если он где-то используется
export interface CallBacks {
  onGenerate: (query: string) => void;
}
