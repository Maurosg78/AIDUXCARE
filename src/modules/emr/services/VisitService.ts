import { z } from 'zod';
import { PaymentTracker } from './PaymentTracker.js';
import { StorageService } from './StorageService.js';

const VisitStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']);
const PaymentStatusSchema = z.enum(['pending', 'paid', 'cancelled', 'refunded']);
const ModalidadSchema = z.enum(['presencial', 'telematica']);

const VisitSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string(),
  professionalId: z.string(),
  professionalEmail: z.string().email(),
  scheduledDate: z.string().datetime(),
  duration: z.number().min(15).max(120).optional(),
  status: VisitStatusSchema,
  paymentStatus: PaymentStatusSchema,
  motivo: z.string(),
  modalidad: ModalidadSchema.optional(),
  precio: z.number().optional(),
  previousHistory: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.object({
    visit_type: z.string(),
    duration_minutes: z.number(),
    location: z.string().optional(),
    follow_up_required: z.boolean()
  }).optional()
});

// Esquema para crear una nueva visita
const CreateVisitSchema = VisitSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// Esquema para actualizar una visita
const UpdateVisitSchema = VisitSchema.partial().omit({
  id: true,
  createdAt: true,
});

// Tipos exportados
export type Visit = z.infer<typeof VisitSchema>;
export type CreateVisit = Omit<Visit, 'id' | 'createdAt' | 'status'> & { status?: z.infer<typeof VisitStatusSchema> };
export type UpdateVisit = Partial<Omit<Visit, 'id' | 'createdAt'>>;

// Códigos de error tipados
export const VisitErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type VisitErrorCode = typeof VisitErrorCodes[keyof typeof VisitErrorCodes];

// Error personalizado para el servicio
export class VisitServiceError extends Error {
  constructor(
    message: string,
    public readonly code: VisitErrorCode,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'VisitServiceError';
  }
}

// Funciones auxiliares
const validateResponse = async <T>(
  response: Response,
  schema: z.ZodType<T>
): Promise<T> => {
  if (!response.ok) {
    if (response.status === 404) {
      throw new VisitServiceError(
        'Recurso no encontrado',
        VisitErrorCodes.NOT_FOUND
      );
    }
    throw new VisitServiceError(
      `Error de API: ${response.statusText}`,
      VisitErrorCodes.API_ERROR
    );
  }

  try {
    const data = await response.json();
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new VisitServiceError(
        'Error de validación de datos',
        VisitErrorCodes.VALIDATION_ERROR,
        error
      );
    }
    throw new VisitServiceError(
      'Error al procesar respuesta',
      VisitErrorCodes.UNKNOWN_ERROR,
      error
    );
  }
};

export class VisitService {
  private static paymentTracker = new PaymentTracker();
  private static STORAGE_KEY = 'visits';

  static async getAll(): Promise<Visit[]> {
    try {
      const visits = await StorageService.load<Visit[]>(this.STORAGE_KEY) || [];
      return visits.map(visit => VisitSchema.parse(visit));
    } catch (error) {
      console.error('Error al obtener visitas:', error);
      throw error;
    }
  }

  static async scheduleVisit(visitData: CreateVisit): Promise<Visit> {
    try {
      const newVisit: Visit = {
        id: crypto.randomUUID(),
        ...visitData,
        status: visitData.status || 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const validatedVisit = VisitSchema.parse(newVisit);

      const visits = await this.getAll();
      visits.push(validatedVisit);
      await StorageService.save(this.STORAGE_KEY, visits);

      if (validatedVisit.paymentStatus === 'paid' && validatedVisit.precio) {
        await this.paymentTracker.createPaymentRecord({
          visitId: validatedVisit.id,
          patientId: validatedVisit.patientId,
          amount: validatedVisit.precio,
          status: 'paid',
        });
      }

      return validatedVisit;
    } catch (error) {
      console.error('Error al agendar visita:', error);
      throw error;
    }
  }

  static async getVisitById(id: string): Promise<Visit | undefined> {
    try {
      const visits = await this.getAll();
      const visit = visits.find(v => v.id === id);
      return visit ? VisitSchema.parse(visit) : undefined;
    } catch (error) {
      console.error('Error al obtener visita por ID:', error);
      throw error;
    }
  }

  static async updateVisit(visitId: string, updateData: UpdateVisit): Promise<Visit> {
    try {
      const visits = await this.getAll();
      const index = visits.findIndex(v => v.id === visitId);
      
      if (index === -1) {
        throw new Error(`Visita no encontrada: ${visitId}`);
      }

      const updatedVisit = {
        ...visits[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const validatedVisit = VisitSchema.parse(updatedVisit);
      visits[index] = validatedVisit;
      await StorageService.save(this.STORAGE_KEY, visits);

      return validatedVisit;
    } catch (error) {
      console.error('Error al actualizar visita:', error);
      throw error;
    }
  }

  static async getProfessionalPendingVisits(professionalEmail: string): Promise<Visit[]> {
    try {
      const visits = await this.getAll();
      return visits.filter(v => 
        v.professionalEmail === professionalEmail && 
        v.status === 'scheduled' &&
        new Date(v.scheduledDate) > new Date()
      );
    } catch (error) {
      console.error('Error al obtener visitas pendientes del profesional:', error);
      throw error;
    }
  }

  static async deleteVisit(id: string): Promise<boolean> {
    try {
      const visits = await this.getAll();
      const filteredVisits = visits.filter(v => v.id !== id);
      
      if (filteredVisits.length === visits.length) {
        return false;
      }

      await StorageService.save(this.STORAGE_KEY, filteredVisits);
      return true;
    } catch (error) {
      console.error('Error al eliminar visita:', error);
      throw error;
    }
  }
}

export default VisitService;
