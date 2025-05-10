import { NextApiRequest as NextApiReq, NextApiResponse as NextApiRes } from 'next';
import { UserRole } from '@/core/types';

// Extender NextApiRequest para incluir el usuario autenticado
declare module 'next' {
  interface NextApiRequest extends NextApiReq {
    method: string;
    user?: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
  
  interface NextRequest {
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
    };
  }
}

// Tipos para respuestas API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// Tipo para el handler de API routes
export type ApiHandler<T = unknown> = (
  req: NextApiReq,
  res: NextApiRes<ApiResponse<T>>
) => Promise<void> | void;

// Re-exportar para facilitar su uso
export type { NextApiRequest, NextApiResponse } from 'next'; 