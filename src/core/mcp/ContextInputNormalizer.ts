import { z } from 'zod';

export enum InputType {
  TEXT = 'text',
  VOICE = 'voice',
  FORM = 'form',
  EMR = 'emr'
}

const VoiceInputSchema = z.object({
  type: z.literal(InputType.VOICE),
  audioTranscript: z.string(),
  confidence: z.number().min(0).max(1),
  language: z.string()
});

const TextInputSchema = z.object({
  type: z.literal(InputType.TEXT),
  content: z.string()
});

const FormInputSchema = z.object({
  type: z.literal(InputType.FORM),
  fields: z.record(z.string(), z.unknown())
});

const EMRInputSchema = z.object({
  type: z.literal(InputType.EMR),
  patientId: z.string(),
  recordType: z.string(),
  data: z.record(z.string(), z.unknown())
});

export const RawInputSchema = z.discriminatedUnion('type', [
  VoiceInputSchema,
  TextInputSchema,
  FormInputSchema,
  EMRInputSchema
]);

export type RawInput = z.infer<typeof RawInputSchema>;

export class ContextInputNormalizer {
  static normalize(input: RawInput): string {
    switch (input.type) {
      case InputType.VOICE:
        return `Transcripción de audio (confianza: ${input.confidence}): ${input.audioTranscript}`;
      
      case InputType.TEXT:
        return input.content;
      
      case InputType.FORM:
        return Object.entries(input.fields)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      
      case InputType.EMR:
        return `Datos EMR para paciente ${input.patientId} (${input.recordType}):\n` +
          Object.entries(input.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
      
      default:
        throw new Error(`Tipo de entrada no soportado: ${input.type}`);
    }
  }
} 