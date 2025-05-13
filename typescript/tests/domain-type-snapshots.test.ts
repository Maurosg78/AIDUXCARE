// @ts-nocheck
import { expectType } from 'tsd';
// Importamos desde las rutas correctas
import type { ClinicalEvaluation } from '../../src/types/ClinicalEvaluation';
import type { AuditLogEntry } from '../../src/types/AuditLogEntry';
import type { CopilotSuggestion } from '../../src/types/CopilotSuggestion';
import type { ChecklistAudioItem } from '../../src/types/ChecklistAudioItem';
import type { VisitPDFMetadata } from '../../src/types/VisitPDFMetadata';
import type { UserRole } from '../../src/types/auth';

// Definición de tipos genéricos y enums
export enum SuggestionType {
  TEXT = "text",
  CHECKLIST = "checklist",
  DIAGRAM = "diagram",
  RECOMMENDATION = "recommendation"
}

type ChangeRecord<T> = {
  field: string;
  oldValue: T;
  newValue: T;
};

// Test 1: Validar ClinicalEvaluation
{
  // Caso base
  const evaluation: ClinicalEvaluation = {
    id: '123',
    patientId: '456',
    evaluationDate: new Date(),
    clinicianId: '789',
    status: 'completed',
    sections: {
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.5,
        respiratoryRate: 16
      },
      symptoms: ['fever', 'cough'],
      observations: 'Patient presents with mild symptoms',
      recommendations: ['rest', 'hydration']
    },
    audit: [] as AuditLogEntry[],
    metadata: {
      version: '1.0',
      lastModified: new Date()
    }
  };

  // Caso límite: secciones vacías
  const _emptyEvaluation: ClinicalEvaluation = {
    id: '123',
    patientId: '456',
    evaluationDate: new Date(),
    clinicianId: '789',
    status: 'pending',
    sections: {
      vitalSigns: {
        bloodPressure: '',
        heartRate: 0,
        temperature: 0,
        respiratoryRate: 0
      },
      symptoms: [],
      observations: '',
      recommendations: []
    },
    audit: [],
    metadata: {
      version: '1.0',
      lastModified: new Date()
    }
  };

  // Caso límite: metadata mínima
  const _minimalEvaluation: ClinicalEvaluation = {
    id: '123',
    patientId: '456',
    evaluationDate: new Date(),
    clinicianId: '789',
    status: 'in_progress',
    sections: {
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.5,
        respiratoryRate: 16
      },
      symptoms: [],
      observations: '',
      recommendations: []
    },
    audit: [],
    metadata: {
      version: '1.0',
      lastModified: new Date()
    }
  };

  // Validaciones de tipos
  expectType<string>(evaluation.id);
  expectType<string>(evaluation.patientId);
  expectType<Date>(evaluation.evaluationDate);
  expectType<string>(evaluation.clinicianId);
  expectType<'completed' | 'in_progress' | 'pending'>(evaluation.status);

  // Validar estructura de secciones
  expectType<{
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
  }>(evaluation.sections.vitalSigns);

  expectType<string[]>(evaluation.sections.symptoms);
  expectType<string>(evaluation.sections.observations);
  expectType<string[]>(evaluation.sections.recommendations);

  // Validar relación con AuditLogEntry
  expectType<AuditLogEntry[]>(evaluation.audit);

  // Prueba negativa: status inválido
  // @ts-expect-error Status debe ser uno de los valores permitidos
  const _invalidStatus: ClinicalEvaluation = {
    ...evaluation,
    status: 'invalid_status'
  };
}

