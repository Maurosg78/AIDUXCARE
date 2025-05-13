/**
 * Tests para validar los tipos de adaptadores de componentes
 */
import type { 
  AdaptedVisit, 
  AdaptedPatient, 
  AdaptedClinicalEvaluation, 
  AdaptedPatientEval 
} from '../../src/types/component-adapters';

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