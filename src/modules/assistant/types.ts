export interface VoicePhrase {
  id: string;
  text: string;
  isSelected: boolean;
  timestamp: string;
}

export interface CopilotSuggestion {
  field: 'chiefComplaint' | 'symptoms' | 'diagnosis' | 'treatmentPlan';
  text: string;
}

export interface CopilotAnalysis {
  suggestions: CopilotSuggestion[];
  confidence: number;
} 