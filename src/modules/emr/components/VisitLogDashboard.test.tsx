import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route, Outlet, useParams, useNavigate, useLocation, Link, Navigate, createBrowserRouter, RouterProvider } from '@/core/utils/router';
import VisitLogDashboard from './VisitLogDashboard';

// Mock de los módulos necesarios
vi.mock('langfuse', () => ({
  LangfuseClient: vi.fn().mockImplementation(() => ({
    getTraces: vi.fn().mockResolvedValue([
      {
        observations: [
          {
            id: 'evt1',
            type: 'form.update',
            startTime: '2023-10-15T14:30:00Z',
            metadata: {
              userId: 'user1',
              fields: { field1: 'value1', field2: 'value2' }
            }
          },
          {
            id: 'evt2',
            type: 'audio.review',
            startTime: '2023-10-15T15:00:00Z',
            metadata: {
              userId: 'user2',
              approved: true
            }
          },
          {
            id: 'evt3',
            type: 'pdf.export',
            startTime: '2023-10-15T15:30:00Z',
            metadata: {
              userId: 'user1',
              signed: true
            }
          },
          {
            id: 'evt4',
            type: 'mcp.context.build',
            startTime: '2023-10-15T16:00:00Z',
            metadata: {
              contextSize: 5
            }
          }
        ]
      }
    ])
  }))
}));

vi.mock('@/core/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { name: 'Dr. Test', email: 'test@example.com' }
    })
  }
}));

describe('VisitLogDashboard', () => {
  beforeEach(() => {
    // Restablecer todos los mocks
    vi.clearAllMocks();
  });

  it('renderiza el componente correctamente con eventos', async () => {
    render(
      <MemoryRouter initialEntries={['/visits/12345']}>
        <Routes>
          <Route path="/visits/:id" element={<VisitLogDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar estado de carga inicial
    expect(screen.getByText('Registro de Actividad')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner de carga

    // Esperar a que se carguen los eventos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Verificar que se muestran los grupos de eventos
    expect(screen.getByText('Actualización de formulario clínico')).toBeInTheDocument();
    expect(screen.getByText('Revisión de audio')).toBeInTheDocument();
    expect(screen.getByText('Exportación de PDF')).toBeInTheDocument();
    expect(screen.getByText('Creación de contexto MCP')).toBeInTheDocument();

    // Verificar que se muestran los resultados de eventos
    expect(screen.getByText('2 campos actualizados')).toBeInTheDocument();
    expect(screen.getByText('Audio revisado y aprobado')).toBeInTheDocument();
    expect(screen.getByText('PDF exportado y firmado digitalmente')).toBeInTheDocument();
    expect(screen.getByText('Contexto MCP creado: 5 elementos')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay eventos', async () => {
    // Sobreescribir el mock para que devuelva un array vacío
    vi.mocked(vi.fn().mockImplementation(() => ({
      getTraces: vi.fn().mockResolvedValue([])
    }))).mockReturnValueOnce({
      getTraces: vi.fn().mockResolvedValue([])
    });

    // Mock de fetch para que también falle el fallback local
    global.fetch = vi.fn().mockRejectedValue(new Error('No local logs'));

    render(
      <MemoryRouter initialEntries={['/visits/12345']}>
        <Routes>
          <Route path="/visits/:id" element={<VisitLogDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que termine la carga
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Verificar que se muestra el mensaje de no hay eventos
    expect(screen.getByText('No hay eventos registrados para esta visita')).toBeInTheDocument();
  });

  it('agrupa correctamente los eventos por tipo', async () => {
    render(
      <MemoryRouter initialEntries={['/visits/12345']}>
        <Routes>
          <Route path="/visits/:id" element={<VisitLogDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que termine la carga
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Verificar que cada grupo tiene el contador correcto
    const formUpdateGroup = screen.getByText('Actualización de formulario clínico').closest('div');
    const audioReviewGroup = screen.getByText('Revisión de audio').closest('div');
    const pdfExportGroup = screen.getByText('Exportación de PDF').closest('div');
    const mcpContextGroup = screen.getByText('Creación de contexto MCP').closest('div');

    // Verificar que cada grupo tiene el indicador "1"
    expect(formUpdateGroup).toHaveTextContent('1');
    expect(audioReviewGroup).toHaveTextContent('1');
    expect(pdfExportGroup).toHaveTextContent('1');
    expect(mcpContextGroup).toHaveTextContent('1');
  });
}); 