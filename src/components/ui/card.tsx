import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'outline';
}

export function Card({ className, children, variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-aidux-gray/20 shadow-sm',
    highlight: 'bg-white border border-aidux-teal/30 shadow-sm',
    outline: 'bg-transparent border border-aidux-gray/30 shadow-none'
  };

  return (
    <div className={cn("rounded-lg", variantStyles[variant], className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-aidux-gray/20", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn("text-lg font-medium text-aidux-slate", className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-aidux-gray mt-1", className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn("px-6 py-4 bg-aidux-bone border-t border-aidux-gray/20 rounded-b-lg", className)}>
      {children}
    </div>
  );
} 