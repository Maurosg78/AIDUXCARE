import React from 'react';
import { cn } from '@/lib/utils';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'mint' | 'danger' | 'success' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'lg' | 'md' | 'none';
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    rounded = 'lg',
    isLoading = false,
    isFullWidth = false,
    leftIcon,
    rightIcon,
    type = 'button',
    disabled,
    ...props
  }, ref) => {
    // Tamaños
    const sizeClasses = {
      xs: 'text-xs py-1 px-2.5',
      sm: 'text-sm py-1.5 px-3',
      md: 'text-sm py-2 px-4',
      lg: 'text-base py-2.5 px-5'
    };

    // Esquinas redondeadas
    const roundedClasses = {
      none: 'rounded-none',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    };

    // Estilos para variantes
    const variantClasses = {
      primary: 'bg-aidux-coral text-white hover:bg-aidux-coral/90 focus:ring-aidux-coral/30',
      secondary: 'bg-aidux-slate text-white hover:bg-aidux-slate/90 focus:ring-aidux-slate/30',
      mint: 'bg-aidux-mint text-aidux-slate hover:bg-aidux-mint/90 focus:ring-aidux-mint/30',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300',
      success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300',
      info: 'bg-aidux-teal text-white hover:bg-aidux-teal/90 focus:ring-aidux-teal/30'
    };

    // Estado deshabilitado
    const disabledClasses = (disabled || isLoading) 
      ? 'opacity-60 cursor-not-allowed' 
      : '';

    // Ancho completo
    const widthClasses = isFullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'font-medium transition-colors inline-flex items-center justify-center',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'shadow-sm',
          sizeClasses[size],
          roundedClasses[rounded],
          variantClasses[variant],
          disabledClasses,
          widthClasses,
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        {children}
        
        {!isLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

BaseButton.displayName = 'BaseButton';

export default BaseButton; 