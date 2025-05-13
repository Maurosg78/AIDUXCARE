/**
 * Tests para validar los tipos de adaptadores de componentes
 */
import type { 
  AdaptedVisit, 
  AdaptedPatient, 
  AdaptedClinicalEvaluation, 
  AdaptedPatientEval 
} from '../../src/types/component-adapters';
import { expectType } from 'tsd';
import { adaptPatient, adaptVisit } from '../../src/types/component-adapters';

// Función de ayuda para validar tipos
function validateVisitType(visit: AdaptedVisit): void {
  // Validación básica de propiedades requeridas
  const id: string = visit.id;
  const patientId: string = visit.patientId;
  
  // Validación de propiedades opcionales
  const motivo: string | undefined = visit.motivo;
  const diagnostico: string | undefined = visit.diagnosticoFisioterapeutico;
  const tratamiento: string | undefined = visit.tratamientoPropuesto;
}

function validatePatientType(patient: AdaptedPatient): void {
  // Validación básica de propiedades requeridas
  const id: string = patient.id;
  
  // Validación de propiedades opcionales
  const name: string | undefined = patient.name;
  const firstName: string | undefined = patient.firstName;
  const email: string | undefined = patient.email;
  
  // Validación de propiedades anidadas opcionales
  const contactEmail: string | undefined = patient.contactInfo?.email;
}

function validateEvaluationType(evaluation: AdaptedClinicalEvaluation): void {
  // Validación básica de propiedades requeridas
  const id: string = evaluation.id;
  const patientId: string = evaluation.patientId;
  const visitId: string = evaluation.visitId;
  
  // Validación de propiedades opcionales
  const diagnosis: string | undefined = evaluation.diagnosis;
  const plan: string | undefined = evaluation.plan;
  
  // Validación de arreglos opcionales
  const notes: string[] | undefined = evaluation.voiceApprovedNotes;
}

function validatePatientEvalType(patientEval: AdaptedPatientEval): void {
  // Validación básica de propiedades requeridas
  const patientId: string = patientEval.patientId;
  const traceId: string = patientEval.traceId;
  
  // Validación de propiedades opcionales
  const motivo: string | undefined = patientEval.motivo;
  const diagnostico: string | undefined = patientEval.diagnosticoFisioterapeutico;
}

// Función para verificar asignaciones entre tipos
function verifyAssignability(): void {
  // Crear objetos con propiedades mínimas
  const visit: AdaptedVisit = {
    id: '1',
    patientId: '2',
    scheduledDate: '2023-01-01',
    duration: 60,
    status: 'scheduled',
    paymentStatus: 'pending'
  };
  
  const patient: AdaptedPatient = {
    id: '1'
  };
  
  const evaluation: AdaptedClinicalEvaluation = {
    id: '1',
    patientId: '2',
    visitId: '3'
  };
  
  const patientEval: AdaptedPatientEval = {
    patientId: '1',
    traceId: '2'
  };
  
  // Probar actualizaciones con objetos parciales
  const visitUpdate: Partial<AdaptedVisit> = {
    motivo: 'Consulta',
    diagnosticoFisioterapeutico: 'Lumbalgia',
    tratamientoPropuesto: 'Ejercicios'
  };
  
  const evaluationUpdate: Partial<AdaptedClinicalEvaluation> = {
    anamnesis: 'Historia clínica',
    diagnosis: 'Diagnóstico',
    plan: 'Plan de tratamiento'
  };
}

// Test para AdaptedPatient
describe('AdaptedPatient', () => {
  it('should properly type patient data with required fields', () => {
    const patientRaw = {
      id: '123',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      birthDate: '1980-01-01',
      phoneNumber: '123456789',
      gender: 'male'
    };

    const patient = adaptPatient(patientRaw);
    
    // Verificar que el tipo resultante sea AdaptedPatient
    expectType<AdaptedPatient>(patient);
    
    // Verificar campos específicos
    expectType<string>(patient.id);
    expectType<string>(patient.name);
    expectType<string>(patient.email);
  });

  it('should handle optional fields correctly', () => {
    const patientMinimal = {
      id: '123',
      firstName: 'Juan',
      lastName: 'Pérez'
    };

    const patient = adaptPatient(patientMinimal);
    
    // Verificar que el tipo resultante sea AdaptedPatient
    expectType<AdaptedPatient>(patient);
    
    // Verificar que campos opcionales sean string | undefined
    expectType<string | undefined>(patient.email);
    expectType<string | undefined>(patient.phone);
  });
});

// Test para AdaptedVisit
describe('AdaptedVisit', () => {
  it('should properly type visit data with required fields', () => {
    const visitRaw = {
      id: 'visit-123',
      patientId: 'patient-123',
      date: '2023-05-15',
      scheduledDate: '2023-05-15',
      status: 'completed',
      duration: 30,
      paymentStatus: 'paid',
      modalidad: 'presencial'
    };

    const visit = adaptVisit(visitRaw);
    
    // Verificar que el tipo resultante sea AdaptedVisit
    expectType<AdaptedVisit>(visit);
    
    // Verificar campos específicos
    expectType<string>(visit.id);
    expectType<string>(visit.patientId);
    expectType<string>(visit.status);
  });

  it('should handle visit with different property names', () => {
    const visitVariant = {
      id: 'visit-123',
      patientId: 'patient-123',
      visitDate: '2023-05-15',
      visitType: 'consulta',
      status: 'in_progress',
      reason: 'Dolor de espalda'
    };

    const visit = adaptVisit(visitVariant);
    
    // Verificar que el tipo resultante sea AdaptedVisit
    expectType<AdaptedVisit>(visit);
    
    // Verificar campos adaptados
    expectType<string | undefined>(visit.reason);
    expectType<string | undefined>(visit.visitType);
  });
});

// Test para AdaptedAuditLogEntry
describe('AdaptedAuditLogEntry', () => {
  it('should properly type audit log entries', () => {
    // Ejemplo de entrada de registro de auditoría
    const auditLogEntry: AdaptedAuditLogEntry = {
      id: 'log-123',
      timestamp: new Date().toISOString(),
      entityId: 'visit-123',
      entityType: 'visit',
      action: 'update',
      userId: 'user-123',
      details: {
        field: 'status',
        oldValue: 'scheduled',
        newValue: 'completed'
      }
    };
    
    // Verificar campos específicos
    expectType<string>(auditLogEntry.id);
    expectType<string>(auditLogEntry.timestamp);
    expectType<string>(auditLogEntry.entityId);
    expectType<string>(auditLogEntry.entityType);
    expectType<string>(auditLogEntry.action);
    expectType<string>(auditLogEntry.userId);
    expectType<Record<string, unknown>>(auditLogEntry.details);
  });

  it('should handle optional fields in audit log entries', () => {
    // Entrada mínima de registro de auditoría
    const minimalAuditLogEntry: AdaptedAuditLogEntry = {
      id: 'log-123',
      timestamp: new Date().toISOString(),
      entityId: 'visit-123',
      entityType: 'visit',
      action: 'read',
      userId: 'user-123'
    };
    
    // Verificar que details es opcional
    expectType<Record<string, unknown> | undefined>(minimalAuditLogEntry.details);
  });
}); 