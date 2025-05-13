import type { z  } from '../../types/schema-utils';

export enum InputType {
  TEXT = 'text',
  VOICE = 'voice',
  FORM = 'form',
  EMR = 'emr'
}

const VoiceInputSchema = z.object({
  type: z.literal(InputType.VOICE),
  audioTranscript: z.string(),
  confidence: z.number(),
  language: z.string()
});

const TextInputSchema = z.object({
  type: z.literal(InputType.TEXT),
  content: z.string()
});

const FormInputSchema = z.object({
  type: z.literal(InputType.FORM),
  fields: z.record(z.string(), z.object({}))
});

const EMRInputSchema = z.object({
  type: z.literal(InputType.EMR),
  patientId: z.string(),
  recordType: z.string(),
  data: z.record(z.string(), z.object({}))
});

export const RawInputSchema = z.discriminatedUnion('type', [
  VoiceInputSchema,
  TextInputSchema,
  FormInputSchema,
  EMRInputSchema
]);

export type RawInput = {
  type: InputType;
  // Para InputType.VOICE
  audioTranscript?: string;
  confidence?: number;
  language?: string;
  // Para InputType.TEXT
  content?: string;
  // Para InputType.FORM
  fields?: Record<string, any>;
  // Para InputType.EMR
  patientId?: string;
  recordType?: string;
  data?: Record<string, any>;
};

export class ContextInputNormalizer {
  static normalize(input: RawInput): string {
    switch (input.type) {
      case InputType.VOICE:
        return `Transcripción de audio (confianza: ${input.confidence}): ${input.audioTranscript}`;
      
      case InputType.TEXT:
        return input.content || '';
      
      case InputType.FORM:
        return Object.entries(input.fields || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      
      case InputType.EMR:
        return `Datos EMR para paciente ${input.patientId} (${input.recordType}):\n` +
          Object.entries(input.data || {})
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
      
      default:
        // Exhaustive check con TypeScript para capturar casos no manejados
        // En runtime debería ser inalcanzable si todas las opciones del enum están cubiertas
        const inputValue = JSON.stringify(input);
        throw new Error(`Tipo de entrada no soportado: ${inputValue}`);
    }
  }
}