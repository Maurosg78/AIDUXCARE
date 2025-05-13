import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route, Outlet, useParams, useNavigate, useLocation, Link, Navigate, createBrowserRouter, RouterProvider } from '@/core/utils/router';
import PatientAuditDashboard from './PatientAuditDashboard';

// Mock de los módulos necesarios
vi.mock('langfuse', () => ({
  Langfuse: vi.fn().mockImplementation(() => ({
    trace: {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'trace1',
            metadata: { 
              patientId: 'patient1',
              visitId: 'visit1',
              visitDate: '2023-10-15T14:30:00Z'
            },
            startTime: '2023-10-15T14:30:00Z'
          },
          {
            id: 'trace2',
            metadata: { 
              patientId: 'patient1',
              visitId: 'visit2',
              visitDate: '2023-05-20T10:00:00Z'
            },
            startTime: '2023-05-20T10:00:00Z'
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
                metadata: { fields: { field1: 'value1' } }
              },
              {
                id: 'obs2',
                type: 'audio.review',
                startTime: '2023-10-15T14:40:00Z',
                metadata: { approved: true }
              },
              {
                id: 'obs3',
                type: 'pdf.export',
                startTime: '2023-10-15T14:45:00Z',
                metadata: { signed: true }
              },
              {
                id: 'obs4',
                type: 'mcp.context.build',
                startTime: '2023-10-15T14:50:00Z',
                metadata: { contextSize: 5 }
              }
            ]
          });
        } else {
          return Promise.resolve({
            data: [
              {
                id: 'obs5',
                type: 'form.update',
                startTime: '2023-05-20T10:05:00Z',
                metadata: { fields: { field2: 'value2' } }
              },
              {
                id: 'obs6',
                type: 'audio.review',
                startTime: '2023-05-20T10:10:00Z',
                metadata: { approved: false }
              },
              {
                id: 'obs7',
                type: 'pdf.export',
                startTime: '2023-05-20T10:15:00Z',
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
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: {
        id: 'patient1',
        name: 'Paciente Ejemplo',
        birthDate: '1980-05-15',
        email: 'paciente@example.com',
        gender: 'M'
      },
      error: null
    })
  }
}));

// Global fetch mock para logs locales
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('patient-visits-')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'visit3',
          date: '2022-11-20T09:00:00Z',
          hasAudioReview: true,
          isAudioApproved: true,
          hasPdfExport: true,
          isPdfSigned: true,
          hasMcpContext: false,
          events: [
            {
              id: 'local1',
              type: 'form.update',
              timestamp: '2022-11-20T09:00:00Z'
            },
            {
              id: 'local2',
              type: 'audio.review',
              timestamp: '2022-11-20T09:10:00Z',
              details: { approved: true }
            }
          ]
        }
      ])
    });
  } else if (url.includes('patient-')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 'patient1',
        name: 'Paciente Local',
        birthDate: '1985-10-20'
      })
    });
  }
  return Promise.reject(new Error('No local logs'));
});

describe('PatientAuditDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el componente correctamente con datos del paciente', async () => {
    render(
      <MemoryRouter initialEntries={['/patients/patient1']}>
        <Routes>
          <Route path="/patients/:patientId" element={<PatientAuditDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar título del dashboard
    expect(screen.getByText('Historial de Visitas del Paciente')).toBeInTheDocument();
    
    // Verificar estado de carga inicial
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que se muestran los datos del paciente
    expect(screen.getByText('Paciente Ejemplo')).toBeInTheDocument();
  });

  it('agrupa las visitas por año correctamente', async () => {
    render(
      <MemoryRouter initialEntries={['/patients/patient1']}>
        <Routes>
          <Route path="/patients/:patientId" element={<PatientAuditDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar grupos por año
    expect(screen.getByText('Año 2023')).toBeInTheDocument();
    expect(screen.getByText('2 visitas')).toBeInTheDocument();
    
    // Verificar fechas de visitas
    expect(screen.getByText(/Visita 15 oct 2023/)).toBeInTheDocument();
    expect(screen.getByText(/Visita 20 may 2023/)).toBeInTheDocument();
  });

  it('muestra correctamente los indicadores de estado de la visita', async () => {
    render(
      <MemoryRouter initialEntries={['/patients/patient1']}>
        <Routes>
          <Route path="/patients/:patientId" element={<PatientAuditDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar indicadores de estado para la primera visita (todos completos)
    expect(screen.getAllByText('Audio validado')[0]).toBeInTheDocument();
    expect(screen.getAllByText('PDF firmado')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Contexto MCP')[0]).toBeInTheDocument();
    
    // Verificar indicadores de estado para la segunda visita (audio y PDF sin validar)
    expect(screen.getByText('Falta audio validado')).toBeInTheDocument();
    expect(screen.getByText('Falta pdf firmado')).toBeInTheDocument();
  });

  it('expande y colapsa detalles de visita al hacer clic', async () => {
    render(
      <MemoryRouter initialEntries={['/patients/patient1']}>
        <Routes>
          <Route path="/patients/:patientId" element={<PatientAuditDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar que los detalles no están visibles inicialmente
    expect(screen.queryByText('Detalles de eventos')).not.toBeInTheDocument();
    
    // Hacer clic en la primera visita
    fireEvent.click(screen.getByText(/Visita 15 oct 2023/));
    
    // Verificar que ahora son visibles los detalles
    expect(screen.getByText('Detalles de eventos')).toBeInTheDocument();
    expect(screen.getByText('✓ Audio aprobado')).toBeInTheDocument();
    expect(screen.getByText('✓ Documento firmado digitalmente')).toBeInTheDocument();
    
    // Hacer clic nuevamente para contraer
    fireEvent.click(screen.getByText(/Visita 15 oct 2023/));
    
    // Verificar que los detalles ya no están visibles
    expect(screen.queryByText('Detalles de eventos')).not.toBeInTheDocument();
  });

  it('maneja correctamente el caso sin visitas', async () => {
    // Modificar el mock para simular que no hay visitas
    vi.mocked(vi.fn().mockImplementation(() => ({
      trace: {
        list: vi.fn().mockResolvedValue({
          data: []
        })
      }
    }))).mockReturnValueOnce({
      trace: {
        list: vi.fn().mockResolvedValue({
          data: []
        })
      }
    });
    
    // Modificar el fetch mock para que falle también
    vi.mocked(global.fetch).mockImplementationOnce(() => 
      Promise.reject(new Error('No logs available'))
    );
    
    render(
      <MemoryRouter initialEntries={['/patients/patient1']}>
        <Routes>
          <Route path="/patients/:patientId" element={<PatientAuditDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verificar mensaje de no hay visitas
    expect(screen.getByText('No hay visitas registradas para este paciente')).toBeInTheDocument();
  });
}); 