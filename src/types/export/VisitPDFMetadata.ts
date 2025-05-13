// TODO: completar definición
export interface VisitPDFMetadata {
  id: string;
  visitId: string;
  patientId: string;
  generatedAt: Date;
  format: {
    pageSize: 'A4' | 'Letter';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  security: {
    password?: string;
    encryptionLevel?: 'none' | 'low' | 'high';
    watermark?: string;
  };
  metadata: {
    version: string;
    generatedBy: string;
    sections: string[];
    customFields?: Record<string, unknown>;
  };
} 