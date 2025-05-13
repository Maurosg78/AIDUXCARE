import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfessionalAuditDashboard from './ProfessionalAuditDashboard';

// Mock de los módulos necesarios
vi.mock('langfuse', () => ({
  Langfuse: vi.fn().mockImplementation(() => ({
    trace: {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'trace1',
            metadata: { 
              userId: 'user1',
              visitId: 'visit1'
            },
            startTime: '2023-10-15T14:30:00Z'
          },
          {
            id: 'trace2',
            metadata: { 
              userId: 'user1',
              visitId: 'visit2'
            },
            startTime: '2023-10-16T10:00:00Z'
          }
        ]
      })
    },
    observation: {
      list: vi.fn().mockImplementation(({ traceId }) => {
        if (traceId === 'trace1') {
          return Promise.resolve({
            data: [
              {
                id: 'obs1',
                type: 'form.update',
                startTime: '2023-10-15T14:35:00Z',
                metadata: { fields: { field1: 'value1', field2: 'value2' } }
              },
              {
                id: 'obs2',
                type: 'audio.review',
                startTime: '2023-10-15T14:40:00Z',
                metadata: { approved: true }
              }
            ]
          });
        } else {
          return Promise.resolve({
            data: [
              {
                id: 'obs3',
                type: 'form.update',
                startTime: '2023-10-16T10:05:00Z',
                metadata: { fields: { field3: 'value3' } }
              },
              {
                id: 'obs4',
                type: 'pdf.export',
                startTime: '2023-10-16T10:10:00Z',
                metadata: { signed: false }
              }
            ]
          });
        }
      })
    }
  }))
}));

vi.mock('@/core/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    data: null,
    error: null
  }
}));

// Global fetch mock para logs locales
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('user-')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'local1',
          type: 'form.update',
          visitId: 'visit3',
          timestamp: '2023-11-20T09:00:00Z'
        },
        {
          id: 'local2',
          type: 'audio.review',
          visitId: 'visit3',
          timestamp: '2023-11-20T09:10:00Z',
          details: { approved: true }
        }
      ])
    });
  }
  return Promise.reject(new Error('No local logs'));
});

describe('ProfessionalAuditDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configurar el mock de Supabase para devolver datos
    vi.mocked(vi.fn().mockReturnThis().data).mockReturnValue([
      { id: 'user1', name: 'Dr. Test', email: 'test@example.com', role: 'doctor' },
      { id: 'user2', name: 'Enfermera Ejemplo', email: 'enfermera@example.com', role: 'nurse' }
    ]);
  });

  it('renderiza el componente correctamente con lista de profesionales', async () => {
    render(<ProfessionalAuditDashboard />);

    // Verificar título del dashboard
    expect(screen.getByText('Auditoría por Profesional')).toBeInTheDocument();
    
    // Verificar estado de carga inicial
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Esperar a que se carguen los profesionales y las estadísticas
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que el selector de profesionales contiene opciones
    const selector = screen.getByLabelText('Seleccionar Profesional');
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveValue('user1'); // Primer usuario seleccionado por defecto
  });

  it('muestra estadísticas correctas al seleccionar un profesional', async () => {
    render(<ProfessionalAuditDashboard />);
    
    // Esperar a que se carguen los datos iniciales
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que se muestran las estadísticas
    expect(screen.getByText('Total Visitas')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 visitas del mock
    
    // Verificar categorías de eventos
    expect(screen.getByText('Actualización de formularios')).toBeInTheDocument();
    expect(screen.getByText('Revisión de audio')).toBeInTheDocument();
    expect(screen.getByText('Exportación de PDF')).toBeInTheDocument();
    
    // Verificar contadores de eventos
    expect(screen.getByText('2 eventos')).toBeInTheDocument(); // 2 eventos form.update
    expect(screen.getByText('1 eventos')).toBeInTheDocument(); // 1 evento audio.review
    expect(screen.getByText('1 eventos')).toBeInTheDocument(); // 1 evento pdf.export
  });

  it('cambia las estadísticas al seleccionar otro profesional', async () => {
    // Modificar el mock para el segundo profesional
    vi.mocked(vi.fn().mockImplementation(() => ({
      trace: {
        list: vi.fn().mockResolvedValue({
          data: [] // Sin trazas, usará los logs locales
        })
      }
    }))).mockReturnValueOnce({
      trace: {
        list: vi.fn().mockResolvedValue({
          data: []
        })
      }
    });
    
    render(<ProfessionalAuditDashboard />);
    
    // Esperar a que se carguen los datos iniciales
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Cambiar al segundo profesional
    const selector = screen.getByLabelText('Seleccionar Profesional');
    fireEvent.change(selector, { target: { value: 'user2' } });
    
    // Verificar que se está cargando
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Esperar a que se carguen los nuevos datos (usará los logs locales)
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que se muestran las estadísticas de los logs locales
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 visita de los logs locales
  });

  it('maneja correctamente el caso de error al cargar datos', async () => {
    // Modificar el mock para simular un error
    vi.mocked(vi.fn().mockReturnThis().error).mockReturnValueOnce({
      message: 'Error de autenticación'
    });
    
    render(<ProfessionalAuditDashboard />);
    
    // Esperar a que se procese el error
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que se muestra el mensaje de error
    expect(screen.getByText('No se pudieron cargar los profesionales del sistema')).toBeInTheDocument();
  });
}); 