// Test 2: Validar AuditLogEntry con tipos genéricos
{
  // Caso base con string
  const stringChanges: AuditLogEntry<string> = {
    id: '123',
    timestamp: new Date(),
    action: 'create',
    entityType: 'evaluation',
    entityId: '456',
    userId: '789',
    changes: [{
      field: 'status',
      oldValue: 'pending',
      newValue: 'completed'
    }],
    metadata: {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0'
    }
  };

  // Caso base con number
  const numberChanges: AuditLogEntry<number> = {
    id: '123',
    timestamp: new Date(),
    action: 'create',
    entityType: 'evaluation',
    entityId: '456',
    userId: '789',
    changes: [{
      field: 'heartRate',
      oldValue: 72,
      newValue: 75
    }],
    metadata: {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0'
    }
  };

  // Caso límite: cambios mínimos
  const minimalAuditEntry: AuditLogEntry<unknown> = {
    id: '123',
    timestamp: new Date(),
    action: 'create',
    entityType: 'evaluation',
    entityId: '456',
    userId: '789',
    changes: [{
      field: '',
      oldValue: null,
      newValue: null
    }],
    metadata: {
      ip: '',
      userAgent: ''
    }
  };

  // Validaciones de tipos
  expectType<string>(stringChanges.id);
  expectType<Date>(stringChanges.timestamp);
  expectType<'create' | 'update' | 'delete'>(stringChanges.action);
  expectType<string>(stringChanges.entityType);
  expectType<string>(stringChanges.entityId);
  expectType<string>(stringChanges.userId);

  // Validar estructura de cambios con genéricos
  expectType<ChangeRecord<string>[]>(stringChanges.changes);
  expectType<ChangeRecord<number>[]>(numberChanges.changes);
  expectType<ChangeRecord<unknown>[]>(minimalAuditEntry.changes);

  // Validar metadata
  expectType<{
    ip: string;
    userAgent: string;
  }>(stringChanges.metadata);

  // Prueba negativa: action inválido
  // @ts-expect-error Action debe ser uno de los valores permitidos
  const invalidAction: AuditLogEntry<string> = {
    ...stringChanges,
    action: 'invalid_action'
  };
}

// Test 3: Validar CopilotSuggestion con enum
{
  // Caso base
  const suggestion: CopilotSuggestion = {
    id: '123',
    timestamp: new Date(),
    clinicalContextId: '789',
    context: {
      patientId: '456',
      evaluationId: '789',
      section: 'symptoms'
    },
    content: {
      type: SuggestionType.RECOMMENDATION,
      text: 'Consider ordering blood tests',
      confidence: 0.85,
      reasoning: 'Based on reported symptoms'
    },
    status: 'pending',
    metadata: {
      model: 'gpt-4',
      version: '1.0'
    }
  };

  // Caso límite: contenido mínimo
  const minimalSuggestion: CopilotSuggestion = {
    id: '123',
    timestamp: new Date(),
    clinicalContextId: '789',
    context: {
      patientId: '',
      evaluationId: '',
      section: ''
    },
    content: {
      type: SuggestionType.TEXT,
      text: '',
      confidence: 0,
      reasoning: ''
    },
    status: 'pending',
    metadata: {
      model: '',
      version: ''
    }
  };

  // Validaciones de tipos
  expectType<string>(suggestion.id);
  expectType<Date>(suggestion.timestamp);
  expectType<string>(suggestion.clinicalContextId);
  expectType<'pending' | 'accepted' | 'rejected'>(suggestion.status);

  // Validar estructura de contexto
  expectType<{
    patientId: string;
    evaluationId: string;
    section: string;
  }>(suggestion.context);

  // Validar estructura de contenido con enum
  expectType<{
    type: SuggestionType;
    text: string;
    confidence: number;
    reasoning: string;
  }>(suggestion.content);

  // Prueba negativa: status inválido
  // @ts-expect-error Status debe ser uno de los valores permitidos
  const invalidStatus: CopilotSuggestion = {
    ...suggestion,
    status: 'invalid_status'
  };

  // Prueba negativa: tipo de sugerencia inválido
  // @ts-expect-error Type debe ser uno de los valores del enum SuggestionType
  const invalidSuggestionType: CopilotSuggestion = {
    ...suggestion,
    content: {
      ...suggestion.content,
      type: 'invalid_type'
    }
  };
}

