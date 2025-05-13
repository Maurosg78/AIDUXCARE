/**
 * Tipos relacionados con elementos de audio de checklist
 */

/**
 * Formato de audio
 */
export type AudioFormat = 'mp3' | 'wav' | 'ogg';

/**
 * Estado de procesamiento de audio
 */
export type AudioStatus = 'pending' | 'processing' | 'processed' | 'completed' | 'failed';

/**
 * Rol del hablante
 */
export type SpeakerRole = 'doctor' | 'patient' | 'other';

/**
 * Información del hablante
 */
export interface Speaker {
  id: string;
  role: SpeakerRole;
}

/**
 * Representa un elemento de audio de checklist
 */
export interface ChecklistAudioItem {
  id: string;
  timestamp: string;
  audioUrl: string;
  duration: number;
  transcript?: string;
  status: AudioStatus;
  format?: AudioFormat;
  metadata?: {
    patientId?: string;
    visitId?: string;
    checklistId?: string;
    itemId?: string;
    format?: string;
    size?: number;
    sampleRate?: number;
    channels?: number;
    confidence?: number;
    language?: string;
    speaker?: Speaker;
    [key: string]: unknown;
  };
} 