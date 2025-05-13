import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { AdaptedUserSession } from '@/types/backend-adapters';

export type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    name?: string | undefined;
    email?: string | undefined;
    role?: string | undefined;
  };
  session?: AdaptedUserSession;
}

/**
 * Middleware para validar que el usuario tenga rol de administrador
 */
export const validateAdminAccess = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user || ((session.user as any).role !== 'admin')) {
        return res.status(403).json({ 
          success: false,
          error: {
            message: 'No tienes permisos para acceder a este recurso',
            code: 'FORBIDDEN'
          }
        });
      }

      // Enriquecer la request con los datos del usuario
      (req as AuthenticatedRequest).user = {
        id: (session.user as any).id,
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        role: (session.user as any).role
      };
      
      (req as AuthenticatedRequest).session = session as unknown as AdaptedUserSession;

      return handler(req, res);
    } catch (error) {
      console.error('Error en validación de acceso:', error);
      return res.status(500).json({ 
        success: false,
        error: {
          message: 'Error interno del servidor',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
};

/**
 * Middleware para validar que el usuario esté autenticado
 */
export const validateAuthentication = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user) {
        return res.status(401).json({ 
          success: false,
          error: {
            message: 'Debes iniciar sesión para acceder a este recurso',
            code: 'UNAUTHORIZED'
          } 
        });
      }

      // Enriquecer la request con los datos del usuario
      (req as AuthenticatedRequest).user = {
        id: (session.user as any).id,
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        role: (session.user as any).role
      };
      
      (req as AuthenticatedRequest).session = session as unknown as AdaptedUserSession;

      return handler(req, res);
    } catch (error) {
      console.error('Error en validación de autenticación:', error);
      return res.status(500).json({ 
        success: false,
        error: {
          message: 'Error interno del servidor',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
}; 