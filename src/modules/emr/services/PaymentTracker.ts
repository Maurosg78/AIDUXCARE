

// Definición de estados de pago usando enum para type-safety
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'refunded' | 'canceled';

// Modelo de pago
export interface Payment {
  id: string;
  patientId: string;
  visitId: string;
  amount: number;
  status: PaymentStatus;
  method?: string;
  date: string;
  dueDate?: string;
  notes?: string;
}

/**
 * Servicio para gestionar pagos asociados a visitas médicas
 */
export class PaymentTracker {
  private payments: Payment[] = [];

  constructor() {
    // Inicialización del tracker
  }

  addPayment(payment: Payment): void {
    // Validación básica
    if (!payment.id || !payment.patientId || !payment.visitId) {
      throw new Error('Datos de pago incompletos');
    }
    this.payments.push(payment);
  }

  updatePaymentStatus(paymentId: string, newStatus: PaymentStatus): boolean {
    const index = this.payments.findIndex(p => p.id === paymentId);
    if (index === -1) return false;
    
    // Asegurarnos de que el elemento existe antes de actualizar
    const payment = this.payments[index];
    if (payment) {
      payment.status = newStatus;
      return true;
    }
    return false;
  }

  getPatientPayments(patientId: string): Payment[] {
    return this.payments.filter(p => p.patientId === patientId);
  }

  getVisitPayment(visitId: string): Payment | undefined {
    return this.payments.find(p => p.visitId === visitId);
  }

  getOverduePayments(): Payment[] {
    const today = new Date();
    return this.payments.filter(p => 
      p.status === 'pending' && 
      p.dueDate && 
      new Date(p.dueDate) < today
    );
  }

  calculateTotalRevenue(): number {
    return this.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getPaymentsByStatus(status: PaymentStatus): Payment[] {
    return this.payments.filter(p => p.status === status);
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