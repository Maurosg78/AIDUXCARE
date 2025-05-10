import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { MCPContextView } from '../MCPContextView';
import { useMCPContext } from '../useMCPContext';

// Mock del hook useMCPContext
jest.mock('../useMCPContext');
const mockUseMCPContext = useMCPContext as jest.MockedFunction<typeof useMCPContext>;

// Mock de i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Datos de prueba
const mockContext = {
  patient_state: {
    age: 45,
    sex: 'M',
    history: ['HTA', 'DM2']
  },
  visit_metadata: {
    visit_id: '123',
    date: new Date().toISOString(),
    professional: 'dr.test@example.com'
  },
  rules_and_constraints: ['Regla 1', 'Regla 2'],
  system_instructions: 'Instrucciones de prueba',
  enrichment: {
    emr: {
      patient_data: {
        name: 'Juan Pérez',
        allergies: ['Penicilina'],
        chronicConditions: ['HTA'],
        medications: ['Enalapril']
      },
      visit_history: []
    }
  }
};

describe('MCPContextView', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderWithProviders = (visitId?: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/mcp/${visitId || '123'}`]}>
          <Routes>
            <Route path="/mcp/:id" element={<MCPContextView />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('muestra loader mientras carga', () => {
    mockUseMCPContext.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderWithProviders();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('muestra error cuando falla la carga', () => {
    const error = new Error('Error de prueba');
    mockUseMCPContext.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as any);

    renderWithProviders();
    expect(screen.getByRole('alert')).toHaveTextContent('Error de prueba');
  });

  it('muestra advertencia cuando no hay contexto', () => {
    mockUseMCPContext.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    renderWithProviders();
    expect(screen.getByRole('alert')).toHaveTextContent('mcp.errors.not_found');
  });

  it('renderiza correctamente el contexto MCP', async () => {
    mockUseMCPContext.mockReturnValue({
      data: mockContext,
      isLoading: false,
      error: null,
    } as any);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('45 años')).toBeInTheDocument();
      expect(screen.getByText('Penicilina')).toBeInTheDocument();
      expect(screen.getByText('HTA')).toBeInTheDocument();
      expect(screen.getByText('Enalapril')).toBeInTheDocument();
    });
  });

  it('llama a onError cuando hay un error', () => {
    const onError = jest.fn();
    const error = new Error('Error de prueba');
    mockUseMCPContext.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as any);

    render(<MCPContextView onError={onError} />);
    expect(onError).toHaveBeenCalledWith(error);
  });
}); 