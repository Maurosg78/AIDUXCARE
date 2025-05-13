import { ReactNode, CSSProperties  } from 'react';
import { Routes, Route, Outlet, useParams, useNavigate, useLocation, Link, Navigate, createBrowserRouter, RouterProvider } from '@/core/utils/router';

export interface LinkProps {
  children: ReactNode;
  to: string;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}

/**
 * Componente Link compatible con React Router
 * Proporciona una interfaz consistente para enlaces en la aplicación
 */
export const Link: React.FC<LinkProps> = ({ 
  children, 
  to, 
  onClick, 
  style, 
  className 
}) => {
  // Manejamos el onClick en una función de wrapper en lugar
  // de pasarlo directamente a RouterLink
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Construir un elemento anchor personalizado
  return (
    <span onClick={handleClick} style={{ cursor: 'pointer', ...style }} className={className}>
      <RouterLink to={to}>
        {children}
      </RouterLink>
    </span>
  );
};

export default Link; 