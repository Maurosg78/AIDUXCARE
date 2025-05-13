declare namespace StructuredSuggestion {
  interface Suggestion {
    id: string;
    field: string;
    value: string;
    confidence: number;
    source: string;
  }
}
