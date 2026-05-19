export interface CompetitorPage {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  headings: string[];
  wordCount: number;
  topKeywords: string[];
}

export interface SEOBrief {
  targetKeyword: string;
  recommendedVolume: number;
  structure: {
    h1: string;
    h2: string[];
    h3: string[];
  };
  topics: string[];
  keywords: string[];
  competitorsAnalysis: CompetitorPage[];
  generatedAt: string;
}