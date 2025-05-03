export interface CopilotFeedback {
  field: string;
  value: string | string[];
  source: 'voice' | 'text';
  timestamp: string;
  approved?: boolean;
} 