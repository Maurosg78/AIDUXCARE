import { z } from 'zod';

const PaymentStatusSchema = z.enum(['pending', 'paid', 'cancelled', 'refunded']);

export interface Payment {
  id: string;
  visitId: string;
  patientId: string;
  amount: number;
  status: z.infer<typeof PaymentStatusSchema>;
  createdAt: string;
  updatedAt?: string;
}

export class PaymentTracker {
  private static STORAGE_KEY = 'payments';

  async createPaymentRecord(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      ...payment,
      createdAt: new Date().toISOString(),
    };

    const payments = await this.getPayments();
    payments.push(newPayment);
    localStorage.setItem(PaymentTracker.STORAGE_KEY, JSON.stringify(payments));

    return newPayment;
  }

  async getPayments(): Promise<Payment[]> {
    const paymentsJson = localStorage.getItem(PaymentTracker.STORAGE_KEY);
    return paymentsJson ? JSON.parse(paymentsJson) : [];
  }

  async getPaymentStatus(visitId: string): Promise<Payment | undefined> {
    const payments = await this.getPayments();
    return payments.find(p => p.visitId === visitId);
  }

  async updatePaymentStatus(visitId: string, status: z.infer<typeof PaymentStatusSchema>): Promise<Payment> {
    const payments = await this.getPayments();
    const index = payments.findIndex(p => p.visitId === visitId);

    if (index === -1) {
      throw new Error(`Pago no encontrado para la visita: ${visitId}`);
    }

    const updatedPayment = {
      ...payments[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    payments[index] = updatedPayment;
    localStorage.setItem(PaymentTracker.STORAGE_KEY, JSON.stringify(payments));

    return updatedPayment;
  }

  async getPendingPayments(): Promise<Payment[]> {
    const payments = await this.getPayments();
    return payments.filter(p => p.status === 'pending');
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