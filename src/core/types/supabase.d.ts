/**
 * Definiciones de tipos para Supabase
 */

export interface GenericSchema {
  Tables: Record<string, any>;
  Views: Record<string, any>;
  Functions: Record<string, any>;
  Enums: Record<string, any>;
}

export type SchemaName = "public";

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          firstName: string;
          lastName: string;
          email: string | null;
          phone: string | null;
          birthDate: string | null;
          gender: string | null;
          sex: "M" | "F" | "O" | null;
          address: string | null;
          city: string | null;
          state: string | null;
          postalCode: string | null;
          country: string | null;
          age: number | null;
          rut: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          firstName: string;
          lastName: string;
          email?: string | null;
          phone?: string | null;
          birthDate?: string | null;
          gender?: string | null;
          sex?: "M" | "F" | "O" | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postalCode?: string | null;
          country?: string | null;
          age?: number | null;
          rut?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          firstName?: string;
          lastName?: string;
          email?: string | null;
          phone?: string | null;
          birthDate?: string | null;
          gender?: string | null;
          sex?: "M" | "F" | "O" | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postalCode?: string | null;
          country?: string | null;
          age?: number | null;
          rut?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      visits: {
        Row: {
          id: string;
          patientId: string;
          professionalId: string | null;
          date: string;
          visitDate: string | null;
          visitType: string | null;
          type: string | null;
          reason: string | null;
          status: "scheduled" | "completed" | "cancelled";
          location: string | null;
          notes: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          patientId: string;
          professionalId?: string | null;
          date: string;
          visitDate?: string | null;
          visitType?: string | null;
          type?: string | null;
          reason?: string | null;
          status: "scheduled" | "completed" | "cancelled";
          location?: string | null;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          patientId?: string;
          professionalId?: string | null;
          date?: string;
          visitDate?: string | null;
          visitType?: string | null;
          type?: string | null;
          reason?: string | null;
          status?: "scheduled" | "completed" | "cancelled";
          location?: string | null;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          userId: string;
          action: string;
          resource: string;
          resourceId: string;
          details: Record<string, unknown> | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          userId: string;
          action: string;
          resource: string;
          resourceId: string;
          details?: Record<string, unknown> | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          action?: string;
          resource?: string;
          resourceId?: string;
          details?: Record<string, unknown> | null;
          timestamp?: string;
        };
      };
      signatures: {
        Row: {
          id: string;
          visit_id: string;
          professional_id: string;
          hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          visit_id: string;
          professional_id: string;
          hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          visit_id?: string;
          professional_id?: string;
          hash?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Tipos auxiliares para simplificar el uso de Supabase
export type ContainsNull<T> = T extends (infer U)[] 
  ? ContainsNull<U> 
  : T extends object 
    ? { [K in keyof T]: ContainsNull<T[K]> } 
    : T | null;

// Simplificación de GetResult para evitar problemas de tipo
export type GetResult<T> = T[] | null;

export type SelectQueryError<Message extends string> = { error: true } & String; 