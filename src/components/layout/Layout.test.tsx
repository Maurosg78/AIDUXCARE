import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Layout } from './Layout';
import { Routes, Route, Outlet, useParams, useNavigate, useLocation, Link, Navigate, createBrowserRouter, RouterProvider } from '@/core/utils/router';

// Mock de los componentes internos
vi.mock('./Sidebar', () => ({
  Sidebar: ({ isOpen, setIsOpen }: any) => (
    <div data-testid="sidebar" className={isOpen ? 'open' : 'closed'}>
      Sidebar Mocked
      <button onClick={() => setIsOpen(false)} data-testid="close-sidebar">Close</button>
    </div>
  )
}));

vi.mock('./Header', () => ({
  Header: ({ isSidebarOpen, setIsSidebarOpen }: any) => (
    <div data-testid="header">
      Header Mocked
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} data-testid="toggle-sidebar">
        Toggle
      </button>
    </div>
  )
}));

vi.mock('./Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Mocked</div>
}));

// Mock del contexto de autenticación
vi.mock('@/core/context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    logout: vi.fn()
  })
}));

describe('Layout Component', () => {
  it('renderiza correctamente con Header, Sidebar y contenido principal', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div data-testid="content">Contenido principal</div>
        </Layout>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('permite alternar la visibilidad del sidebar', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Contenido de prueba</div>
        </Layout>
      </MemoryRouter>
    );
    
    // Inicialmente el sidebar está abierto (por valor predeterminado)
    expect(screen.getByTestId('sidebar')).toHaveClass('open');
    
    // Ahora cerramos el sidebar
    fireEvent.click(screen.getByTestId('close-sidebar'));
    expect(screen.getByTestId('sidebar')).toHaveClass('closed');
    
    // Lo volvemos a abrir
    fireEvent.click(screen.getByTestId('toggle-sidebar'));
    expect(screen.getByTestId('sidebar')).toHaveClass('open');
  });

  it('usa la clase bg-aidux-bone para el fondo principal', () => {
    const { container } = render(
      <MemoryRouter>
        <Layout>
          <div>Contenido</div>
        </Layout>
      </MemoryRouter>
    );
    
    // Verificar que el div principal tiene la clase bg-aidux-bone
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-aidux-bone');
  });
}); 