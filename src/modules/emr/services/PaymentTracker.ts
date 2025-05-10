import { z } from '@/types/zod-utils';

// Definición de estados de pago
const PaymentStatusSchema = z.enumValues([
  'pending',
  'completed',
  'cancelled',
  'refunded'
] as const);

type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

// Modelo de pago
export interface Payment {
  id: string;
  visitId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  method?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Servicio para gestionar pagos asociados a visitas médicas
 */
export class PaymentTracker {
  /**
   * Crear un nuevo registro de pago
   */
  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const now = new Date().toISOString();
    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      ...payment,
      createdAt: now,
      updatedAt: now
    };
    
    // Aquí iría la lógica de persistencia en BD
    
    return newPayment;
  }
  
  /**
   * Actualizar el estado de un pago
   */
  async updatePaymentStatus(visitId: string, status: PaymentStatus): Promise<Payment> {
    // Simulación para desarrollo
    const updatedPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      visitId,
      amount: 0,
      status,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Aquí iría la lógica de actualización en BD
    
    return updatedPayment;
  }
  
  /**
   * Obtener el pago de una visita
   */
  async getPaymentByVisitId(visitId: string): Promise<Payment | null> {
    // Simulación para desarrollo
    return null;
  }
  
  /**
   * Verificar si una visita tiene pago pendiente
   */
  async hasPaymentPending(visitId: string): Promise<boolean> {
    const payment = await this.getPaymentByVisitId(visitId);
    return payment?.status === 'pending';
  }
}

export class PaymentTrackerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'PaymentTrackerError';
  }
} 