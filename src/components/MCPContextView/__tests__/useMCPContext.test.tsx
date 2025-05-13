import type { ReactNode } from 'react';
import type { MCPContext } from '../../../../core/mcp/CopilotContextBuilder';
import type { TestWrapperProps } from '@/types/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useMCPContext } from '../useMCPContext';
import { trackEvent } from '../../../core/lib/langfuse.client';

// Mock de axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock de trackEvent
jest.mock('../../../core/lib/langfuse.client');
const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>;

describe('useMCPContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: TestWrapperProps) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockContext: MCPContext = {
    patient_state: {
      age: 45,
      sex: 'M',
      history: ['HTA']
    },
    visit_metadata: {
      visit_id: '123',
      date: new Date().toISOString(),
      professional: 'test@example.com'
    },
    rules_and_constraints: ['Regla 1'],
    system_instructions: 'Test',
    enrichment: {}
  };

  it('retorna undefined si no hay visitId', async () => {
    const { result } = renderHook(() => useMCPContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBeFalsy();
    });
  });

  it('carga y valida el contexto correctamente', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: mockContext });

    const { result } = renderHook(() => useMCPContext('123'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockContext);
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('mcp_loaded', expect.any(Object));
  });

  it('maneja errores de la API', async () => {
    const error = new Error('Error de API');
    mockAxios.post.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useMCPContext('123'), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBe(error);
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('mcp_error', expect.any(Object));
  });

  it('maneja errores de validación', async () => {
    const invalidContext = { ...mockContext, patient_state: undefined };
    mockAxios.post.mockResolvedValueOnce({ data: invalidContext });

    const { result } = renderHook(() => useMCPContext('123'), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(mockTrackEvent).toHaveBeenCalledWith('mcp_error', expect.any(Object));
  });

  it('usa la caché para solicitudes repetidas', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: mockContext });

    const { result, rerender } = renderHook(() => useMCPContext('123'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockContext);
    });

    rerender();

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
}); 