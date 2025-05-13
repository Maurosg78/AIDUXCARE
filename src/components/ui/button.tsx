import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'mint' | 'outline' | 'link' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    className = '', 
    variant = 'primary', 
    size = 'md',
    icon,
    ...props 
  }, ref) => {
    // Tamaños
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base'
    };
    
    // Estilos base para todos los botones
    const baseStyles = cn(
      'font-medium rounded-lg transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'inline-flex items-center justify-center',
      sizeClasses[size]
    );
    
    // Estilos específicos según la variante
    const variantStyles = {
      primary: 'bg-aidux-coral text-white hover:bg-aidux-coral/90 focus:ring-aidux-coral/30',
      secondary: 'bg-aidux-slate text-white hover:bg-aidux-slate/90 focus:ring-aidux-slate/30',
      mint: 'bg-aidux-mint text-aidux-slate hover:bg-aidux-mint/90 focus:ring-aidux-mint/30',
      ghost: 'bg-transparent text-aidux-slate hover:bg-aidux-gray/20 focus:ring-aidux-gray/20',
      outline: 'bg-transparent border border-aidux-gray text-aidux-slate hover:bg-aidux-gray/10 focus:ring-aidux-gray/30',
      link: 'bg-transparent text-aidux-teal hover:underline p-0 focus:ring-0'
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 