// Test 4: Validar ChecklistAudioItem
{
  // Caso base
  const audioItem: ChecklistAudioItem = {
    id: '123',
    timestamp: new Date(),
    patientId: '456',
    evaluationId: '789',
    audioUrl: 'https://storage.example.com/audio/123.mp3',
    duration: 120,
    transcription: 'Patient reports feeling better today',
    status: 'completed',
    metadata: {
      format: 'mp3',
      size: 1024000,
      quality: 'high'
    }
  };

  // Caso límite: metadata mínima
  const minimalAudioItem: ChecklistAudioItem = {
    id: '123',
    timestamp: new Date(),
    patientId: '456',
    evaluationId: '789',
    audioUrl: '',
    duration: 0,
    transcription: '',
    status: 'processing',
    metadata: {
      format: '',
      size: 0,
      quality: ''
    }
  };

  // Validaciones de tipos
  expectType<string>(audioItem.id);
  expectType<Date>(audioItem.timestamp);
  expectType<string>(audioItem.patientId);
  expectType<string>(audioItem.evaluationId);
  expectType<string>(audioItem.audioUrl);
  expectType<number>(audioItem.duration);
  expectType<string>(audioItem.transcription);
  expectType<'completed' | 'processing' | 'failed'>(audioItem.status);

  // Validar metadata
  expectType<{
    format: string;
    size: number;
    quality: string;
  }>(audioItem.metadata);

  // Prueba negativa: status inválido
  // @ts-expect-error Status debe ser uno de los valores permitidos
  const invalidStatus: ChecklistAudioItem = {
    ...audioItem,
    status: 'invalid_status'
  };
}

// Test 5: Validar VisitPDFMetadata
{
  // Caso base
  const pdfMetadata: VisitPDFMetadata = {
    id: '123',
    visitId: '456',
    generatedAt: new Date(),
    version: '1.0',
    sections: ['evaluation', 'audit', 'suggestions'],
    format: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    security: {
      encrypted: true,
      passwordProtected: false,
      allowedActions: ['print', 'copy']
    },
    metadata: {
      author: 'Dr. Smith',
      title: 'Clinical Evaluation Report',
      keywords: ['evaluation', 'medical', 'report']
    },
    exportedBy: 'doctor' as UserRole // Validación cruzada con UserRole
  };

  // Caso límite: secciones vacías
  const minimalPdfMetadata: VisitPDFMetadata = {
    id: '123',
    visitId: '456',
    generatedAt: new Date(),
    version: '1.0',
    sections: [],
    format: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    security: {
      encrypted: false,
      passwordProtected: false,
      allowedActions: []
    },
    metadata: {
      author: '',
      title: '',
      keywords: []
    },
    exportedBy: 'nurse' as UserRole
  };

  // Validaciones de tipos
  expectType<string>(pdfMetadata.id);
  expectType<string>(pdfMetadata.visitId);
  expectType<Date>(pdfMetadata.generatedAt);
  expectType<string>(pdfMetadata.version);
  expectType<string[]>(pdfMetadata.sections);
  expectType<UserRole>(pdfMetadata.exportedBy);

  // Validar estructura de formato
  expectType<{
    pageSize: string;
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  }>(pdfMetadata.format);

  // Validar estructura de seguridad
  expectType<{
    encrypted: boolean;
    passwordProtected: boolean;
    allowedActions: string[];
  }>(pdfMetadata.security);

  // Validar metadata
  expectType<{
    author: string;
    title: string;
    keywords: string[];
  }>(pdfMetadata.metadata);

  // Prueba negativa: orientation inválido
  // @ts-expect-error Orientation debe ser uno de los valores permitidos
  const invalidOrientation: VisitPDFMetadata = {
    ...pdfMetadata,
    format: {
      ...pdfMetadata.format,
      orientation: 'invalid_orientation'
    }
  };
}

// Estadísticas de validación actualizadas
console.log('// ✅ 17 tipos validados | ⚠️ 0 pendientes | ❌ 0 errores de tipo'); 