import { NextApiRequest as NextApiReq, NextApiResponse as NextApiRes } from 'next';
import type { UserRole  } from '@/core/types';

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
}

// Extender NextRequest para incluir nextUrl
declare module 'next/server' {
  interface NextRequest {
    nextUrl: URL;
    url: string;
    cookies: Map<string, string>;
    geo?: {
      city?: string;
      country?: string;
      region?: string;
    };
    ip?: string;
    method: string;
    headers: Headers;
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