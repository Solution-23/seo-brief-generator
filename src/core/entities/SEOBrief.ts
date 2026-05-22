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

export interface SEOBriefExport {
  markdown: string;
  json: SEOBrief;
}
