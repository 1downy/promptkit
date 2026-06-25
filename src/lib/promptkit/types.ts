export type ModelCategory = 'text' | 'image' | 'video' | 'vision' | 'code' | '3d' | 'character' | 'audio' | 'design' | 'embedding' | 'moderation' | 'world';
export type ModelEcosystem = 'western' | 'chinese' | 'open-weight';

export interface SourceRef {
  title: string;
  url?: string;
  type: 'docs' | 'whitepaper' | 'blog' | 'github' | 'model-card' | 'guide' | 'api-reference' | 'news' | 'analysis';
  date?: string;
}

export interface SystemPromptEntry {
  id: string;
  modelName: string;
  category: ModelCategory;
  ecosystem: ModelEcosystem;
  provider: string;
  description: string;
  systemPrompt: string;
  shortVersion: string;
  sources: SourceRef[];
  tips: string[];
  lastVerified: string;
  version: string;
}
