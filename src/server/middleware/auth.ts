import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/config/auth';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export const validateAdminAccess = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user || (session.user as any).role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
      }

      return handler(req, res);
    } catch (error) {
      console.error('Error en validación de acceso:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
}; 