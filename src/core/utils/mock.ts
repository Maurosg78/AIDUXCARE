/**
 * Utilidades para generar datos de prueba y mocks
 * Usado para desarrollo y pruebas de la aplicación
 */

import { v4 as uuidv4 } from 'uuid';

// Funciones helper para fechas
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

export function getRandomFutureDate(minDays: number = 1, maxDays: number = 30): string {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  now.setDate(now.getDate() + randomDays);
  return now.toISOString();
}

// Generador de IDs únicos
export function generateId(): string {
  return uuidv4();
}

// Mock para objetos Supabase
export const createSupabaseMock = () => {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          data: null,
          error: null
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        data: [],
        error: null
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: [], error: null })
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  };
};

// Valor de muro para detener propagación de errores de tipos
export function assertType<T>(value: any): T {
  return value as T;
}

// Mock para event sourcing
export class EventMock {
  static emit(eventName: string, data: any) {
    console.log(`[EventMock] Emitting ${eventName}:`, data);
    return Promise.resolve({ success: true });
  }
  
  static subscribe(eventName: string, callback: (data: any) => void) {
    console.log(`[EventMock] Subscribed to ${eventName}`);
    return () => console.log(`[EventMock] Unsubscribed from ${eventName}`);
  }
}

// Tipos para AuditLog
export interface AuditLogEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Cliente mock para AuditLog
export class AuditLogClientMock {
  static logEvent(data: Omit<AuditLogEvent, 'id' | 'timestamp'>): Promise<void> {
    console.log('[AuditLogMock] Log event:', data);
    return Promise.resolve();
  }
  
  static getEvents(): Promise<AuditLogEvent[]> {
    return Promise.resolve([]);
  }
} 