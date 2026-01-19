
export interface Lead {
  id?: string;
  name: string;
  address: string;
  website: string;
  email?: string;
  phone?: string;
  category?: string;
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  ENRICHING = 'enriching',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ScrapeTask {
  id: string;
  query: string;
  maxResults: number;
  status: TaskStatus;
  progress: number;
  resultsCount: number;
  results: Lead[];
  createdAt: string;
  csvUrl?: string;
  error?: string;
}

export interface ScrapeRequest {
  query: string;
  maxResults: number;
}
