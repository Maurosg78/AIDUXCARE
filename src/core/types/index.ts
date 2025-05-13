import type { ReactNode } from 'react';

/**
 * Tipos comunes para toda la aplicación
 */

// Tipo de los roles de usuario (para tipado fuerte en todo el sistema)
export type UserRole = 'admin' | 'professional' | 'fisioterapeuta' | 'secretary' | 'developer';

// Alias para compatibilidad con código existente
export type AuthRole = UserRole;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string; // Para compatibilidad con código existente
  sex?: 'M' | 'F' | 'O';
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  age?: number;
  rut?: string;
  createdAt: string;
  updatedAt: string;
  // Propiedad computada para compatibilidad con código existente
  name?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  professionalId?: string;
  date: string;
  visitDate?: string; // Para compatibilidad con código existente
  visitType?: string; // Para compatibilidad con código existente
  type?: string; // Para compatibilidad con código existente
  reason?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientVisit extends Visit {
  visitDate: string;
  visitType: string;
}

export interface PatientEval {
  id?: string;
  visitId: string;
  patientId: string;
  anamnesis?: string;
  physicalExam?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  voiceApprovedNotes?: string[];
  createdAt?: string;
  updatedAt?: string;
  // Campos adicionales para compatibilidad
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
  motivo?: string;
  alertas?: string[];   // Para compatibilidad con código existente
  traceId?: string;     // Para Langfuse
}

export interface AuditLogEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface StructuredSuggestion {
  id: string;
  field: string;
  value: string;
  confidence: number;
  source: string;
}

export interface ImpactStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalVisits: number;
  completedVisits: number;
  totalPatients: number;
  userSatisfaction: number;
  aiAssistUse: number;
  timeReduction: number;
}

export interface LayoutProps {
  children?: ReactNode;
}

export interface EvalResult {
  visitId: string;
  completeness: {
    requiredFields: string[];
    completedFields: string[];
  };
  quality: {
    score: number;
    feedback: string[];
  };
  completenessScore: number;
  missingFields?: string[];
  warnings?: string[];
}

export interface MCPContext {
  patient_state?: {
    sex?: 'M' | 'F' | 'O';
    age?: number;
    history?: string[];
  };
  visit_metadata?: {
    professional?: string;
    date?: string;
    visit_id?: string;
  };
  rules_and_constraints?: string[];
  system_instructions?: string;
  enrichment?: Record<string, unknown>;
  tools_metadata?: unknown[];
}

export interface LangfuseEntry {
  id: string;
  traceId: string;
  name: string;
  startTime: string;
  endTime?: string;
  metadata?: Record<string, unknown>;
  input?: unknown;
  output?: unknown;
  level?: 'DEBUG' | 'DEFAULT' | 'WARNING' | 'ERROR';
  statusMessage?: string;
  version?: string;
  sessionId?: string;
  userId?: string;
}

// Interfaz para configuración de Langfuse
export interface LangfuseConfig {
  publicKey: string;
  secretKey?: string;
  development?: boolean;
  project?: string;
}

export interface PatientService {
  getById(id: string): Promise<Patient>;
  getAll(): Promise<Patient[]>;
  create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  update(id: string, patient: Partial<Patient>): Promise<Patient>;
  delete(id: string): Promise<void>;
  searchByName(name: string): Promise<Patient[]>;
  searchBySurname(surname: string): Promise<Patient[]>;
  patientExists(patientId: string): Promise<boolean>;
  // Métodos de compatibilidad
  getPatientById(id: string): Promise<Patient>;
  createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  updatePatient(id: string, patient: Partial<Patient>): Promise<Patient>;
}

export interface VisitService {
  getById(id: string): Promise<Visit>;
  getAll(): Promise<Visit[]>;
  getByPatientId(patientId: string): Promise<Visit[]>;
  create(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit>;
  update(id: string, visit: Partial<Visit>): Promise<Visit>;
  delete(id: string): Promise<void>;
  visitExists(visitId: string): Promise<boolean>;
  // Métodos de compatibilidad
  getVisitById(visitId: string): Promise<Visit>;
  getVisitsByPatientId(patientId: string): Promise<Visit[]>;
  getAllVisits(): Promise<Visit[]>;
  createVisit(visitData: unknown): Promise<Visit>;
  updateVisit(visitId: string, updateData: unknown): Promise<Visit>;
  deleteVisit(visitId: string): Promise<void>;
}

export type { Database } from './supabase'; 