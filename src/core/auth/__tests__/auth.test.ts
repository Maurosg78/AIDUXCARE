import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../../lib/supabaseClient';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth, AuthProvider } from '../../contexts/AuthContext';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('Autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('debería manejar el inicio de sesión exitoso', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com'
    };

    const mockSession = {
      user: mockUser
    };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null
    });

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession }
    });

    (supabase.from as jest.Mock)().select().eq().single.mockResolvedValueOnce({
      data: { role: 'professional' },
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('debería manejar errores de inicio de sesión', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid credentials')
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'wrong-password');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('debería manejar el cierre de sesión', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('debería persistir la sesión', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com'
    };

    const mockSession = {
      user: mockUser
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession }
    });

    (supabase.from as jest.Mock)().select().eq().single.mockResolvedValueOnce({
      data: { role: 'professional' },
      error: null
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitForNextUpdate();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.userRole).toBe('professional');
  });
}); 