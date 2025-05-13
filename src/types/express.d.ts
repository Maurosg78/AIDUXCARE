import { Request, Response, NextFunction } from 'express';
import type { UserRole  } from '@/core/types';

// Amplía la definición Request para incluir propiedades adicionales
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
}

// Declaración global de express
declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
  
  export interface Response {
    status(code: number): this;
    json(body: any): this;
    send(body: any): this;
  }
  
  export interface NextFunction {
    (err?: any): void;
  }
  
  export function Router(): any;
  
  export default function createApplication(): any;
}

// Declaración para uuid
declare module 'uuid' {
  export function v4(): string;
}

// Tipos comunes de Express para referencia
export type ExpressRequest = Request;
export type ExpressResponse = Response;
export type ExpressNextFunction = NextFunction;

// Tipos personalizados para los handlers con async/await
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

// Tipos para rutas API comunes
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
} 