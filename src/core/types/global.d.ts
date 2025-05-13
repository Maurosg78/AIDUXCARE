// Declaraciones específicas para tipos comunes en la aplicación
interface User {
  id: string;
  email: string;
  role?: UserRole;
}

// Definir los roles de usuario
type UserRole = 'admin' | 'professional' | 'patient' | 'guest' | 'fisioterapeuta' | 'secretary' | 'developer';

// Definir interfaces para servicios
interface Patient {
  id: string;
  nombre: string;
  edad: number;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  seguroMedico: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Compatibilidad con legacy code
  firstName?: string; 
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
}

type PatientCreate = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;

interface IPatientService {
  getAll(): Promise<Patient[]>;
  getById(id: string): Promise<Patient | undefined>;
  create(patientData: PatientCreate): Promise<Patient>;
  update(id: string, patientData: Partial<PatientCreate>): Promise<Patient | undefined>;
  delete(id: string): Promise<boolean>;
  clearAll(): Promise<void>;
  visitExists?(id: string): Promise<boolean>;
}

interface Visit {
  id: string;
  patientId: string;
  professionalId: string;
  professionalEmail: string;
  scheduledDate: string;
  duration?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'cancelled' | 'refunded';
  motivo: string;
  modalidad?: 'presencial' | 'telematica';
  precio?: number;
  previousHistory?: boolean;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  metadata?: {
    visit_type: string;
    duration_minutes: number;
    location?: string;
    follow_up_required: boolean;
  };
}

type PatientVisit = Visit;

interface PatientEval {
  patientId: string;
  traceId: string;
  motivo: string;
  diagnosticoFisioterapeutico: string;
  tratamientoPropuesto: string;
  [key: string]: string;
}

interface CopilotFeedback {
  id: string;
  type: 'suggestion' | 'warning' | 'error' | 'info';
  message: string;
  field?: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  value?: string;
}

// Declaración de módulos específicos para resolver errores de importación
declare module '@/core/services/AuditLogService' {
  export interface AuditLogEvent {
    id?: string;
    visitId: string;
    timestamp: string;
    action: 'field_updated' | 'suggestion_accepted' | 'copilot_intervention' | 'manual_edit' | 'form_submitted' | 'ai_suggestion_accepted' | 'ai_suggestion_modified' | 'ai_suggestion_rejected' | 'test_event';
    field: string;
    oldValue?: string;
    newValue?: string;
    modifiedBy: string;
    source: 'user' | 'copilot';
  }

  export const AuditLogService: {
    logEvent(event: Omit<AuditLogEvent, 'id' | 'timestamp'>): Promise<void>;
    getLogsByVisitId(visitId: string): Promise<AuditLogEvent[]>;
  };

  export const AuditLogEventSchema: {
    parse: <T>(data: T) => T;
  };
}

declare module '@/core/clients/AuditLogClient' {
  import type { AuditLogEvent } from '@/core/services/AuditLogService';
  
  export class AuditLogClient {
    logEvent(eventData: Omit<AuditLogEvent, 'id' | 'timestamp'>): Promise<void>;
    getAuditLogByVisitId(visitId: string): Promise<AuditLogEvent[]>;
  }
}

declare module '@/core/contexts/AuthContext' {
  import { ReactNode } from 'react';
  
  export interface User {
    id: string;
    email: string;
    role?: UserRole;
  }

  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }

  export function useAuth(): AuthContextType;
  
  export function AuthProvider({ children }: { children: ReactNode }): JSX.Element;

  export function ProtectedRoute(props: { 
    children: ReactNode;
    allowedRoles?: UserRole[];
  }): JSX.Element;
}

declare module '@/core/context/AuthContext' {
  import { ReactNode } from 'react';
  
  export interface User {
    id: string;
    email: string;
    role?: UserRole;
  }

  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }

  export function useAuth(): AuthContextType;
  
  export function AuthProvider({ children }: { children: ReactNode }): JSX.Element;

  export function ProtectedRoute(props: { 
    children: ReactNode;
    allowedRoles?: UserRole[];
  }): JSX.Element;
}

