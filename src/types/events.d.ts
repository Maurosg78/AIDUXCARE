interface EventPayload {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

interface FormUpdatePayload extends EventPayload {
  patientId: string;
  changedFields: string[];
  updatedData: {
    patientId: string;
    traceId?: string;
    anamnesis?: string;
    exam?: string;
    diagnosis?: string;
    plan?: string;
    [key: string]: any;
  };
}

interface CopilotFeedbackPayload extends EventPayload {
  patientId: string;
  feedback: Array<{
    field: string;
    value: string;
    accepted: boolean;
  }>;
  formData: {
    motivo: string;
    observaciones: string;
    diagnostico: string;
  };
}

interface TrackEventOptions {
  name: string;
  payload: EventPayload;
  traceId?: string;
}

export { EventPayload, FormUpdatePayload, CopilotFeedbackPayload, TrackEventOptions }; 