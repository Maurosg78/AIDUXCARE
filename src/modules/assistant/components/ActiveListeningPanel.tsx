import { useState, useCallback, useEffect } from 'react';
// Nota: La integración con Langfuse se hará usando el cliente definido en src/core/lib/langfuse.client.ts
import { trackEvent } from '@/core/lib/langfuse.client';
// Importamos los componentes
import { Button, Card, Checkbox, Alert } from '@/components/ui';

/**
 * Categorías para las frases detectadas
 */
export type PhraseCategory = 'Síntoma' | 'Diagnóstico' | 'Comentario';

/**
 * Representa una frase detectada durante la escucha activa
 */
export interface DetectedPhrase {
  id: string;
  text: string;
  category?: PhraseCategory;
  approved: boolean;
  timestamp?: string;
}

/**
 * Resultado de la validación de frases en la escucha activa
 */
export interface ValidationResult {
  approvedPhrases: string[];
  rejectedPhrases: string[];
  traceId: string;
}

/**
 * Props para el componente de escucha activa
 */
export interface ActiveListeningPanelProps {
  /**
   * Callback invocado cuando el usuario valida las frases detectadas
   */
  onPhrasesValidated: (result: ValidationResult) => void;
  /**
   * ID de la visita asociada a esta sesión de escucha
   */
  visitId?: string;
  /**
   * ID del paciente asociado a esta sesión de escucha
   */
  patientId?: string;
}

/**
 * Panel de escucha activa que permite identificar y validar frases
 * clínicamente relevantes durante una consulta
 */
export const ActiveListeningPanel: React.FC<ActiveListeningPanelProps> = ({
  onPhrasesValidated,
  visitId,
  patientId
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [detectedPhrases, setDetectedPhrases] = useState<DetectedPhrase[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [traceId, setTraceId] = useState<string>('');

  // Simulación de detección de frases clínicas
  const mockPhrases: Array<Omit<DetectedPhrase, 'id' | 'approved'>> = [
    { text: "Me duele el brazo derecho desde hace dos semanas", category: "Síntoma" },
    { text: "Tomo ibuprofeno dos veces al día", category: "Comentario" },
    { text: "Soy alérgico a la penicilina", category: "Diagnóstico" },
  ];

  /**
   * Iniciar la grabación de audio y detección de frases
   */
  const startListening = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      setIsListening(true);
      
      // Crear un traceId para esta sesión de escucha
      const newTraceId = `listen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setTraceId(newTraceId);
      
      // Trackear el inicio de la escucha
      await trackEvent({
        name: 'audio.session.start',
        payload: {
          patientId,
          visitId,
          deviceInfo: navigator.userAgent
        },
        traceId: newTraceId
      });
      
      // Simulación de detección de frases
      const interval = setInterval(() => {
        if (detectedPhrases.length < mockPhrases.length) {
          const newPhrase = mockPhrases[detectedPhrases.length];
          const phrase: DetectedPhrase = {
            id: `phrase-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            text: newPhrase.text,
            category: newPhrase.category,
            approved: true,
            timestamp: new Date().toISOString()
          };
          
          setDetectedPhrases(prev => [...prev, phrase]);
          
          // Trackear la detección de frase
          trackEvent({
            name: 'audio.phrase.detected',
            payload: {
              phraseId: phrase.id,
              text: phrase.text,
              category: phrase.category
            },
            traceId: newTraceId
          });
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setIsListening(false);
      
      // Trackear el error
      trackEvent({
        name: 'audio.session.error',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error',
          patientId,
          visitId
        }
      });
    }
  }, [detectedPhrases.length, patientId, visitId]);

  /**
   * Detener la grabación de audio
   */
  const stopListening = useCallback((): void => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsListening(false);
    
    // Trackear el fin de la sesión
    if (traceId) {
      trackEvent({
        name: 'audio.session.end',
        payload: {
          patientId,
          visitId,
          phraseCount: detectedPhrases.length
        },
        traceId
      });
    }
  }, [mediaStream, traceId, detectedPhrases.length, patientId, visitId]);

  /**
   * Alternar la aprobación de una frase
   */
  const togglePhraseApproval = (phraseId: string): void => {
    setDetectedPhrases(prev =>
      prev.map(phrase =>
        phrase.id === phraseId
          ? { ...phrase, approved: !phrase.approved }
          : phrase
      )
    );
  };

  /**
   * Aprobar todas las frases detectadas
   */
  const approveAllPhrases = (): void => {
    setDetectedPhrases(prev =>
      prev.map(phrase => ({ ...phrase, approved: true }))
    );
  };

  /**
   * Validar las frases y enviar a callback
   */
  const handleValidation = (): void => {
    const approvedPhrases = detectedPhrases
      .filter(phrase => phrase.approved)
      .map(phrase => phrase.text);
    
    const rejectedPhrases = detectedPhrases
      .filter(phrase => !phrase.approved)
      .map(phrase => phrase.text);

    // Trackear la validación
    if (traceId) {
      trackEvent({
        name: 'audio.review',
        payload: {
          patientId,
          visitId,
          approved: approvedPhrases.length > 0,
          approvedCount: approvedPhrases.length,
          rejectedCount: rejectedPhrases.length
        },
        traceId
      });
    }

    onPhrasesValidated({
      approvedPhrases,
      rejectedPhrases,
      traceId
    });

    stopListening();
  };

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  // Pantalla de consentimiento
  if (!hasConsent) {
    return (
      <Card className="p-4">
        <Alert type="warning" className="mb-4">
          Para activar la escucha clínica, se requiere su consentimiento explícito.
          El audio será procesado localmente y solo se guardarán las frases clínicas relevantes.
        </Alert>
        <Button
          onClick={() => setHasConsent(true)}
          className="w-full"
        >
          🎤 Dar consentimiento para escucha clínica
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm">
            {isListening ? 'Escuchando...' : 'Micrófono inactivo'}
          </span>
        </div>
        {!isListening ? (
          <Button
            onClick={startListening}
            className="bg-blue-500 hover:bg-blue-600"
          >
            🎤 Activar escucha clínica
          </Button>
        ) : (
          <Button
            onClick={stopListening}
            className="bg-red-500 hover:bg-red-600"
          >
            🛑 Detener escucha
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {detectedPhrases.map(phrase => (
          <div key={phrase.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
            <Checkbox
              checked={phrase.approved}
              onChange={() => togglePhraseApproval(phrase.id)}
            />
            <div className="flex-1">
              <p className="text-sm">{phrase.text}</p>
              {phrase.category && (
                <span className="text-xs text-gray-500">
                  {phrase.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {detectedPhrases.length > 0 && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={approveAllPhrases}
            className="flex-1"
          >
            ✅ Aprobar todo
          </Button>
          <Button
            onClick={handleValidation}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            Guardar frases aprobadas
          </Button>
        </div>
      )}
    </Card>
  );
}; 