
export enum SummaryLength {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG'
}

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
}

export interface TimestampEntry {
  time: string;
  label: string;
}

export interface AnalysisResult {
  summary: string;
  takeaways: string[];
  timestamps: TimestampEntry[];
  sentiment: {
    score: number;
    label: string;
    description: string;
  };
  keywords: string[];
  script: string;
}

export interface GeneratedContent {
  blog: string;
  sns: {
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  newsletter: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ProjectFolder {
  id: string;
  name: string;
  videoIds: string[];
}