declare module '@/core/config/routes' {
  import { RouteObject } from 'react-router';
  const routes: RouteObject[];
  export default routes;
}

declare module '@/core/lib/langfuse.client' {
  export interface EventParams {
    name: string;
    payload?: Record<string, unknown>;
    traceId?: string;
  }
  
  export type EventOptions = string | EventParams;
  
  export function verifyLangfuseConfig(): boolean;
  export function trackEvent(
    eventOrName: EventOptions, 
    metadata?: Record<string, unknown>
  ): Promise<{ id: string } | null>;
}

declare module '@/hooks/useCopilot' {
  export interface StructuredSuggestion {
    value: string;
    reference?: {
      url: string;
      source: string;
      year: string;
    };
  }

  export function useCopilot(): {
    suggest: (field: string, context: unknown) => Promise<StructuredSuggestion | null>;
  };
}

declare module '@/core/services/patient/PatientService' {
  export const PatientService: IPatientService;
  export type Patient = Patient;
  export type PatientCreate = PatientCreate;
}

declare module '@/modules/emr/services/PatientService' {
  export const PatientService: IPatientService;
  export type Patient = Patient;
  export type PatientCreate = PatientCreate;
}

declare module '@/core/services/visit/VisitService' {
  export const VisitService: {
    getAll(): Promise<Visit[]>;
    getVisitById(id: string): Promise<Visit | undefined>;
    updateVisit(id: string, updateData: Partial<Visit>): Promise<Visit>;
    scheduleVisit(visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit>;
    visitExists(id: string): Promise<boolean>;
    update(visit: Visit): Promise<void>;
    create(visit: Visit): Promise<void>;
  };
  export type Visit = Visit;
}

declare module '@/modules/emr/services/VisitService' {
  export const VisitService: {
    getAll(): Promise<Visit[]>;
    getVisitById(id: string): Promise<Visit | undefined>;
    updateVisit(id: string, updateData: Partial<Visit>): Promise<Visit>;
    scheduleVisit(visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit>;
    visitExists(id: string): Promise<boolean>;
    update(visit: Visit): Promise<void>;
    create(visit: Visit): Promise<void>;
  };
  export type Visit = Visit;
}

declare module '@/lib/utils' {
  import { type ClassValue } from 'clsx';
  export function cn(...inputs: ClassValue[]): string;
}

declare module '@/types/Evaluation' {
  export type PatientEval = PatientEval;
  
  export interface EvalResult {
    id: string;
    patientId: string;
    visitId: string;
    type: string;
    content: string;
    timestamp: string;
    source: string;
  }
}

// Declarar módulo para react-router-dom con RouteObject
declare module 'react-router-dom' {
  export interface RouteObject {
    path: string;
    element: React.ReactNode;
    children?: RouteObject[];
  }
}

// Declarar alias genéricos para resolución de importaciones
declare module '@/core/services/*';
declare module '@/core/contexts/*';
declare module '@/core/lib/*';
declare module '@/components/*';
declare module '@/modules/*';
declare module '@/pages/*';
declare module '@/types/*';
declare module '@/public-data/*';
declare module '@/utils/*';
declare module '@/mock/*';

declare module '@/mock/evalResults' {
  export interface EvalSource {
    name: string;
    year: string;
    url: string;
  }

  export interface EvalResult {
    id: string;
    patientId: string;
    visitId: string;
    evaluationType: 'diagnostico' | 'evaluacion' | 'tratamiento' | 'seguimiento';
    content: string;
    timestamp: string;
    suggestedByAI: boolean;
    acceptedByProfessional?: boolean;
    confidence?: number;
    sources?: EvalSource[];
  }

  const mockEvalResults: Record<string, EvalResult[]>;
  export default mockEvalResults;
} 