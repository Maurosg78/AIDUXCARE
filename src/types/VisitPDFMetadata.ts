export type PDFOrientation = 'portrait' | 'landscape';
export type PDFPageSize = 'A4' | 'LETTER' | 'LEGAL';

export interface PDFSecurity {
  password?: string;
  permissions?: {
    print?: boolean;
    copy?: boolean;
    modify?: boolean;
  };
}

export interface VisitPDFMetadata {
  id: string;
  visitId: string;
  fileName: string;
  fileSize: number;
  format: {
    orientation: PDFOrientation;
    pageSize: PDFPageSize;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  security?: PDFSecurity;
  metadata?: {
    exportedBy: string;
    exportDate: string;
    version: string;
    [key: string]: unknown;
  };
} 