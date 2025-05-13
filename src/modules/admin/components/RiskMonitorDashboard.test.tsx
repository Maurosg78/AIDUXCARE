import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RiskMonitorDashboard from './RiskMonitorDashboard';

// Mock de los módulos necesarios
vi.mock('langfuse', () => ({
  Langfuse: vi.fn().mockImplementation(() => ({
    trace: {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'trace1',
            metadata: { 
              visitId: 'visit1',
              patientId: 'patient1',
              userId: 'user1',
              visitDate: '2023-10-15T14:30:00Z'
            },
            startTime: '2023-10-15T14:30:00Z'
          },
          {
            id: 'trace2',
            metadata: { 
              visitId: 'visit2',
              patientId: 'patient2',
              userId: 'user2',
              visitDate: '2023-10-16T10:00:00Z'
            },
            startTime: '2023-10-16T10:00:00Z'
          },
          {
            id: 'trace3',
            metadata: { 
              visitId: 'visit3',
              patientId: 'patient1',
              userId: 'user1',
              visitDate: '2023-10-17T09:00:00Z'
            },
            startTime: '2023-10-17T09:00:00Z'
          }
        ]
      })
    },
    observation: {
      list: vi.fn().mockImplementation(({ traceId }) => {
        // Simulamos diferentes estados de validación para las trazas
        if (traceId === 'trace1') {
          return Promise.resolve({
            data: [
              { id: 'obs1', type: 'form.update', startTime: '2023-10-15T14:35:00Z' },
              { 
                id: 'obs2', 
                type: 'audio.review', 
                startTime: '2023-10-15T14:40:00Z',
                metadata: { approved: false } // Checklist no aprobado
              }
              // Sin exportación PDF ni contexto MCP
            ]
          });
        } else if (traceId === 'trace2') {
          return Promise.resolve({
            data: [
              { id: 'obs3', type: 'form.update', startTime: '2023-10-16T10:05:00Z' },
              { 
                id: 'obs4', 
                type: 'audio.review', 
                startTime: '2023-10-16T10:10:00Z',
                metadata: { approved: true } // Checklist aprobado
              },
              { 
                id: 'obs5', 
                type: 'pdf.export', 
                startTime: '2023-10-16T10:15:00Z',
                metadata: { signed: false } // PDF sin firma
              }
              // Sin contexto MCP
            ]
          });
        } else {
          return Promise.resolve({
            data: [
              { id: 'obs6', type: 'form.update', startTime: '2023-10-17T09:05:00Z' },
              { 
                id: 'obs7', 
                type: 'audio.review', 
                startTime: '2023-10-17T09:10:00Z',
                metadata: { approved: true } // Checklist aprobado
              },
              { 
                id: 'obs8', 
                type: 'pdf.export', 
                startTime: '2023-10-17T09:15:00Z',
                metadata: { signed: true } // PDF firmado
              },
              { 
                id: 'obs9', 
                type: 'mcp.context.build', 
                startTime: '2023-10-17T09:20:00Z'
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
    in: vi.fn().mockReturnThis(),
    data: null,
    error: null
  }
}));

// Mock del método fetch para logs locales
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('risky-visits.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'local-visit1',
          date: '2023-10-10T10:00:00Z',
          patientId: 'patient3',
          patientName: 'Paciente Ejemplo 3',
          professionalId: 'user3',
          professionalName: 'Dr. Ejemplo 3',
          validations: {
            checklist: { checked: true, passed: false },
            export: { checked: true, passed: true },
            signature: { checked: true, passed: false },
            mcp: { checked: true, passed: false }
          },
          riskLevel: 'high',
          omissionCount: 3
        }
      ])
    });
  }
  return Promise.reject(new Error('No local logs available'));
});

