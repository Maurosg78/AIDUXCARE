import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface LinkProps {
  to: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  [key: string]: any; // Para otras props como target, rel, etc.
}

/**
 * Componente Link compatible que funciona con React Router v6
 * y proporciona compatibilidad con props adicionales como className
 */
export const Link: React.FC<LinkProps> = ({ to, children, className, onClick, style, ...rest }) => {
  return (
    <RouterLink 
      to={to} 
      onClick={onClick}
      style={style}
      className={className}
      {...rest}
    >
      {children}
    </RouterLink>
  );
};

export default Link; 