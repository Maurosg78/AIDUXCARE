/**
 * Tipos relacionados con metadatos de PDF de visitas
 */

/**
 * Orientación del PDF
 */
export type PDFOrientation = 'portrait' | 'landscape';

/**
 * Tamaño de página del PDF
 */
export type PDFPageSize = 'A4' | 'LETTER' | 'LEGAL';

/**
 * Nivel de encriptación
 */
export type EncryptionLevel = 'none' | 'low' | 'high';

/**
 * Seguridad del PDF
 */
export interface PDFSecurity {
  password?: string;
  encryptionLevel?: EncryptionLevel;
  watermark?: string;
  permissions?: {
    print?: boolean;
    copy?: boolean;
    modify?: boolean;
  };
}

/**
 * Márgenes del PDF
 */
export interface PDFMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Formato del PDF
 */
export interface PDFFormat {
  orientation: PDFOrientation;
  pageSize: PDFPageSize;
  margins: PDFMargins;
}

/**
 * Representa los metadatos de un PDF de visita
 */
export interface VisitPDFMetadata {
  id: string;
  visitId: string;
  patientId?: string;
  fileName: string;
  fileSize?: number;
  generatedAt?: string;
  format: PDFFormat;
  security?: PDFSecurity;
  metadata?: {
    exportedBy?: string;
    exportDate?: string;
    generatedBy?: string;
    version?: string;
    sections?: string[];
    customFields?: Record<string, unknown>;
    [key: string]: unknown;
  };
} 