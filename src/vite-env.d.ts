/// <reference types="vite/client" />

// Declaración global para resolver problemas de importación
declare module '@/core/services/AuditLogService';
declare module '@/core/services/audit/AuditLogService';
declare module '@/core/context/AuthContext';
declare module '@/core/contexts/AuthContext';
declare module '@/core/config/routes';
declare module '@/core/lib/langfuse.client';
declare module '@/core/lib/supabaseClient';
declare module '@/hooks/useCopilot';
declare module '@/core/lib/langfuse.config';
declare module '@/core/types/supabase';
declare module '@/core/services/visit/VisitService';
declare module '@/core/services/patient/PatientService';
declare module '@/core/services';

// Declarar otros módulos que puedan estar causando problemas
declare module '@/core/services/*';
declare module '@/core/contexts/*';
declare module '@/core/lib/*';
declare module '@/components/*';
declare module '@/modules/*'; 