describe('RiskMonitorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configurar mock de datos para Supabase
    vi.mocked(vi.fn().mockReturnThis().select).mockReturnThis();
    vi.mocked(vi.fn().mockReturnThis().in).mockReturnThis();
    
    // Mock para obtener profesionales
    vi.mocked(vi.fn().mockReturnThis().data)
      .mockReturnValueOnce([
        { id: 'user1', name: 'Dr. Test' },
        { id: 'user2', name: 'Dra. Ejemplo' },
        { id: 'user3', name: 'Dr. Ejemplo 3' }
      ])
      // Mock para obtener pacientes
      .mockReturnValueOnce([
        { id: 'patient1', name: 'Paciente 1' },
        { id: 'patient2', name: 'Paciente 2' },
        { id: 'patient3', name: 'Paciente 3' }
      ])
      // Mock para obtener nombres de profesionales
      .mockReturnValueOnce([
        { id: 'user1', name: 'Dr. Test' },
        { id: 'user2', name: 'Dra. Ejemplo' }
      ]);
  });

  it('renderiza correctamente el panel con las visitas de riesgo', async () => {
    render(<RiskMonitorDashboard />);

    // Verificar título
    expect(screen.getByText('Panel de Monitoreo de Riesgos')).toBeInTheDocument();
    
    // Verificar estado de carga
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que se muestran los filtros
    expect(screen.getByText('Esta semana')).toBeInTheDocument();
    expect(screen.getByText('Todos los profesionales')).toBeInTheDocument();
    
    // Verificar que se muestran los profesionales con visitas de riesgo
    expect(screen.getByText('Dr. Test')).toBeInTheDocument();
    expect(screen.getByText('Dra. Ejemplo')).toBeInTheDocument();
    
    // Verificar que se muestran las omisiones
    expect(screen.getByText('Sin validación')).toBeInTheDocument();
    expect(screen.getByText('Sin firma')).toBeInTheDocument();
    expect(screen.getByText('Sin MCP')).toBeInTheDocument();
  });

  it('filtra correctamente por profesional', async () => {
    render(<RiskMonitorDashboard />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Seleccionar filtro por profesional
    const select = screen.getByRole('combobox', { name: /profesionales/i });
    fireEvent.change(select, { target: { value: 'user1' } });
    
    // Verificar que solo se muestran las visitas del profesional seleccionado
    expect(screen.getByText('Paciente 1')).toBeInTheDocument();
    expect(screen.queryByText('Paciente 2')).not.toBeInTheDocument();
  });

  it('filtra correctamente por tipo de omisión', async () => {
    render(<RiskMonitorDashboard />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Seleccionar filtro por tipo de omisión (checklist)
    const checklistButton = screen.getByText('Sin validación');
    fireEvent.click(checklistButton);
    
    // Verificar que solo se muestran las visitas con checklist no validado
    expect(screen.getByText('Checklist')).toBeInTheDocument();
    // En nuestros datos de mock, solo la visita 1 tiene checklist no validado
    expect(screen.queryByText('Dra. Ejemplo')).not.toBeInTheDocument();
  });

  it('maneja correctamente la agrupación de profesionales', async () => {
    render(<RiskMonitorDashboard />);
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que los grupos están inicialmente cerrados
    expect(screen.queryByText('Paciente 1')).not.toBeInTheDocument();
    
    // Abrir grupo de Dr. Test
    const drTestGroup = screen.getByText('Dr. Test');
    fireEvent.click(drTestGroup);
    
    // Verificar que ahora se muestra el contenido del grupo
    expect(screen.getByText('Paciente 1')).toBeInTheDocument();
  });

  it('muestra datos de fallback cuando Langfuse no está disponible', async () => {
    // Forzar el uso de logs locales
    vi.mocked(vi.fn().mockImplementation(() => ({
      trace: {
        list: vi.fn().mockResolvedValue({ data: [] })
      }
    }))).mockReturnValueOnce({
      trace: {
        list: vi.fn().mockResolvedValue({ data: [] })
      }
    });
    
    render(<RiskMonitorDashboard />);
    
    // Esperar a que se carguen los datos (desde fallback)
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que se muestran los datos locales
    expect(screen.getByText('Paciente Ejemplo 3')).toBeInTheDocument();
  });
}); 