import { supabase } from '@/core/lib/supabase';
import type { AuditLogEvent } from '@/core/utils/mock';
import { getCurrentISODate } from '@/core/utils/mock';

/**
 * Cliente para registrar y obtener eventos de auditoría
 */
class AuditLogClientImpl {
  private events: AuditLogEvent[] = [];

  /**
   * Registra un evento de auditoría
   * @param eventData Datos del evento a registrar
   */
  async logEvent(eventData: Omit<AuditLogEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      // Crear el evento completo con ID y timestamp
      const event: AuditLogEvent = {
        ...eventData,
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: getCurrentISODate()
      };
      
      // En desarrollo, solo almacenamos en memoria
      this.events.unshift(event);
      
      // Log simulado
      console.log('[AuditLog] Event logged:', event);
    } catch (err) {
      console.error('Error al registrar evento de auditoría:', err);
    }
  }
  
  /**
   * Obtiene eventos de auditoría con filtros opcionales
   */
  async getEvents(options: { 
    resourceType?: string;
    resourceId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<AuditLogEvent[]> {
    try {
      // Filtrar los eventos en memoria según opciones
      let filteredEvents = [...this.events];
      
      if (options.resourceType) {
        filteredEvents = filteredEvents.filter(e => e.resource === options.resourceType);
      }
      
      if (options.resourceId) {
        filteredEvents = filteredEvents.filter(e => e.resourceId === options.resourceId);
      }
      
      if (options.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === options.userId);
      }
      
      if (options.startDate) {
        filteredEvents = filteredEvents.filter(e => 
          new Date(e.timestamp) >= options.startDate!
        );
      }
      
      if (options.endDate) {
        filteredEvents = filteredEvents.filter(e => 
          new Date(e.timestamp) <= options.endDate!
        );
      }
      
      // Limitar resultados si es necesario
      if (options.limit) {
        filteredEvents = filteredEvents.slice(0, options.limit);
      }
      
      return filteredEvents;
    } catch (err) {
      console.error('Error al obtener eventos de auditoría:', err);
      return [];
    }
  }
}

// Exportamos una instancia singleton
const auditLogClient = new AuditLogClientImpl();

// Exportamos también métodos estáticos para facilitar su uso
const AuditLogClient = {
  logEvent: (data: Omit<AuditLogEvent, 'id' | 'timestamp'>) => auditLogClient.logEvent(data),
  getEvents: (options?: Parameters<typeof auditLogClient.getEvents>[0]) => auditLogClient.getEvents(options || {})
};

export default AuditLogClient;

