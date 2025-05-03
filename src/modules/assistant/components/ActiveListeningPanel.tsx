import React, { useState, useCallback } from 'react';
import { VoicePhrase } from '../types';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '18px',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonDanger: {
    backgroundColor: '#dc3545'
  },
  phraseList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  phraseItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  checkbox: {
    width: '18px',
    height: '18px'
  },
  phraseText: {
    flex: 1,
    fontSize: '14px',
    color: '#333'
  },
  timestamp: {
    fontSize: '12px',
    color: '#666'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  micActive: {
    color: '#dc3545',
    animation: 'pulse 2s infinite'
  }
};

// Frases simuladas para demostración
const DEMO_PHRASES = [
  "El paciente presenta dolor lumbar agudo con irradiación a pierna derecha",
  "Se observa limitación en la flexión de columna y espasmo muscular",
  "Diagnóstico probable: lumbalgia aguda con componente radicular",
  "Se recomienda terapia manual y ejercicios de estabilización",
  "Control en 7 días para evaluar evolución del tratamiento"
];

interface Props {
  onPhrasesValidated: (phrases: string[]) => void;
}

export const ActiveListeningPanel: React.FC<Props> = ({ onPhrasesValidated }) => {
  const [isListening, setIsListening] = useState(false);
  const [phrases, setPhrases] = useState<VoicePhrase[]>([]);

  const startListening = useCallback(() => {
    setIsListening(true);
    console.log('🎤 Iniciando escucha activa...');

    // Simular captura de audio agregando frases cada 2 segundos
    let index = 0;
    const interval = setInterval(() => {
      if (index < DEMO_PHRASES.length) {
        const newPhrase: VoicePhrase = {
          id: `phrase-${Date.now()}`,
          text: DEMO_PHRASES[index],
          isSelected: false,
          timestamp: new Date().toISOString()
        };
        setPhrases(prev => [...prev, newPhrase]);
        index++;
      } else {
        clearInterval(interval);
        setIsListening(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    console.log('🎤 Escucha activa detenida');
  }, []);

  const togglePhrase = useCallback((id: string) => {
    setPhrases(prev => 
      prev.map(phrase => 
        phrase.id === id 
          ? { ...phrase, isSelected: !phrase.isSelected }
          : phrase
      )
    );
  }, []);

  const handleValidate = useCallback(() => {
    const validatedPhrases = phrases
      .filter(phrase => phrase.isSelected)
      .map(phrase => phrase.text);

    console.log('✅ Frases validadas:', validatedPhrases);
    onPhrasesValidated(validatedPhrases);
    setPhrases([]);
  }, [phrases, onPhrasesValidated]);

  const selectAll = useCallback(() => {
    setPhrases(prev => prev.map(phrase => ({ ...phrase, isSelected: true })));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          🎤 Escucha Activa
          {isListening && <span style={styles.micActive}>●</span>}
        </h3>
        <button
          style={{
            ...styles.button,
            ...(isListening ? styles.buttonDanger : {})
          }}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? 'Detener' : 'Iniciar'} Escucha
        </button>
      </div>

      {phrases.length > 0 && (
        <>
          <div style={styles.phraseList}>
            {phrases.map(phrase => (
              <div key={phrase.id} style={styles.phraseItem}>
                <input
                  type="checkbox"
                  checked={phrase.isSelected}
                  onChange={() => togglePhrase(phrase.id)}
                  style={styles.checkbox}
                />
                <span style={styles.phraseText}>{phrase.text}</span>
                <span style={styles.timestamp}>
                  {new Date(phrase.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            <button
              style={styles.button}
              onClick={selectAll}
            >
              Seleccionar Todo
            </button>
            <button
              style={{
                ...styles.button,
                backgroundColor: '#198754'
              }}
              onClick={handleValidate}
            >
              Validar Seleccionadas
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 