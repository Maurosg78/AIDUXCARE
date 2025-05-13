export interface ChecklistAudioItem {
  id: string;
  timestamp: string;
  audioUrl: string;
  duration: number;
  transcript?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    format: string;
    size: number;
    sampleRate: number;
    channels: number;
    [key: string]: unknown;
  };
} 