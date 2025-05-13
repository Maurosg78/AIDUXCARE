import { UserRole } from './index';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          avatar_url?: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      patients: {
        Row: {
          id: string;
          name: string;
          firstName: string;
          lastName: string;
          dateOfBirth: string;
          gender: string;
          email: string;
          phone: string;
          address: string;
          history: string[] | null;
          tags: string[] | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['patients']['Row']>;
      };
      visits: {
        Row: {
          id: string;
          patientId: string;
          professionalId: string;
          visitDate: string;
          status: string;
          reason: string;
          notes: string | null;
          diagnosticoFisioterapeutico: string | null;
          tratamientoPropuesto: string | null;
          paymentStatus: string | null;
          modalidad: string | null;
          precio: number | null;
          metadata: {
            visit_type?: string;
            duration_minutes?: number;
            location?: string;
            follow_up_required?: boolean;
          } | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Omit<Database['public']['Tables']['visits']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['visits']['Row']>;
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
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'timestamp'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: unknown;
    };
  }
} 