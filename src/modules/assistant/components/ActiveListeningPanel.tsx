import { useState, useCallback, useEffect } from 'react';
// Comentar temporalmente la importación de useLangfuse hasta que esté disponible
// import { useLangfuse } from '@/core/hooks/useLangfuse';
// Importamos los componentes
import { Button, Card, Checkbox, Alert } from '@/components/ui';

/**
 * Representa una frase detectada durante la escucha activa
 */
interface DetectedPhrase {
  id: string;
  text: string;
  category?: 'Síntoma' | 'Diagnóstico' | 'Comentario';
  approved: boolean;
}

/**
 * Resultado de la validación de frases en la escucha activa
 */
interface ValidationResult {
  approvedPhrases: string[];
  rejectedPhrases: string[];
  traceId: string;
}

/**
 * Props para el componente de escucha activa
 */
interface ActiveListeningPanelProps {
  onPhrasesValidated: (result: ValidationResult) => void;
}

/**
 * Panel de escucha activa que permite identificar y validar frases
 * clínicamente relevantes durante una consulta
 */
export const ActiveListeningPanel: React.FC<ActiveListeningPanelProps> = ({
  onPhrasesValidated,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [detectedPhrases, setDetectedPhrases] = useState<DetectedPhrase[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  // Comentar temporalmente hasta que tengamos una implementación real
  // const { } = useLangfuse();

  // Simulación de detección de frases clínicas
  const mockPhrases = [
    { text: "Me duele el brazo derecho desde hace dos semanas", category: "Síntoma" as const },
    { text: "Tomo ibuprofeno dos veces al día", category: "Comentario" as const },
    { text: "Soy alérgico a la penicilina", category: "Diagnóstico" as const },
  ];

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      setIsListening(true);
      
      // Simulación de detección de frases
      const interval = setInterval(() => {
        if (detectedPhrases.length < mockPhrases.length) {
          const newPhrase = mockPhrases[detectedPhrases.length];
          setDetectedPhrases(prev => [...prev, {
            id: Date.now().toString(),
            text: newPhrase.text,
            category: newPhrase.category,
            approved: true
          }]);
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setIsListening(false);
    }
  }, [detectedPhrases.length]);

  const stopListening = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsListening(false);
  }, [mediaStream]);

  const togglePhraseApproval = (phraseId: string) => {
    setDetectedPhrases(prev =>
      prev.map(phrase =>
        phrase.id === phraseId
          ? { ...phrase, approved: !phrase.approved }
          : phrase
      )
    );
  };

  const approveAllPhrases = () => {
    setDetectedPhrases(prev =>
      prev.map(phrase => ({ ...phrase, approved: true }))
    );
  };

  const handleValidation = () => {
    const approvedPhrases = detectedPhrases
      .filter(phrase => phrase.approved)
      .map(phrase => phrase.text);
    
    const rejectedPhrases = detectedPhrases
      .filter(phrase => !phrase.approved)
      .map(phrase => phrase.text);

    onPhrasesValidated({
      approvedPhrases,
      rejectedPhrases,
      traceId: 'active-listening',
    });

    stopListening();
  };

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

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