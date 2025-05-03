export interface EventMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export interface EventPayload {
  [key: string]: string | number | boolean | EventMetadata | null | undefined;
}

export interface TrackEventOptions {
  name: string;
  payload: EventPayload;
  traceId?: string;
}

export interface FormUpdatePayload extends EventPayload {
  patientId: string;
  changedFields: string;
  updatedData: string;
}

export interface CopilotFeedbackPayload extends EventPayload {
  patientId: string;
  feedback: string;
  formData: string;
} 