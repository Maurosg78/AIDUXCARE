import { useState, useCallback } from 'react';
import { trackEvent } from '@/core/services/langfuseClient';

interface PubMedReference {
  title: string;
  year: number;
  source: string;
  url: string;
  abstract?: string;
}

export interface StructuredSuggestion {
  field: string;
  value: string;
  source: "copilot";
  reference?: PubMedReference;
}

export function useCopilot() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPubMed = async (query: string): Promise<PubMedReference | undefined> => {
    try {
      const response = await fetch(`/api/clinical-search/pubmed?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error en búsqueda PubMed');
      
      const data = await response.json();
      return data.results[0] || undefined;
    } catch (error) {
      console.error('Error buscando en PubMed:', error);
      return undefined;
    }
  };

  const analyzeVoiceNotes = useCallback(async (notes: string[]): Promise<StructuredSuggestion[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Aquí iría tu lógica existente de análisis de notas
      const suggestions: StructuredSuggestion[] = [];
      
      // Para cada sugerencia relevante, buscar en PubMed
      for (const note of notes) {
        // Ejemplo: si la nota contiene términos clínicos relevantes
        if (note.toLowerCase().includes('tratamiento') || 
            note.toLowerCase().includes('diagnóstico') ||
            note.toLowerCase().includes('terapia')) {
          
          const reference = await searchPubMed(note);
          
          suggestions.push({
            field: 'observaciones',
            value: note,
            source: 'copilot',
            reference
          });
        }
      }

      // Registrar evento con referencias
      await trackEvent({
        name: 'copilot.suggestions',
        payload: {
          suggestionsCount: suggestions.length,
          hasReferences: suggestions.some(s => !!s.reference),
          referencesUrls: suggestions
            .filter(s => s.reference)
            .map(s => s.reference?.url)
            .filter((url): url is string => !!url)
            .join(',')
        }
      });

      return suggestions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analyzeVoiceNotes,
    isLoading,
    error
  };
} 